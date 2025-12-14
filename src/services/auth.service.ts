import { UserRepository } from "../repositories/mongo/user.repository.ts";
import { FindAddressDTO, FindUserDTO, LoginUserDTO, VerifyCodeDTO } from "../dto/user.dto.ts";
import jwt from "jsonwebtoken"
import { IUser } from "../types/interfaces/user.interface.ts";
import { errorHandler } from "../utils/error_handler.ts";
import createError from "http-errors"
import { User } from "../models/user.model.ts";
import httpError from "http-errors"
import { generateRandomCode } from "../utils/generate_random_code.ts";
import bcrypt from "bcrypt"
import { UserCacheRepository } from "../repositories/redis/user.cache.repository.ts";
import { Logger } from "../utils/logger.ts";
import { basename } from "path";
import { RabbitMQService } from "../rabbitmq/rabbitmq.ts";
import { VerifiedUser } from "../dto/events.dto.ts";


export class AuthService {
    private readonly userCacheRepository: UserCacheRepository = new UserCacheRepository()
    private readonly userRepository: UserRepository = new UserRepository()
    constructor() {

    }

    async loginUser(data: LoginUserDTO): Promise<string| void> {
        try {
            const user = await this.userRepository.findUserByEmail(data.email)
            if (!user) {
                throw createError.NotFound(`user with email ${data.email} wasn't found`)
            }
            const compare: boolean = await user.comparePassword(data.password)
            const payload: IUser = {
                id: user._id.toString(),
                role: user.role,
                updatedAt: user.updatedAt
            }
            const token = jwt.sign(payload, process.env.SECRET as string, {expiresIn: "72h"})
            if (compare) {
                return token
            } else {
                throw createError.Unauthorized("user's password is wrong")
            }
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async verifyUserCode(data: VerifyCodeDTO, id:string): Promise<void> {
        try {
            const user = await this.userRepository.findUserById(id) as User// i don't need to check again if user exist
            if (!user.verified) {
                const compare = await user.compareCode(data.code)
                if (compare) {
                    await this.userRepository.verifyUser(id)
                    // const user = await this.userRepository.findUserById(id)
                    // const userDto = new FindUserDTO(
                    //     user._id,
                    //     user.name,
                    //     user.email,
                    //     user.role,
                    //     user.dateOfBirth,
                    //     user.active, 
                    //     new FindAddressDTO(user.address.street, user.address.number, user.address.neighborhood, user.address.city, user.address.state),
                    //     user.verified,
                    //     user.createdAt,
                    //     user.updatedAt
                    // )
                    // queueMicrotask(() => {
                    //     this.userCacheRepository
                    //         .createUser(userDto)
                    //         .catch(err => Logger.error(err, {file: basename(import.meta.url)}))
                    // })
                    // RabbitMQService.publishVerifiedUser(new VerifiedUser(userDto.id, userDto.name, userDto.email, userDto.updatedAt))
                    return
                } else {
                    throw httpError.BadRequest("your code is wrong")
                }
            }
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async getNewUserCode(id: string): Promise<void> {
        try {
            const code = await generateRandomCode()
            const codeHash = await bcrypt.hash(code, 10)
            await this.userRepository.updateCode(id, codeHash)
        } catch (err) {
            throw errorHandler(err)
        }
    }
}
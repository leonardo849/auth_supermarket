import { UserRepository } from "../repositories/mongo/user.repository.ts";
import { FindAddressDTO, FindUserDTO, LoginUserDTO, VerifyCodeDTO } from "../dto/user.dto.ts";
import jwt from "jsonwebtoken"
import { IUser } from "../types/interfaces/user.interface.ts";
import { errorHandler } from "../utils/errors/error_handler.ts";
import createError from "http-errors"
import { User } from "../models/user.model.ts";
import httpError from "http-errors"
import { generateRandomCode } from "../utils/crypto/generate_random_code.ts";
import bcrypt from "bcrypt"
import { Roles } from "../types/enums/roles.ts";
import { UserCacheRepository } from "../repositories/redis/user.cache.repository.ts";
import { Logger } from "../utils/logger/logger.ts";
import { basename } from "path";
import { RabbitMQService } from "../rabbitmq/rabbitmq.ts";
import { ProductClient } from "../integrations/product/product.client.ts";



export class AuthService {
    private readonly userCacheRepository: UserCacheRepository = new UserCacheRepository()
    private readonly file: string = basename(import.meta.url)
    private readonly productClient: ProductClient = new ProductClient()
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
            const payload: Omit<IUser, "token_created_at"> = {
                id: user._id.toString(),
                role: user.role
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
    async updateEmailWithNotificationToVerificationHasBeenSent(emails: string[]): Promise<void> {
        try {
            const updatedQuantity = await this.userRepository.updateMany({email: {$in: emails}}, {$set: {emailWithNotificationToVerificationHasBeenSent: true}})
            if (updatedQuantity === 0) {
                throw new Error("no user was updated")
            }
            return
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw err
        }
    }
    async verifyUserCode(data: VerifyCodeDTO, id:string): Promise<void> {
        try {
            const user = await this.userRepository.findUserById(id) as User// i don't need to check again if user exist
            if (!user.verified) {
                const compare = await user.compareCode(data.code)
                if (compare) {
                    await this.userRepository.updateOneById(user._id, {
                        $set: {
                            authUpdatedAt: Date.now(),
                            verified: true,
                        },
                        $unset: {
                            code: "",
                            emailWithNotificationToVerificationHasBeenSent: "",
                            codeGeneratedAt: "",
                        }
                    })
                    setImmediate(() => {
                        this.setUserInCache(id)
                    })
                    return
                } else {
                    throw httpError.BadRequest("your code is wrong")
                }
            }
        } catch (err: any) {
            throw errorHandler(err)
        }
    }

    async expireCodes() {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            await this.userRepository.updateMany({codeGeneratedAt: {$lte: fiveMinutesAgo}}, {$unset: {code: "", codeGeneratedAt: ""}})
            const emails = await this.userRepository.findUnverifiedUsersEmailIn(fiveMinutesAgo)
            if (emails.length > 0) {
                RabbitMQService.publishCodeExpired(emails)
                Logger.info({file: this.file}, "emails expired code were sent")
            }
            Logger.info({file: this.file},"expire codes was used")
        } catch(err: any) {
            throw errorHandler(err)
        }
    }

    async changeUserRoleById(id: string, role: Roles, token: string): Promise<void> {
        try {
            const user = await this.userRepository.findUserById(id)
            if (!user) {
                throw httpError.NotFound("user not found")
            }
            if (!user.verified) {
                throw httpError.BadRequest("that user isn't verified")
            }
            const res = await this.productClient.CheckIfUserIsInErrors(token, id)
            if (!res.allowed) {
                throw httpError.UnprocessableEntity(`user with id ${id} is in error in product service. try to update it later`)
            }
            const sucess = await this.userRepository.updateOneById(id, {$set:{role: role, authUpdatedAt: Date.now()}})
            if (sucess && role === Roles.CUSTOMER) {
                RabbitMQService.publishDeletedWorker({id: id})   
            }
            if (!sucess) {
                throw httpError.InternalServerError("it wasn't possible to update that user")
            }
            setImmediate(() => {
                this.setUserInCache(id)
            })
        } catch (err: any) {
            throw errorHandler(err)
        }
        
    }
    async getNewUserCode(id: string): Promise<void> {
        try {
            const code = await generateRandomCode()

            const codeHash = await bcrypt.hash(code, 10)
            await this.userRepository.updateOneById(id, {$set:{code: codeHash,codeGeneratedAt: Date.now()}})
            const user = await this.userRepository.findUserById(id)
            if (!user) {
                throw httpError.NotFound(`user with id ${id} wasn't found`)
            }
            RabbitMQService.publishNewCode(user.email, code)
        } catch (err) {
            throw errorHandler(err)
        }
    }
    private async setUserInCache(id: string) {
        try {
                const searchedUser = await this.userRepository.findUserById(id)
                if (!searchedUser) {
                    throw new Error(`user with id ${id} wasn't found`)
                }
                const newUserDTO = new FindUserDTO(
                searchedUser._id,
                searchedUser.name,
                searchedUser.email,
                searchedUser.role,
                searchedUser.dateOfBirth,
                searchedUser.active,
                searchedUser.address,
                searchedUser.verified,
                searchedUser.createdAt,
                searchedUser.updatedAt)
                await this.userCacheRepository.setUser(newUserDTO, searchedUser.authUpdatedAt)
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw err
        }
    }
    async deleteUnverifiedUsers() {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            const usersNotVerfiied = await this.userRepository.findAllUsers({verified: false, emailWithNotificationToVerificationHasBeenSent: true, createdAt: {
                $lte: oneDayAgo
            }})
            await this.userRepository.deleteMany({verified: false, emailWithNotificationToVerificationHasBeenSent: true, createdAt: {
                $lte: oneDayAgo
            }})
            const idUsers: string[]  = usersNotVerfiied.map(element => element._id)
            await this.userCacheRepository.deleteUsers(idUsers)
            
        } catch (err: any) {
           Logger.error(err, {file: this.file})
           throw err
        }
    }
    async updateProductServiceValue(id: string) {
        try {
            const user = await this.userRepository.findUserById(id)
            if (!user) {
                throw new httpError.NotFound(`user with id ${id} wasn't found`)
            }
            await this.userRepository.updateOneById(id, {$set:{services: {productService: true}}})
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw err
        }
    }
    async findUneverifiedUsersEmail(): Promise<string[]> {
        try {
            const twentyTwoHoursAgo = new Date(Date.now() - 22 * 60 * 60 * 1000)
            const users = await this.userRepository.findAllUsers({verified: false, emailWithNotificationToVerificationHasBeenSent: false, createdAt: {$lte: twentyTwoHoursAgo}})
            const emails: string[] = []
            for (const u of users) {
                emails.push(u.email)
            }
            return emails
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
}
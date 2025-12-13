import { UserRepository } from "../repositories/mongo/user.repository.ts";
import { LoginUserDTO } from "../dto/user.dto.ts";
import jwt from "jsonwebtoken"
import { IUser } from "../types/interfaces/user.interface.ts";
import { errorHandler } from "../utils/error_handler.ts";
import createError from "http-errors"

export class AuthService {
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
}
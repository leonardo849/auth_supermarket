import { User } from "../models/user.model.ts";
import { DatabaseError } from "../classes/database_error.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import createError from "http-errors";

export class UserService {
    private readonly userRepository: UserRepository = new UserRepository()

    async findAllUsers(): Promise<Partial<User>[]> {
        try {
            const users = await this.userRepository.findAllUsers()
            return users
        } catch (err: any) {
            let message: string = "unexpected error"
            if (err instanceof DatabaseError) {
                message = err.message
            }
            throw createError.InternalServerError(message)
        }
    }
}
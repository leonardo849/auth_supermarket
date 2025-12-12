import { UserRepository } from "../repositories/user.repository.ts";
import createError from "http-errors";
import { CreateUserDTO, FindAddressDTO, FindUserDTO } from "../dto/user.dto.ts";
import { errorHandler } from "../utils/error_handler.ts";

export class UserService {
    private readonly userRepository: UserRepository = new UserRepository()

    async findAllUsers(): Promise<FindUserDTO[]> {
        try {
            const users = await this.userRepository.findAllUsers()
            const mapped: FindUserDTO[] = []
            for (const u of users) {
                mapped.push(new FindUserDTO(u._id, u.email, u.role, u.dateOfBirth, u.active, new FindAddressDTO(u.address.street, u.address.number, u.address.neighborhood, u.address.city, u.address.state), u.createdAt, u.updatedAt))
            }
            return mapped
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async createUser(data: CreateUserDTO): Promise<void> {
        try {
            await this.userRepository.createUser(data)
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
}
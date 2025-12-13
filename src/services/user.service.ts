import { UserRepository } from "../repositories/mongo/user.repository.ts";
import { CreateUserDTO, FindAddressDTO, FindUserDTO } from "../dto/user.dto.ts";
import { errorHandler } from "../utils/error_handler.ts";
import { UserCacheRepository } from "../repositories/redis/user.cache.repository.ts";
import { RabbitMQService } from "../rabbitmq/rabbitmq.ts";
import httpError from "http-errors"
import { generateRandomCode } from "../utils/generate_random_code.ts";

export class UserService {
    private readonly userRepository: UserRepository = new UserRepository()
    private readonly userCacheRepository: UserCacheRepository = new UserCacheRepository()

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
            const user = await this.userRepository.findUserByEmail(data.email)
            if (user) {
                throw httpError.Conflict("user already exist")
            }
            const code = generateRandomCode()
            await this.userRepository.createUser(data, code)
            RabbitMQService.publishCreatedUserEmail({subject: "code", text: `code \n ${code}`, to: [data.email]})
            
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async findUserById(id: string): Promise<FindUserDTO> {
        try {
            const userRedis = await this.userCacheRepository.findUserById(id)
            if (userRedis) {
                return userRedis
            }
            const user = await this.userRepository.findUserById(id)
            const userMapped = new FindUserDTO(user._id.toString(), user.email, user.role, user.dateOfBirth, user.active, new FindAddressDTO(user.address.street, user.address.number, user.address.neighborhood, user.address.city, user.address.state), user.createdAt, user.updatedAt)
            this.userCacheRepository.createUser(userMapped) // don't wait for it
            return userMapped
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async findActiveUsers(): Promise<FindUserDTO[]> {
        try {
            const users = await this.userRepository.FindAllActiveUsers()
            const mapped: FindUserDTO[] = []
            for (const u of users) {
                mapped.push(new FindUserDTO(u._id, u.email, u.role, u.dateOfBirth, u.active, new FindAddressDTO(u.address.street, u.address.number, u.address.neighborhood, u.address.city, u.address.state), u.createdAt, u.updatedAt))
            }
            return mapped
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
}
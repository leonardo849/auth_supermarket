import { UserRepository } from "../repositories/mongo/user.repository.ts";
import { CreateUserDTO, FindAddressDTO, FindUserDTO } from "../dto/user.dto.ts";
import { errorHandler } from "../utils/error_handler.ts";
import { UserCacheRepository } from "../repositories/redis/user.cache.repository.ts";
import { RabbitMQService } from "../rabbitmq/rabbitmq.ts";
import httpError from "http-errors"
import { generateRandomCode } from "../utils/generate_random_code.ts";
import bcrypt from "bcrypt"
import { Roles } from "../types/enums/roles.ts";


export class UserService {
    private readonly userRepository: UserRepository = new UserRepository()
    private readonly userCacheRepository: UserCacheRepository = new UserCacheRepository()

    async findAllUsers(pag: number, limit: number): Promise<FindUserDTO[]> {
        try {
            const users = await this.userRepository.findAllPaginated(pag, limit)
            const mapped: FindUserDTO[] = []
            for (const u of users) {
                mapped.push(new FindUserDTO(u._id, u.name,u.email, u.role, u.dateOfBirth, u.active, new FindAddressDTO(u.address.street, u.address.number, u.address.neighborhood, u.address.city, u.address.state), u.verified,u.createdAt, u.updatedAt))
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
            const hashCode = await bcrypt.hash(code, 10)
            await this.userRepository.createUser({...data, hashCode: hashCode})
            RabbitMQService.publishCreatedUserEmail([data.email], code)
            
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async seedUser(data: CreateUserDTO & {role: string}): Promise<void> {
        try {
            const user = await this.userRepository.findUserByEmail(data.email)
            if (user) {
                throw httpError.Conflict("user already exist")
            }
            await this.userRepository.seedUser(data)
            const newUser = await this.userRepository.findUserByEmail(data.email)
            if (!newUser) {
                throw httpError.InternalServerError(`user wasn't created`)
            }
            if (data.role != Roles.CUSTOMER) {
                RabbitMQService.publishCreatedWorker({auth_updated_at: newUser.authUpdatedAt.toISOString(), id: newUser._id, role: newUser.role})
            }
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async findUserById(id: string, includeAuthUpdatedAt: boolean = false): Promise<FindUserDTO|FindUserDTO & {authUpdatedAt: Date}> {
        try {
            const userRedis = await this.userCacheRepository.findUserById(id)
            if (userRedis) {
                if (!includeAuthUpdatedAt) {
                    return userRedis
                } else  {
                    if ("authUpdatedAt" in userRedis) {
                        return userRedis
                    }
                }
            }
            
            
            const user = await this.userRepository.findUserById(id)
            if (!user) {
                throw httpError.NotFound(`user with id ${id} wasn't found`)
            }
            const userMapped = new FindUserDTO(user._id.toString(), user.name,user.email, user.role, user.dateOfBirth, user.active, new FindAddressDTO(user.address.street, user.address.number, user.address.neighborhood, user.address.city, user.address.state),user.verified ,user.createdAt, user.updatedAt)
            if (includeAuthUpdatedAt) {
                const userWithAuthUpdatedAt = {...userMapped, authUpdatedAt: user.authUpdatedAt}
                this.userCacheRepository.setUser(userMapped, user.authUpdatedAt) 
                return userWithAuthUpdatedAt
            }
            this.userCacheRepository.setUser(userMapped) // don't wait for it
            return userMapped
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async findActiveUsers(page: number, limit: number): Promise<FindUserDTO[]> {
        try {
            const users = await this.userRepository.findAllPaginated(page, limit, true)
            const mapped: FindUserDTO[] = []
            for (const u of users) {
                mapped.push(new FindUserDTO(u._id, u.name,u.email, u.role, u.dateOfBirth, u.active, new FindAddressDTO(u.address.street, u.address.number, u.address.neighborhood, u.address.city, u.address.state), u.verified,u.createdAt, u.updatedAt))
            }
            return mapped
        } catch (err: any) {
            throw errorHandler(err)
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
    async updateEmailWithNotificationToVerificationHasBeenSent(emails: string[]): Promise<void> {
        try {
            const updatedQuantity = await this.userRepository.updateMany({email: {$in: emails}}, {emailWithNotificationToVerificationHasBeenSent: true})
            if (updatedQuantity === 0) {
                throw new Error("no user was updated")
            }
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    
    async deleteUnverifiedUsers() {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            await this.userRepository.deleteMany({verified: false, emailWithNotificationToVerificationHasBeenSent: true, createdAt: {
                $lte: oneDayAgo
            }})
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    async updateProductServiceValue(id: string) {
        try {
            await this.findUserById(id)
            await this.userRepository.updateOneById(id, {services: {productService: true}})
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
}
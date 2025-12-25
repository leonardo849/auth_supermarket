import { UserRepository } from "../repositories/mongo/user.repository.ts";
import { CreateUserDTO, FindAddressDTO, FindUserDTO } from "../dto/user.dto.ts";
import { errorHandler } from "../utils/errors/error_handler.ts";
import { UserCacheRepository } from "../repositories/redis/user.cache.repository.ts";
import { RabbitMQService } from "../rabbitmq/rabbitmq.ts";
import httpError from "http-errors"
import { generateRandomCode } from "../utils/crypto/generate_random_code.ts";
import bcrypt from "bcrypt"
import { Roles } from "../types/enums/roles.ts";
import { Logger } from "../utils/logger/logger.ts";
import { basename } from "path";
import { Services, User } from "../models/user.model.ts";


export class UserService {
    private readonly userRepository: UserRepository = new UserRepository()
    private readonly userCacheRepository: UserCacheRepository = new UserCacheRepository()
    private readonly file: string = basename(import.meta.url)
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
                if (user.role != Roles.CUSTOMER) {
                    RabbitMQService.publishCreatedWorker({auth_updated_at: user.authUpdatedAt.toISOString(), id: user._id, role: user.role})
                }
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
                const mapped = {
                    ...userRedis,
                    createdAt: new Date(userRedis.createdAt),
                    updatedAt: new Date(userRedis.updatedAt),
                }
                if (!includeAuthUpdatedAt) {
                    return mapped
                } else  {
                    if ("authUpdatedAt" in userRedis) {
                        const mappedWithUpdatedAt = {
                            ...mapped,
                            authUpdatedAt: new Date(userRedis.authUpdatedAt)
                        }
                       return mappedWithUpdatedAt
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
            setImmediate(() => {
                this.setUserCache(id)
            })
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
    
    async getUserServicesById(id: string): Promise<Services> {
        try {
            const user = await this.userRepository.findUserById(id)
            if (!user) {
                throw new Error(`user with id ${id} doesn't exist`)
            }
            return user.services
        } catch (err: unknown) {
            Logger.error(err, {file: this.file})
            throw err
        }
    }

    async deleteUser(id: string): Promise<string> {
        try {
            const user = await this.findUserById(id)
            await this.userRepository.deleteUserById(id)
            await this.userCacheRepository.deleteUsers([id])
            RabbitMQService.publishDeletedWorker({id: id})
            return user.email
        } catch (err: any) {
            throw errorHandler(err)
        }
    }
    
    
    
    
    private async setUserCache(id: string) {
        try {
            const user = await this.userRepository.findUserById(id)
            if (!user) {
                throw new Error(`user with id ${id} wasn't found`)
            }
            const userDto = new FindUserDTO(
                user._id,
                user.name,
                user.email,
                user.role,
                user.dateOfBirth,
                user.active,
                user.address,
                user.verified,
                user.createdAt,
                user.updatedAt
            )
            await this.userCacheRepository.setUser(userDto)
        } catch (err) {
            Logger.error(err, {file: this.file})
        }
    }

}
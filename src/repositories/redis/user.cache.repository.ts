import { RedisClientType } from "redis";
import { RedisClient } from "../../cache/cache.ts";
import { FindUserDTO } from "../../dto/user.dto.ts";
import { Logger } from "../../utils/logger.ts";
import { basename } from "path";

export class UserCacheRepository {
    private redisClient: RedisClientType = RedisClient.getClient()
    private file: string = basename(import.meta.url)

    async createUser(user: FindUserDTO): Promise<string|null> {
        try {
            await this.redisClient.setEx(`user:${user.id}`, 60*15, JSON.stringify(user))
            const message = "user was setted in redis"
            Logger.info({file: this.file}, message)
            return message
        } catch (err: unknown) {
            Logger.error(err, {file: this.file})
            return null
        } 
    }
    async findUserById(id: string): Promise<FindUserDTO|null> {
        const data = await this.redisClient.get(`user:${id}`)
        const user = data ? JSON.parse(data) : null
        return user
    }
}
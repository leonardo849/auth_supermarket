import { basename } from "path";
import { Logger } from "../utils/logger.ts";
import { createClient, RedisClientType } from "redis";

export class RedisClient {
    private static file: string = basename(import.meta.url)
    private static client: RedisClientType

    private static getClientInstance() {
        if (!this.client) {
            this.client = createClient({
                url: process.env.REDIS_URI || "redis://localhost:6379"
            })

            this.client.on("error", (err) => {
                Logger.error(err, { file: this.file })
            })

            this.client.on("ready", (msg) => {
                Logger.info({file: this.file}, "connected to redis")
            })
        }

        return this.client
    }

    static async connect() {
        try {
    
            if (!this.client.isOpen) {
                await this.client.connect()
            }
        } catch (error) {
            Logger.error(error, { file: this.file })
            throw error
        }
    }

    static async disconnect() {

        if (this.client && this.client.isOpen) {
            await this.client.quit()
            Logger.info({ file: this.file }, "disconnected to redis")
        }
    }

    static getClient(): RedisClientType {
        return this.getClientInstance()
    }
}

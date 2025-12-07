import { basename } from "path";
import { Logger } from "../utils/logger.ts";
import { createClient } from "redis";

export class RedisClient {
    private file: string = basename(import.meta.url)
    private client = createClient({
        url: process.env.REDIS_URI || "redis://localhost:6379"
    })


    constructor() {
        this.client.on("error", (err) => {
            Logger.error(err, {file: this.file})
        })

    }

    async connect() {
        try {
            await this.client.connect();
            Logger.info({file: this.file}, "connected to redis")
        } catch (error) {
            Logger.error(error, {file: this.file})
        }
    }

    getClient(): typeof this.client {
        return this.client
    }
}

import { Server } from "./server.ts";
import { Logger } from "./utils/logger.ts";
import { basename } from "path";
import dotenv from "dotenv"
import { Database } from "./database/db.ts";
import { Express } from "express";
import { RedisClient } from "./cache/cache.ts";

export class Index {
    private file: string = basename(import.meta.url)
    private server!: Server
    
    constructor() {
        
    }

    initEnvironment() {
        if (!process.env.APP_ENV || process.env.APP_ENV === "DEV") {
            dotenv.config()
            Logger.info({ file: this.file }, "dotenv.config()")
        }
    }

    setupServer(): Server {
        this.server = new Server()
        Logger.info({ file: this.file }, "setuping server")
        return this.server
    }

    async connectToMongo() {
        const db = new Database()
        try {
            await db.connectToDB()
            Logger.info({ file: this.file }, "connected to mongo")
        } catch (err) {
            Logger.error(err, {file: this.file})
            process.exit(1)
        }
    }
    async connectToRedis() {
        const redis = new RedisClient()
        try {
            await redis.connect()
            Logger.info({ file: this.file }, "connected to redis")
        } catch (err) {
            Logger.error(err, {file: this.file})
            process.exit(1)
        }
    }

    async connectToDatabases() {
        await this.connectToMongo()
        await this.connectToRedis()
    }
    async runProject() {
        this.initEnvironment()
        await this.connectToDatabases()
        this.setupServer()

        const port = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT)
        this.server.start(port)
        Logger.info({ file: this.file }, "server is running")
    }

    getApp(): Express {
        return this.server.getApp()
    }
}


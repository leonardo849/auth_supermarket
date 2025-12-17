import { Server } from "./server/server.ts";
import { Logger } from "./utils/logger.ts";
import { basename } from "path";
import dotenv from "dotenv"
import { Database } from "./database/db.ts";
import { Express } from "express";
import { RedisClient } from "./cache/cache.ts";
import { RabbitMQService } from "./rabbitmq/rabbitmq.ts";
import { UserWorker } from "./workers/user.worker.ts";

export class Index {
    private file: string = basename(import.meta.url)
    private server!: Server
    private mongo!: Database
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

    private async connectToMongo() {
        this.mongo = new Database()
        try {
            await this.mongo.connectToDB()
            Logger.info({ file: this.file }, "connected to mongo")
        } catch (err) {
            Logger.error(err, {file: this.file})
            process.exit(1)
        }
    }
    private async startWorkers() {
        const userWorker = new UserWorker()
        await userWorker.scheduleJobs()
    }
    private async connectToRedis() {
        try {
            await RedisClient.connect()
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
    async connectToRabbit() {
        await RabbitMQService.startRabbit(process.env.RABBIT_URI as string)
    }

    private async disconnectToRedis() {
        await RedisClient.disconnect()
    }
    private async startRabbit() {
        try {
            await RabbitMQService.startRabbit(process.env.RABBIT_URI as string)
        } catch (err: unknown) {
            Logger.error(err, {file: this.file})
            process.exit(1)
        }
    }
    private async disconnectToMongo() {
        await this.mongo.disconnectToDB()
    }
    async disconnectToDatabases() {
        await this.disconnectToMongo()
        await this.disconnectToRedis()
    }
    async disconnectFromRabbit() {
        await RabbitMQService.disconnectRabbit()
    }
    async migrateSeeds() {
        await this.mongo.migrateUsersToDB()
    }
    async runProject() {
        this.initEnvironment()
        await this.startRabbit()
        await this.connectToDatabases()
        await this.migrateSeeds()
        await this.startWorkers()
        this.setupServer()

        const port = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT)
        this.server.start(port)
        Logger.info({ file: this.file }, "server is running")
    }
    getApp(): Express {
        return this.server.getApp()
    }
    
}


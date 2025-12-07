import { Server } from "./server.ts";
import { Logger } from "./utils/logger.ts";
import { basename } from "path";
import dotenv from "dotenv"
import { Database } from "./database/db.ts";
import { Express } from "express";

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
        await db.connectToDB()
        Logger.info({ file: this.file }, "connecting to mongo")
    }

    async runProject() {
        this.initEnvironment()
        await this.connectToMongo()
        this.setupServer()

        const port = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT)
        this.server.start(port)
        Logger.info({ file: this.file }, "server is running")
    }

    getApp(): Express {
        return this.server.getApp()
    }
}


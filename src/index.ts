import { Server } from "./server.js";
import { Logger } from "./utils/logger.js";
import { basename } from "path";
import dotenv from "dotenv"
import { Database } from "./database/db.js";


export class Index {
    private file: string = basename(import.meta.url)
    constructor() {
        if (!process.env.APP_ENV || process.env.APP_ENV == "DEV" || process.env.APP_ENV === "DEV") {
            dotenv.config()
            Logger.info({file: this.file}, "dotenv.config()")
        }
        this.connectToMongo()
    }
    async connectToMongo() {
        const db = new Database()
        await db.connectToDB()
        Logger.info({file: this.file}, "connecting to mongo")
    }
    async runProject() {
        const port = isNaN(Number(process.env.PORT)) ? 3000 : Number(process.env.PORT)
        const server = new Server(port)
        Logger.info({file: this.file}, "starting server")
        server.start()
        Logger.info({file: this.file}, "server is running")
        
    }
}

new Index().runProject()
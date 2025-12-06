import {connect} from "mongoose"
import { Logger } from "../utils/logger.js"
import { basename } from "path"
import { IDatabase } from "../interfaces/database.interface.js"

export class Database implements IDatabase {
    private file = basename(import.meta.url)
    async connectToDB() {
        try {
            const mongoUri = process.env.MONGO_URI
            if (!mongoUri || mongoUri == "") {
                throw new Error("the mongouri is empty")
            }
            await connect(mongoUri)
            Logger.info({file: this.file}, "connected to mongo")
        } catch(error) {
            Logger.error(error, {file: this.file})
            process.exit(1)
        }
    }
}
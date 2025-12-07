import mongoose, {connect} from "mongoose"
import { Logger } from "../utils/logger.ts"
import { basename } from "path"
import { IDatabase } from "../interfaces/database.interface.ts"

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
        }
    }
    async disconnectToDB() {
        if (mongoose.connection.readyState !== 0 ) {
            await mongoose.connection.close()
            Logger.info({file: this.file}, "disconnected to mongo")
        }
        
    }
}
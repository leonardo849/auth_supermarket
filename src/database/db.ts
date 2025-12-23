import mongoose, {connect} from "mongoose"
import { Logger } from "../utils/logger/logger.ts"
import { basename } from "path"
import usersJson from "./seeds/users.json" with {type: "json"}
import { UserModel } from "../models/user.model.ts"
import { UserService } from "../services/user.service.ts"
import { CreateUserDTO } from "@src/dto/user.dto.ts"

export class Database  {
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
    async migrateUsersToDB() {
        const users = usersJson
        const userService = new UserService()
        for (const u of users) {
            try {
                const data: CreateUserDTO = {
                    ...u,
                }
                await userService.seedUser({...data, role: u.role})
            } catch (err: any) {
                Logger.info({file: this.file}, err)
            }
            
        }
    }
    async disconnectToDB() {
        if (mongoose.connection.readyState !== 0 ) {
            await mongoose.connection.close()
            Logger.info({file: this.file}, "disconnected to mongo")
        }
    }
}
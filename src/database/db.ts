import mongoose, {connect} from "mongoose"
import { Logger } from "../utils/logger.ts"
import { basename } from "path"
import usersJson from "./seeds/users.json" with {type: "json"}
import { UserModel } from "../models/user.model.ts"

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
        for (const u of users) {
            const user = new UserModel()
            user.name = u.name
            user.address = u.address
            user.password = u.password
            user.email = u.email
            user.dateOfBirth = new Date(u.dateOfBirth as string)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
            user.role = u.role
            const userInDb = await UserModel.findOne({email: u.email})
            if (userInDb) {
                Logger.error(new Error(`there is already a user with that email ${user.email}`), {file: this.file})
                continue
            }
            await user.save()
            Logger.info({file: this.file}, `user with email ${u.email} was created`)
        }
    }
    async disconnectToDB() {
        if (mongoose.connection.readyState !== 0 ) {
            await mongoose.connection.close()
            Logger.info({file: this.file}, "disconnected to mongo")
        }
    }
}
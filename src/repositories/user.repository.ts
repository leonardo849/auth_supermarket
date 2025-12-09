import { User, UserModel } from "../models/user.model.ts"
import { basename } from "path"
import { DatabaseError } from "../classes/database_error.ts"
import { Logger } from "../utils/logger.ts"

export class UserRepository  {
    private readonly file: string = basename(import.meta.url)
    private readonly userModel: typeof UserModel = UserModel
    constructor() {
        
    }
    async findAllUsers(): Promise<Partial<User>[]> {
        try {
            return await this.userModel.find({}, {password: 0}).lean()
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw new DatabaseError(err)
        }
    }
}
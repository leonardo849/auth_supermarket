import { User, UserModel } from "../models/user.model.ts"
import { basename } from "path"
import { DatabaseError } from "../classes/database_error.ts"
import { Logger } from "../utils/logger.ts"
import { CreateUserDTO } from "../dto/user.dto.ts"
import { NotFoundDatabase } from "../classes/notfound_database.ts"


type userWithoutPassword = Omit<User, "password">
type userWithJustPassword = Pick<User, "password">
export class UserRepository  {
    private readonly file: string = basename(import.meta.url)
    private readonly userModel: typeof UserModel = UserModel
    constructor() {
        
    }
    async findAllUsers(): Promise<userWithoutPassword[]> {
        try {
            return await this.userModel.find({}, { password: 0 }).lean()
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw new DatabaseError(err)
        }
    }
    async createUser(data: CreateUserDTO) {
        try {
            const user = new UserModel()
            const addressData = data.address
            user.address = {
                city: addressData.city,
                neighborhood: addressData.neighborhood,
                number: addressData.number,
                state: addressData.state,
                street: addressData.street
            }
            user.password = data.password
            user.name = data.name
            user.email = data.email
            user.dateOfBirth = new Date(data.dateOfBirth)
            await user.save()
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw new DatabaseError(JSON.stringify(err))
        }
    }
    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({email: email})
        if (!user) {
            const error = new NotFoundDatabase("user wasn't found")
            Logger.error(error, {file: this.file})
            throw error
        }
        return user  
    }
}
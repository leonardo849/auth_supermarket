import { User, UserModel } from "../../models/user.model.ts"
import { basename } from "path"
import { DatabaseError } from "../../classes/database_error.ts"
import { Logger } from "../../utils/logger.ts"
import { CreateUserDTO } from "../../dto/user.dto.ts"
import { NotFoundDatabase } from "../../classes/notfound_database.ts"
import bcrypt from "bcrypt"


type userWithoutPassword = Omit<User, "password">

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
    async FindAllActiveUsers(): Promise<userWithoutPassword[]> {
        try {
            return await this.userModel.find({active: true}, { password: 0 }).lean()
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw new DatabaseError(err)
        }
    }
    async verifyUser(id: string) {
        await this.userModel.findOneAndUpdate({_id: id}, {verified: true, code: null, emailWithNotificationToVerificationHasBeenSent: null})
    }

    async createUser(data: CreateUserDTO, code: string) {
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
            user.code = await bcrypt.hash(code, 10)
            await user.save()
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw new DatabaseError(JSON.stringify(err))
        }
    }
    async findUserByEmail(email: string): Promise<User|null> {
        const user = await this.userModel.findOne({email: email})
        if (!user) {
            const error = new NotFoundDatabase(`user with email ${email} wasn't found`)
            Logger.error(error, {file: this.file})
            return null
        }
        return user  
    }
    async findUnverifiedUsersEmailThatAreOneDayOld(): Promise<string[]> {
        const twentyTwoHoursAgo = new Date(Date.now() - 22 * 60 * 60 * 1000)
        const users = await this.userModel.find({
            verified: false,
            emailWithNotificationToVerificationHasBeenSent: false,
            createdAt: {
                $lte: twentyTwoHoursAgo
            }
        })
        const emailsArray = users.map(element => element.email)
        return emailsArray
    }
    async deleteUneverifiedUsers(): Promise<void> {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        await this.userModel.deleteMany({verified: false,emailWithNotificationToVerificationHasBeenSent: true , createdAt: {
                $lte: oneDayAgo
            }
        })
    }
    async updateCode(id: string, code: string): Promise<void> {
        await this.userModel.findOneAndUpdate({_id: id}, {code: code})
    }
    async updateEmailWithNotificationToVerificationHasBeenSent(emails: string[]) {
        await this.userModel.updateMany({
            email: {$in: emails}
        },
        {
            $set: {
                emailWithNotificationToVerificationHasBeenSent: true,

            }
        })
    }
    async findUserById(id: string): Promise<User> {
        const user = await this.userModel.findOne({_id: id})
        if (!user) {
            const error = new NotFoundDatabase(`user with id ${id} wasn't found`)
            Logger.error(error, {file: this.file})
            throw error
        }
        return user
    }
}
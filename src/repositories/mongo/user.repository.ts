import { User, UserModel } from "../../models/user.model.ts"
import { basename } from "path"
import { DatabaseError } from "../../classes/database_error.ts"
import { Logger } from "../../utils/logger.ts"
import { CreateUserDTO } from "../../dto/user.dto.ts"
import {decoratorValidateFilter} from "../../utils/decorator_validate_filter_mongo.ts"
import { FilterQuery, UpdateQuery } from "mongoose"
import {ALLOWED_MONGO_OPERATORS} from "../../policies/mongo_policies.ts"
import {ALLOWED_USER_FILTER_FIELDS} from "../../policies/users/user_policies.ts"


type userWithoutPassword = Omit<User, "password">

export class UserRepository  {
    private readonly file: string = basename(import.meta.url)
    private readonly userModel: typeof UserModel = UserModel
    constructor() {
        
    }
    
    async findAllPaginated(page:number = 1, limit: number = 20, active?: boolean): Promise<userWithoutPassword[]> {
        const filter: {active?: boolean} = {}
        if (active != undefined) {
            filter["active"] = active
        }
        const skip = (page - 1 ) * limit
        return await this.userModel.find(filter, {password: 0}).skip(skip).limit(limit).lean()
    }
    @decoratorValidateFilter({allowedFields: ALLOWED_USER_FILTER_FIELDS, allowedOperators: ALLOWED_MONGO_OPERATORS})
    async findAllUsers(filter: FilterQuery<User>): Promise<userWithoutPassword[]> {
        return await this.userModel.find(filter, {password: 0}).lean()
    }

    async updateOneById(id: string, data: UpdateQuery<User>): Promise<boolean> {
        const result = await this.userModel.updateOne({_id: id}, data)
        return result.matchedCount > 0
    }
    async createUser(data:CreateUserDTO & {hashCode:string}) {
        try {
            const user = new UserModel(
                {
                    ...data,
                    dateOfBirth: new Date(data.dateOfBirth),
                    code: data.hashCode
                }
            )
            // const addressData = data.address
            // user.address = {
            //     city: addressData.city,
            //     neighborhood: addressData.neighborhood,
            //     number: addressData.number,
            //     state: addressData.state,
            //     street: addressData.street
            // }
            // user.password = data.password
            // user.name = data.name
            // user.email = data.email
            // user.dateOfBirth = new Date(data.dateOfBirth)
            // user.code = data.hashCode
            await user.save()
        } catch (err: any) {
            Logger.error(err, {file: this.file})
            throw new DatabaseError(JSON.stringify(err))
        }
    }
    async findUserByEmail(email: string): Promise<User|null> {
        return await this.userModel.findOne({email: email})
    }
    async findUnverifiedUsersEmailIn(timeAgo: Date): Promise<string[]> {
        const users = await this.userModel.find({
            verified: false,
            emailWithNotificationToVerificationHasBeenSent: false,
            createdAt: {
                $lte: timeAgo
            }
        })
        const emailsArray = users.map(element => element.email)
        return emailsArray
    }
    @decoratorValidateFilter({allowedFields: ALLOWED_USER_FILTER_FIELDS, allowedOperators: ALLOWED_MONGO_OPERATORS})
    async deleteMany(filter: FilterQuery<User>): Promise<number> {
        return (await this.userModel.deleteMany(filter)).deletedCount
    }
    @decoratorValidateFilter({allowedFields: ALLOWED_USER_FILTER_FIELDS, allowedOperators: ALLOWED_MONGO_OPERATORS})
    async updateMany(filter: FilterQuery<User>, data: UpdateQuery<User>): Promise<number> {
        const result = await this.userModel.updateMany(filter, data)
        return result.modifiedCount
    }
    async findUserById(id: string): Promise<User|null> {
       return await this.userModel.findById(id)
    }
}
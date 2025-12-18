import {  compare } from "../utils/hash.ts";
import { Roles } from "../types/enums/roles.ts";
import { getModelForClass, prop, pre, modelOptions } from "@typegoose/typegoose";
import bcrypt from "bcrypt"

class Services {

    @prop({default: false})
    productService!: boolean

    @prop({default: false})
    saleService!: boolean
}


@modelOptions({
    schemaOptions: {
        timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"}
    }
})
@pre<User>("save", async function() {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})
@pre<User>("save", async function() {
    if (this.role != Roles.CUSTOMER) {
        this.services = {
            productService: false,
            saleService: false
        }
    }
})
@pre<User>("save", function () {
    if (this.isNew) {
        this.authUpdatedAt = this.createdAt ?? new Date()
    }
})
export class User {

    @prop({ required: true })
    name!: string

    @prop({ required: true, unique: true })
    email!: string

    @prop({ required: true })
    password!: string;

    @prop({ enum: [Roles.CUSTOMER, Roles.MANAGER, Roles.WORKER, Roles.DEVELOPER], default: Roles.CUSTOMER })
    role!: Roles

    @prop()
    dateOfBirth!: Date

    @prop({ default: true })
    active!: boolean

    @prop({default: false})
    verified!: boolean

    @prop()
    code!: string

    @prop({default: Date.now})
    authUpdatedAt!: Date

    @prop({type: () => Services, default: {}})
    services!: Services

    @prop({type: () => Object, required: true})
    address!: {
        street: string
        number: number
        neighborhood: string
        city: string
        state: string
    }

    _id!: string;

    @prop({default: false})
    emailWithNotificationToVerificationHasBeenSent!: boolean

    createdAt!: Date;
    updatedAt!: Date;

    async comparePassword(password: string) {
        return await compare(password, this.password)
    }
    async compareCode(code: string) {
        return await compare(code, this.code)
    }
}

export const UserModel = getModelForClass(User)

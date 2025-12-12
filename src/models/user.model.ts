import {  compare } from "../utils/hash.ts";
import { Roles } from "../types/enums/roles.ts";
import { getModelForClass, prop, pre, modelOptions } from "@typegoose/typegoose";
import bcrypt from "bcrypt"

@modelOptions({
    schemaOptions: {
        timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"}
    }
})
@pre<User>("save", async function() {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
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

    @prop({type: () => Object, required: true})
    address!: {
        street: string
        number: number
        neighborhood: string
        city: string
        state: string
    }

    _id!: string;


    createdAt!: Date;
    updatedAt!: Date;

    async comparePassword(password: string) {
        return await compare(password, this.password)
    }
}

export const UserModel = getModelForClass(User)

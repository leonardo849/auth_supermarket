import { Roles } from "../enums/roles.ts";
import { getModelForClass, prop, pre } from "@typegoose/typegoose";
import bcrypt from "bcrypt";

@pre<User>("save", async function() {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10);
})
export class User {

    @prop({ required: true })
    name!: string

    @prop({ required: true, unique: true })
    email!: string

    @prop({ required: true })
    password!: string;

    @prop({ enum: [Roles.CUSTOMER, Roles.MANAGER, Roles.WORKER], default: Roles.CUSTOMER })
    role!: Roles

    @prop()
    dateOfBirth!: Date

    @prop({ default: true })
    active!: boolean

    @prop()
    address!: {
        street: string
        number: number
        neighborhood: string
        city: string
        state: string
    }

    async comparePassword(password: string) {
        return await bcrypt.compare(password, this.password)
    }
}

export const UserModel = getModelForClass(User)

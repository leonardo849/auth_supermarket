import { Roles } from "../enums/roles.ts"

export interface IUser {
    id: string
    updatedAt: Date
    role: Roles
}
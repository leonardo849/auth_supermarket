import { Roles } from "../enums/roles.ts"

export interface IUser {
    id: string
    role: Roles
    // token_created_at: number
}
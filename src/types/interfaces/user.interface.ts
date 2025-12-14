import { Roles } from "../enums/roles.ts"

export interface IUser {
    id: string
    authUpdatedAt: Date
    role: Roles
    credential_version: Date
}
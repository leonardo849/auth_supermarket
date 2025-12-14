import { IUser } from "@src/types/interfaces/user.interface.ts"
import jwt from "jsonwebtoken"

export function validateToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.SECRET as string) as IUser
        return decoded
    } catch (err: unknown) {
        throw new Error("error validating token")
    }
}

export function generateJwt(user: Omit<IUser, "credential_version">) {
    try {
        const payload: IUser = {
            credential_version: new Date(),
            id: user.id,
            role: user.role,
            authUpdatedAt: user.authUpdatedAt
        }
        const token = jwt.sign(payload, process.env.SECRET as string)
        return token
    } catch (err: unknown) {
        throw new Error("error generating token")
    }
}
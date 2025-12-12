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
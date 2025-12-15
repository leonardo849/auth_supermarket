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

export function generateJwt(user: IUser) {
    try {
        const payload: IUser = {
            id: user.id,
            role: user.role
        }
        const token = jwt.sign(payload, process.env.SECRET as string, {algorithm: "HS256"})
        return token
    } catch (err: unknown) {
        throw new Error("error generating token")
    }
}

export function verifyJwtIat(token: string, authUpdatedAt: Date): boolean {
    const payload = jwt.verify(
        token,
        process.env.SECRET as string
    ) as jwt.JwtPayload

    if (!payload.iat) {
        throw new Error("token withou iat")
    }

    const tokenIssuedAtMs = payload.iat * 1000 
    const authUpdatedAtMs = authUpdatedAt.getTime()

    return tokenIssuedAtMs >= authUpdatedAtMs
}
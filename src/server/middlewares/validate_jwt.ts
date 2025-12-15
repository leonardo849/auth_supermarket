import { RequestWithUser } from "@src/types/interfaces/request.interface.ts";
import { validateToken, verifyJwtIat } from "../../utils/jwt.ts";
import { NextFunction, Response } from "express";
import { Logger } from "../../utils/logger.ts";
import { basename } from "path";
import { UserService } from "../../services/user.service.ts";
import httpError from "http-errors"


const file = basename(import.meta.url)
const userService = new UserService()

export async function validateJwt(req: RequestWithUser, res: Response, next: NextFunction) {
    const auth = req.headers.authorization
    if (!auth) {
        return res.status(403).json({error: "you don't have token"})
    }
    const bearer = auth.split(" ")[0]
    if (bearer != "Bearer") {
        return res.status(403).json({error: "you token is wrong. It doesn't have bearer"})
    }
    const token = auth.split(" ")[1]

    try {
        const payload = validateToken(token)
        const user = await userService.findUserAuthUpdatedAtById(payload.id)
        verifyJwtIat(token, user)
        req.user = payload
        next()
    } catch (err) {
        if (err instanceof httpError.HttpError) {
            return res.status(err.status).json({error: err.message})
        }
        Logger.error(err, {file})
        return res.status(403).json({error: "error validating token "})
    }
}
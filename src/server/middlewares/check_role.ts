import { Roles } from "../../types/enums/roles.ts";
import { RequestWithUser } from "@src/types/interfaces/request.interface.ts";
import { NextFunction, Response } from "express";

export function checkRole(role: Roles[]) {
    return async function(req: RequestWithUser, res: Response, next: NextFunction) {
        if (req.user && role.includes(req.user.role)) {
            return next()
        }
        return res.status(403).json({error: "you don't have role to do that"})
    }
}
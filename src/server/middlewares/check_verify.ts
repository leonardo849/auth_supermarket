import { UserService } from "../../services/user.service.ts"
import { RequestWithUser } from "@src/types/interfaces/request.interface.ts"
import {NextFunction, Request, Response} from "express"

const userService = new UserService()

export function checkVerify(expectedValue: boolean) {
    return async function(req: RequestWithUser, res: Response, next: NextFunction) {
        const user = await userService.findUserById(req.user?.id as string)
        if (user.verified === expectedValue) {
            return next()
        } 
        
        return res.status(403).json({error: `it was supposed that your verified's value was ${expectedValue}`})
    }
}
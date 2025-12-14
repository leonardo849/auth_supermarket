import { RequestWithUser } from "../types/interfaces/request.interface.ts";
import { AuthService } from "../services/auth.service.ts";
import { NextFunction, Response } from "express";
import { LoginUserDTO, VerifyCodeDTO } from "../dto/user.dto.ts";

export class AuthController {
    private readonly authService: AuthService = new AuthService()

    async loginUser(req: RequestWithUser, res: Response, next: NextFunction) {
        const body = req.body as LoginUserDTO
        try {
            const token = await this.authService.loginUser(body)
            if (token) {
                return res.status(200).json({token})
            }
        } catch (err: any) {
            next(err)
        }
    }
    async verifyCodeUser(req: RequestWithUser, res: Response, next: NextFunction) {
        const body = req.body as VerifyCodeDTO
        try {
            await this.authService.verifyUserCode(body, req.user?.id as string)
            return res.status(200).json({message: "user's code was verified"})
        } catch (err) {
            next(err)
        }
    }
    async getNewCode(req: RequestWithUser, res: Response, next: NextFunction) {
        const id = req.user?.id as string
        try {
            await this.authService.getNewUserCode(id)
            return res.status(200).json({message: "new code was sent to your email"})
        } catch (err) {
            next(err)
        }
    }
}
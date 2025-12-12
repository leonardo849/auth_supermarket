import { RequestWithUser } from "../types/interfaces/request.interface.ts";
import { AuthService } from "../services/auth.service.ts";
import { NextFunction, Response } from "express";
import { LoginUserDTO } from "../dto/user.dto.ts";

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
}
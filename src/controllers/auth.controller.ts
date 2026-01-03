import { RequestWithUser } from "../types/interfaces/request.interface.ts";
import { AuthService } from "../services/auth.service.ts";
import { NextFunction, Response } from "express";
import { ChangeUserRoleDTO, LoginUserDTO, VerifyCodeDTO } from "../dto/user.dto.ts";
import { ValidateDto } from "../utils/decorators/decorator_validate_dto.ts";

export class AuthController {
    private readonly authService: AuthService = new AuthService()

    @ValidateDto(LoginUserDTO)
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
    @ValidateDto(VerifyCodeDTO)
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
    @ValidateDto(ChangeUserRoleDTO)
    async changeUserRole(req: RequestWithUser, res: Response, next: NextFunction) {
        const id = req.params.id as string
        const body = req.body as ChangeUserRoleDTO
        const token = req.headers.authorization?.split(" ")[1]
        try {
            await this.authService.changeUserRoleById(id, body.role, token as string)
            return res.status(200).json({message: "user's role was updated"})
        } catch (err) {
            next(err)
        }
    }
}
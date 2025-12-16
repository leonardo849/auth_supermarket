import { Router } from "express";
import { AuthController } from "../../controllers/auth.controller.ts";
import { basename } from "path";
import { validateJwt } from "../middlewares/validate_jwt.ts";
import { checkVerify } from "../middlewares/check_verify.ts";
import { ChangeUseRoleDTO, LoginUserDTO, VerifyCodeDTO } from "../../dto/user.dto.ts";
import { Roles } from "../../types/enums/roles.ts";
import { validateMiddleware } from "../middlewares/validate.ts";
import { checkRole } from "../middlewares/check_role.ts";
import { Logger } from "../../utils/logger.ts";

export class AuthRoutes {
    private readonly authController: AuthController = new AuthController()
    constructor() {

    }
    setupRoutes(): Router {
        const router = Router()
        router.get("/getcode", validateJwt, checkVerify(false), this.authController.getNewCode.bind(this.authController))
        router.post("/login", validateMiddleware(LoginUserDTO), this.authController.loginUser.bind(this.authController))
        router.post("/verify", validateJwt, checkVerify(false),validateMiddleware(VerifyCodeDTO), this.authController.verifyCodeUser.bind(this.authController))
        router.patch("/role/:id", validateJwt, checkVerify(true), checkRole([Roles.MANAGER]),validateMiddleware(ChangeUseRoleDTO) ,this.authController.changeUserRole.bind(this.authController))
        Logger.info({file: basename(import.meta.url)}, "auth's routes are running!")
        return router
    }
}
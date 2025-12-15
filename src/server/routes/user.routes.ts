import { IRoute, Router } from "express";
import { UserController } from "../../controllers/user.controller.ts";
import { Logger } from "../../utils/logger.ts";
import { basename } from "path";
import { validateMiddleware } from "../middlewares/validate.ts";
import { ChangeUseRoleDTO, CreateUserDTO, LoginUserDTO, VerifyCodeDTO } from "../../dto/user.dto.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import { validateJwt } from "../middlewares/validate_jwt.ts";
import { checkRole } from "../middlewares/check_role.ts";
import { Roles } from "../../types/enums/roles.ts";
import { checkVerify } from "../middlewares/check_verify.ts";

export class UserRoutes {
    private readonly file = basename(import.meta.url)
    private readonly userController: UserController = new UserController()
    private readonly authController: AuthController = new AuthController()
    constructor() {

    }
    setupRoutes(): Router {
        const router = Router()
        router.get("/", validateJwt, checkVerify(true),checkRole([Roles.MANAGER, Roles.DEVELOPER]),this.userController.findAllUsers.bind(this.userController))
        router.get("/active", validateJwt,checkVerify(true), checkRole([Roles.MANAGER, Roles.DEVELOPER]), this.userController.findAllActiveUsers.bind(this.userController))
        router.post("/", validateMiddleware(CreateUserDTO) ,this.userController.createUser.bind(this.userController))
        router.post("/login", validateMiddleware(LoginUserDTO), this.authController.loginUser.bind(this.authController))
        router.post("/verify", validateJwt, checkVerify(false),validateMiddleware(VerifyCodeDTO), this.authController.verifyCodeUser.bind(this.authController))
        router.get("/getcode", validateJwt, checkVerify(false), this.authController.getNewCode.bind(this.authController))
        router.patch("/role/:id", validateJwt, checkVerify(true), checkRole([Roles.MANAGER]),validateMiddleware(ChangeUseRoleDTO) ,this.authController.changeUserRole.bind(this.authController))
        Logger.info({file: this.file}, "user's routes are running")
        return router
    }
}
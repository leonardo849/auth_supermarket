import {  Router } from "express";
import { UserController } from "../../controllers/user.controller.ts";
import { Logger } from "../../utils/logger/logger.ts";
import { basename } from "path";
import { validateJwt } from "../middlewares/validate_jwt.ts";
import { checkRole } from "../middlewares/check_role.ts";
import { Roles } from "../../types/enums/roles.ts";
import { checkVerify } from "../middlewares/check_verify.ts";


export class UserRoutes {
    private readonly file = basename(import.meta.url)
    private readonly userController: UserController = new UserController()
    constructor() {

    }
    setupRoutes(): Router {
        const router = Router()
        router.get("/:page/:limit", validateJwt, checkVerify(true),checkRole([Roles.MANAGER, Roles.DEVELOPER]),this.userController.findAllUsers.bind(this.userController))
        router.get("/active/:page/:limit", validateJwt,checkVerify(true), checkRole([Roles.MANAGER, Roles.DEVELOPER]), this.userController.findAllActiveUsers.bind(this.userController))
        router.post("/", this.userController.createUser.bind(this.userController))
        router.delete("/me", validateJwt, this.userController.deleteOwnUser.bind(this.userController))
        Logger.info({file: this.file}, "user's routes are running")
        return router
    }
}
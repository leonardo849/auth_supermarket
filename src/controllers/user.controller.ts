import { RequestWithUser } from "@src/types/interfaces/request.interface.ts";
import { CreateUserDTO } from "../dto/user.dto.ts";
import { UserService } from "../services/user.service.ts";
import { NextFunction, Request, Response } from "express";

export class UserController {
    private readonly userService: UserService = new UserService()

    async findAllUsers(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const users =  await this.userService.findAllUsers()
            return res.status(200).json(users)
        } catch (err) {
            next(err)
        }
    }
    async createUser(req: Request, res: Response, next: NextFunction) {
        const body = req.body as CreateUserDTO
        try {
            await this.userService.createUser(body)
            return res.status(200).json({message: "user was created"})
        } catch (err) {
            next(err)
        }
    }
    async findAllActiveUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.findActiveUsers()
            return res.status(200).json(users)
        } catch (err) {
            next(err)
        }
    }
}
import { RequestWithUser } from "@src/types/interfaces/request.interface.ts";
import { CreateUserDTO } from "../dto/user.dto.ts";
import { UserService } from "../services/user.service.ts";
import { NextFunction, Request, Response } from "express";
import { ValidateDto } from "../utils/decorators/decorator_validate_dto.ts";
import { IUser } from "@src/types/interfaces/user.interface.ts";

export class UserController {
    private readonly userService: UserService = new UserService()

    async findAllUsers(req: RequestWithUser, res: Response, next: NextFunction) {
        const {page, limit} = req.params as any as {page: string, limit: string}
        try {
            const users =  await this.userService.findAllUsers(Number(page), Number(limit))
            return res.status(200).json(users)
        } catch (err) {
            next(err)
        }
    }
    @ValidateDto(CreateUserDTO)
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
        const {page, limit} = req.params as any as {page: string, limit: string}
        try {
            const users = await this.userService.findActiveUsers(Number(page), Number(limit))
            return res.status(200).json(users)
        } catch (err) {
            next(err)
        }
    }
    async deleteOwnUser(req: RequestWithUser, res: Response, next: NextFunction) {
        const {id} = req.user as IUser
        try {
            await this.userService.deleteUser(id)
            return res.status(200).json({message: `user with id ${id} was deleted`})
        } catch (err) {
            next(err)
        }
    }
    async findUserById(req: RequestWithUser, res: Response, next: NextFunction) {
        const {id} = req.params as {id: string}
        try {
            const user = await this.userService.findUserById(id)
            return res.status(200).json(user)
        } catch (err) {
            next(err)
        }
    }
    async findOwnUser(req: RequestWithUser, res: Response, next: NextFunction) {
        const {id} = req.user as IUser
        try {
            const user = await this.userService.findUserById(id)
            return res.status(200).json(user)
        } catch(err) {
            next(err)
        }
    }
}
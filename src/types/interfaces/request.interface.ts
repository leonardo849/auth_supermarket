import { Request } from "express";
import { IUser } from "./user.interface.ts";

export interface RequestWithUser extends Request {
    user?: IUser
}
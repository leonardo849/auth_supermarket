import { CreatedUserEvent } from "../dto/events.dto.ts";
import { UserService } from "../services/user.service.ts";

export class UserConsumer {
    private readonly userService: UserService = new UserService()
    constructor() {

    }
    
}
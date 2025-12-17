import { CreatedUserEvent } from "../dto/events.dto.ts";
import { UserService } from "../services/user.service.ts";

export class UserConsumer {
    private readonly userService: UserService = new UserService()
    constructor() {

    }
    async updateProductServiceValue(body: CreatedUserEvent) { 
        await this.userService.updateProductServiceValue(body.id)
    }
    async deleteUser(id: string): Promise<string> {
        const email = await this.userService.deleteUser(id)
        return email
    }
}
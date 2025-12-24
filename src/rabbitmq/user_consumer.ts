import { AuthService } from "../services/auth.service.ts";
import { CreatedUserEvent } from "../dto/events.dto.ts";
import { UserService } from "../services/user.service.ts";
import { Logger } from "../utils/logger/logger.ts";
import { basename } from "path";

export class UserConsumer {
    private readonly userService: UserService = new UserService()
    private readonly authService: AuthService = new AuthService()
    constructor() {

    }
    async updateProductServiceValue(body: CreatedUserEvent) { 
        try {
            await this.authService.updateProductServiceValue(body.id)
        } catch (err: unknown) {
            Logger.error(err,{file: basename(import.meta.url)})
            throw err
        }

    }
    async deleteUser(id: string): Promise<string|void> {
        const user = await this.userService.getUserServicesById(id)
        if (!user.productService) {
            const email = await this.userService.deleteUser(id)
            return email
        }
        Logger.info({file: basename(import.meta.url)}, `user with id ${id} already exist in product service`)
        return
    }
}
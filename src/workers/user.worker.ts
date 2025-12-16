import { Logger } from "../utils/logger.ts";
import { RabbitMQService } from "../rabbitmq/rabbitmq.ts";
import { UserService } from "../services/user.service.ts";
import { basename } from "path";

export class UserWorker {
    private readonly file: string = basename(import.meta.url)
    private readonly userService: UserService = new UserService()
    constructor() {

    }
    async scheduleJobs() {
        await this.runJobs()
        setInterval(async () => {
            await this.deleteUnverifiedUsers()
        }, 1000 * 60 * 10);
        setInterval(async () => {
            await this.sendEmailToUnverifiedUsers()
            
        }, 1000 * 60 * 5)
    }
    async runJobs() {
        await this.userService.deleteUnverifiedUsers()
        await this.sendEmailToUnverifiedUsers()
    }
    private async deleteUnverifiedUsers() {
        await this.userService.deleteUnverifiedUsers()
        Logger.info({file: this.file}, "deleteUnverifiedUsers was used")
    }
    private async sendEmailToUnverifiedUsers() {
        const emails = await this.userService.findUneverifiedUsersEmail()
        if (emails.length >= 1) {
            RabbitMQService.publisWarningEmail(emails)
            Logger.info({file: this.file}, "email to unverified users was published")
            await this.userService.updateEmailWithNotificationToVerificationHasBeenSent(emails)
        }
        Logger.info({file: this.file}, "sendEmailToUnverifiedUsers was used")
        
    }
}
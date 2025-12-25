import { Logger } from "../utils/logger/logger.ts";
import { RabbitMQService } from "../rabbitmq/rabbitmq.ts";
import { basename } from "path";
import { AuthService } from "../services/auth.service.ts";

export class UserWorker {
    private readonly file: string = basename(import.meta.url)
    private readonly authService: AuthService = new AuthService()
    constructor() {

    }
    async scheduleJobs() {
        await this.runJobs()
        setInterval(async () => {
            await this.deleteUnverifiedUsers()
        }, 1000 * 60 * 10);
        setInterval(async () => {
            await this.expireCodes()
            await this.sendEmailToUnverifiedUsers()
        }, 1000 * 60 * 5)
    }
    async runJobs() {
        await this.authService.deleteUnverifiedUsers()
        await this.sendEmailToUnverifiedUsers()
        await this.expireCodes()
    }
    private async deleteUnverifiedUsers() {
        await this.authService.deleteUnverifiedUsers()
        Logger.info({file: this.file}, "deleteUnverifiedUsers was used")
    }
    private async sendEmailToUnverifiedUsers() {
        const emails = await this.authService.findUneverifiedUsersEmail()
        if (emails.length >= 1) {
            RabbitMQService.publisWarningEmail(emails)
            Logger.info({file: this.file}, "email to unverified users was published")
            await this.authService.updateEmailWithNotificationToVerificationHasBeenSent(emails)
        }
        Logger.info({file: this.file}, "sendEmailToUnverifiedUsers was used") 
    }
    private async expireCodes() {
        await this.authService.expireCodes()
        Logger.info({file: this.file},"expireCodes worker was used")
    }
}
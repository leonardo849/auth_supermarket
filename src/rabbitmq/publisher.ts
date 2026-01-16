import amqp from "amqplib";
import {exchanges, routingKeys} from "../utils/rabbit/vars.ts"
import { Logger } from "../utils/logger/logger.ts";
import { basename } from "path";
import { decoratorCanPublishMessage } from "../utils/decorators/decorator_check_if_can_publish_messages.ts";
import { CreateWorkerEvent, DeletedUserEvent } from "../dto/events.dto.ts";

export class Publisher {
    private readonly file: string = basename(import.meta.url)
    constructor(private readonly channel: amqp.Channel) {
    }
    publishCreatedUserEmail(to: string[], code: string): boolean {
        return this.publishMessages(exchanges.exchangeEmail, routingKeys.email, {to: to, subject: "code", text: `verify with that code:\n ${code}`})
    }
    publishWarningEmail(to: string[]): boolean {
        return this.publishMessages(exchanges.exchangeEmail, routingKeys.email, {to: to, subject: "warning", text: `hurry and verify your user. If you don't verify your user, it will be deleted soon`})
    }
    publishCreatedWorker(body: CreateWorkerEvent): boolean {
        return this.publishMessages(exchanges.exchangeAuth, routingKeys.userCreatedWorker, body)
    }
    publishDeletedWorker(body: DeletedUserEvent): boolean {
        return this.publishMessages(exchanges.exchangeAuth, routingKeys.userDeleted, body)
    }
    publishAccountDeleted(to: string[]): boolean {
        return this.publishMessages(exchanges.exchangeEmail, routingKeys.email, {to: to, subject: "your account was deleted", text: "your user was deleted. Our servers couldn't create your user in all of ours systems. Try to create account later"})
    }
    publishCodeExpired(to: string[]) {
        this.publishMessages(exchanges.exchangeEmail, routingKeys.email, {to: to, subject: "your code was expired", text:`your code was expired. Get a new code`})
    }
    publishNewCode(to: string, code: string) {
        this.publishMessages(exchanges.exchangeEmail, routingKeys.email, {to: [to], subject: "new code", text:`take this new code ${code}`})
    }
    @decoratorCanPublishMessage()
    private publishMessages(exchange: string, routingKey: string, body: any): boolean {
        const published = this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(body)), {persistent: true})
        if (!published) {
            Logger.error(new Error(`message with exchange ${exchange} and routing key ${routingKey} wasn't published`), {file: this.file})
            return published
        }
        Logger.info({file: this.file}, `message with exchange ${exchange} and routing key ${routingKey} was published`)
        return published
    }
}
import { basename } from "path";
import { Logger } from "../utils/logger.ts";
import amqp, { Connection, Channel, Options } from "amqplib";
import { VerifiedUser } from "../dto/events.dto.ts";

export class RabbitMQService {
    private static connection: amqp.ChannelModel
    private static channel: amqp.Channel
    private static file: string = basename(import.meta.url)
    private static exchanges = {
        exchangeEmail: "email_direct",
        exchangeAuth: "auth_topic"
    }
    private static routingKeys = {
        email: "email",
        userVerified: "user.auth.verified"
    }

    static async startRabbit(uri: string) {
        if (process.env.RABBIT_ON && process.env.RABBIT_ON !== "true") {
            Logger.info({file: this.file}, "app won't use rabbit")
            return
        }
        try {
            await this.connectToRabbit(uri)
            await this.createExchanges()
        } catch (err: unknown) {
            Logger.error(err, {file: this.file})
            throw err
        }
    }

    private static async connectToRabbit(uri: string) {
        this.connection = await amqp.connect(uri)
        this.channel = await this.connection.createChannel()
        Logger.info({file: this.file}, "connected to rabbit")
    }
    private static async createExchanges() {
        const exchangeEmail = this.exchanges.exchangeEmail
        await this.channel.assertExchange(exchangeEmail, "direct", {durable: true})
        Logger.info({file: this.file}, `creating exchange ${exchangeEmail}`)
        const exchangeAuth = this.exchanges.exchangeAuth
        await this.channel.assertExchange(exchangeAuth, "topic", {durable: true})
        Logger.info({file: this.file}, `creating exchange ${exchangeAuth}`)
    }
    static async  disconnectRabbit() {
        if (this.channel) {
            await this.channel.close()
        }

        if (this.connection) {
            await this.connection.close()
        }

        Logger.info({file: this.file}, "disconnected from Rabbit")
    }
    static  publishCreatedUserEmail(body: {to: string[], subject: string, text: string}) {
        this.publishMessages(this.exchanges.exchangeEmail, this.routingKeys.email, body)
    }
    static publishVerifiedUser(body: VerifiedUser) {
        this.publishMessages(this.exchanges.exchangeAuth, this.routingKeys.userVerified, body)
    }
    private static publishMessages(exchange: string, routingKey: string, body: any): boolean {
        if (process.env.RABBIT_ON && process.env.RABBIT_ON !== "true") {
            Logger.info({file: this.file}, `[fake] sending message to exchange ${exchange} routing key ${routingKey}`)
            return true
        }
        const published = this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(body)), {persistent: true})
        if (!published) {
            Logger.error(new Error(`message with exchange ${exchange} and routing key ${routingKey} wasn't published`), {file: this.file})
            return published
        }
        Logger.info({file: this.file}, `message with exchange ${exchange} and routing key ${routingKey} was published`)
        return published
    }
}

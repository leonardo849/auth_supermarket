import { basename } from "path";
import { Logger } from "../utils/logger/logger.ts";
import amqp, { Connection, Channel, Options } from "amqplib";
import { CreateWorkerEvent, DeletedUserEvent } from "../dto/events.dto.ts";
import { UserConsumer } from "./user_consumer.ts";
import httpError from "http-errors"

export class RabbitMQService {
    private static connection: amqp.ChannelModel
    private static channel: amqp.Channel
    private static file: string = basename(import.meta.url)
    private static exchanges = {
        exchangeEmail: "email_direct",
        exchangeAuth: "auth_topic",
        exchangePayment: "payment_topic",
        exchangeProductAuth: "product_auth_direct",
        exchangeSale: "sale_topic",
        exchangeAuthProduct: "auth_product_direct"
    }
    private static queueName: string = "queue_auth"
    private static routingKeys = {
        email: "email",
        userCreatedProduct: "user.product.created",
        userCreatedProductError: "user.product.created_error",
        userVerified: "user.auth.verified",
        userCreatedWorker: "user.auth.created_worker",
        userDeleted: "user.auth.deleted"
    }

    static async startRabbit(uri: string) {
        if (process.env.RABBIT_ON && process.env.RABBIT_ON !== "true") {
            Logger.info({file: this.file}, "app won't use rabbit")
            return
        }
        try {
            await this.connectToRabbit(uri)
            await this.createExchanges()
            await this.createQueue()
            await this.bindQueue()
            this.consumer()
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
        const exchangeProductAuth = this.exchanges.exchangeProductAuth
        await this.channel.assertExchange(exchangeProductAuth, "direct", {durable: true})
        Logger.info({file: this.file}, `creating exchange ${exchangeProductAuth}`)
        const exchangeSale = this.exchanges.exchangeSale
        await this.channel.assertExchange(exchangeSale, "topic", {durable: true})
        Logger.info({file: this.file}, `creating exchange ${exchangeSale}`)
        // const exchangeAuthProductDirect = this.exchanges.exchangeAuthProduct
        // await this.channel.assertExchange(exchangeAuthProductDirect, "direct", {durable: true})
    }
    private static async createQueue() {
        await this.channel.assertQueue(this.queueName, {durable: true})
        Logger.info({file: this.file}, `creating queue ${this.queueName}`)
        // await this.channel.bindQueue(this.queueName, this.exchanges.exchangeSale, "user.sale.*")
    }
    private static async bindQueue() {
        await this.channel.bindQueue(this.queueName, this.exchanges.exchangeProductAuth, this.routingKeys.userCreatedProduct)
        await this.channel.bindQueue(this.queueName, this.exchanges.exchangeProductAuth, this.routingKeys.userCreatedProductError)
    }
    private static  consumer() {
        this.channel.consume(this.queueName, async(msg: any) => {
            if (!msg || !msg.content) return
            try {
                const json = JSON.parse(msg.content.toString())
                Logger.info({file: this.file}, `routing key: ${msg.fields.routingKey}`)
                Logger.info({file: this.file}, `json: ${msg.content.toString()}`)
                await this.handlerRoutingKeys(json, msg.fields.routingKey)
                this.channel.ack(msg)
            } catch (err) {
                this.channel.nack(msg, false, false)
                Logger.error(err, {file: this.file})
            }
        })
    }
    private static  async handlerRoutingKeys(json: any, routingKey: string) {
        const userConsumer = new UserConsumer()
        if (routingKey === this.routingKeys.userCreatedProduct) {
            try {
                await userConsumer.updateProductServiceValue(json)
                Logger.info({file: this.file}, `user with id ${json.id} was updated. Its productService value is true`)
            } catch (err: any) {
                if (err instanceof httpError.HttpError && err.status === 404) {
                    this.publishDeletedWorker({id: json.id})
                }
                Logger.error(err, {file: this.file})
                throw err
            }
        } else if (routingKey === this.routingKeys.userCreatedProductError) {
            Logger.info({file: this.file}, `user with id ${json.id} wasn't created in product service. Auth service will delete it if user's product service value is false`)
            const email = await userConsumer.deleteUser(json.id)
            if (email) {
                this.publishAccountDeleted([email])
            }
            Logger.info({file: this.file}, `it wasn't possible to delete user with id ${json.id}`)
            
        }
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
    static  publishCreatedUserEmail(to: string[], code: string) {
        this.publishMessages(this.exchanges.exchangeEmail, this.routingKeys.email, {to: to, subject: "code", text: `verify with that code:\n ${code}`})
    }
    static publisWarningEmail(to: string[]) {
        this.publishMessages(this.exchanges.exchangeEmail, this.routingKeys.email, {to: to, subject: "warning", text: `hurry and verify your user. If you don't verify your user, it will be deleted soon`})
    }
    static publishAccountDeleted(to: string[]) {
        this.publishMessages(this.exchanges.exchangeEmail, this.routingKeys.email, {to: to, subject: "your account was deleted", text: "your user was deleted. Our servers couldn't create your user in all of ours systems. Try to create account later"})
    }
    static publishCreatedWorker(body: CreateWorkerEvent) {
        this.publishMessages(this.exchanges.exchangeAuth, this.routingKeys.userCreatedWorker, body)
    }
    static publishDeletedWorker(body: DeletedUserEvent) {
        this.publishMessages(this.exchanges.exchangeAuth, this.routingKeys.userDeleted, body)   
    }
    static publishCodeExpired(to: string[]) {
        this.publishMessages(this.exchanges.exchangeEmail, this.routingKeys.email, {to: to, subject: "your code was expired", text:`your code was expired. Get a new code`})
    }
    static publishNewCode(to: string, code: string) {
        this.publishMessages(this.exchanges.exchangeEmail, this.routingKeys.email, {to: [to], subject: "new code", text:`take this new code ${code}`})
    }
    static publishProductService(to: string) {
        this.publishMessages(this.exchanges.exchangeEmail, this.routingKeys.email, {to: [to], subject: "product service", text:`you are already able to use the product service`})
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

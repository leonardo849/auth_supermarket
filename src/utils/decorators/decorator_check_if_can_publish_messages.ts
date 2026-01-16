import { basename } from "path"
import { Logger } from "../logger/logger.ts"
const file = basename(import.meta.url)

export function decoratorCanPublishMessage() {
    return function(target: any, property: string, descriptor: PropertyDescriptor) {
        const originalMethod =  descriptor.value
        descriptor.value = function(...args: any[]) {
            if (process.env.RABBIT_ON && process.env.RABBIT_ON !== "true") {
                const exchange = args[0]
                const routingKey = args[1]
                Logger.info({file: file}, `[fake] sending message to exchange ${exchange} routing key ${routingKey}`)
                return 
            }
            return originalMethod.apply(this, args)
        }
    }
}
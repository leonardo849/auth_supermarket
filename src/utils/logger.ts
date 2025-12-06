import pino from "pino"

export class Logger {
    private static logger = pino({
        level: "info",
        transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard"
        }
        }
    })
    static info(context: any = {}, message: string) {
        this.logger.info(context, message)
    }
    static error(error: unknown, context: any = {}) {
        if (error instanceof Error) {
            this.logger.error({err: error,  ...context}, error.message)
        }
    }
}
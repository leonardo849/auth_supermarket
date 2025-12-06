import { BaseServer } from "./classes/server.abstract.js";
import express, {Express} from "express"
import { Logger } from "./utils/logger.js";
import { basename } from "path";

export class Server extends BaseServer { 
    private app: Express =  express()
    constructor(port: number) {
        super(port)
    }
    async start(): Promise<void> {
        const server = this.app.listen(this.port, () => {
            Logger.info({file: basename(import.meta.url)}, "trying to run server") 
        })

        server.on("error", (err: Error) => {
            Logger.error(err, {file: basename(import.meta.url), err})
            process.exit(1)
        })

        Logger.info({file: basename(import.meta.url)}, `server is running on port ${this.port}`)
    }
}
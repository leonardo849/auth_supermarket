import { BaseServer } from "./classes/server.abstract.ts";
import  { Request, Response} from "express"
import { Logger } from "./utils/logger.ts";
import { basename } from "path";

export class Server extends BaseServer { 
    constructor() {
        super()
        this.setupApp()
    }
    setupApp() {
        this.app.get("/", function(req: Request, reply: Response) {
            reply.status(200).json({message: "hello"})
        })
    }
    start(port: number) {
        
        const server = this.app.listen(port, () => {
            Logger.info({file: basename(import.meta.url)}, "running server") 
        })
        server.on("error", (err: Error) => {
            Logger.error(err, {file: basename(import.meta.url), err})
            process.exit(1)
        })

        

        Logger.info({file: basename(import.meta.url)}, `server is running on port ${port}`)
    }
}
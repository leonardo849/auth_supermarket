import { BaseServer } from "../classes/server.abstract.ts";
import  express, { IRoute, Request, Response} from "express"
import { Logger } from "../utils/logger/logger.ts";
import { basename } from "path";
import { UserRoutes } from "./routes/user.routes.ts";
import { errorHandler } from "./middlewares/error_handler.ts";
import { AuthRoutes } from "./routes/auth.routes.ts";

export class Server extends BaseServer { 
    constructor() {
        super()
        this.setupApp()
    }
    setupApp() {
        this.app.get("/", function(req: Request, reply: Response) {
            reply.status(200).json({message: "hello"})
        })
        this.app.use(express.json())
        const userRoutes = new UserRoutes()
        const authRoutes = new AuthRoutes()
        this.app.use("/users", userRoutes.setupRoutes())
        this.app.use("/auth", authRoutes.setupRoutes())
        Logger.info({file: basename(import.meta.url)}, "setting up app")
        this.app.use(errorHandler)
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
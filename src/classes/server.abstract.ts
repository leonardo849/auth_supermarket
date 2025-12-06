import express,{Express} from "express"

export abstract class BaseServer {
    protected port: number;
    protected app: Express = express()
    constructor(port :number) {
        this.port = port
    }
    abstract start(): Promise<void>

    protected getApp(): Express {
        return this.app
    }
}
export abstract class BaseServer {
    protected port: number;

    constructor(port :number) {
        this.port = port
    }
    abstract start(): Promise<void>
}
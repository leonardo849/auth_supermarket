export abstract class HttpError  {
    constructor(public readonly status: number, public readonly JSON: {error: string}) {

    }
}
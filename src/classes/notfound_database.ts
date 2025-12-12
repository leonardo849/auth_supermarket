export class NotFoundDatabase extends Error {
    constructor(err: string) {
        super(`not found in database ${err}`)
    }
}
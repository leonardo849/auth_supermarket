export class DatabaseError extends Error {
    constructor(err: string) {
        super(`database error ${err}`)
    }
}
export class DatabaseError extends Error {
    constructor(public readonly err: any) {
        super("database error")
    }
}
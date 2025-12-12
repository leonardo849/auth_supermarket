export class ErrorComparePasswords extends Error {
    constructor(err: string) {
        super(`error compare password ${err}`)
    }
}
import httpError from "http-errors"


export function errorHandler(err: unknown): httpError.HttpError {
    if (err instanceof httpError.HttpError) {
        return err
    }
    if (err instanceof Error) {
        const message: string = err.message
        return httpError.InternalServerError(message)
    }
    return httpError.InternalServerError("unknown error")
}
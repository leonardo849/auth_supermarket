import { basename } from "path"
import { Logger } from "../../utils/logger.ts"
import {NextFunction, Request, Response} from "express"
import httpError from "http-errors"

const file = basename(import.meta.url)

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    Logger.error(err, {file})
    if (err instanceof httpError.HttpError) {
        res.status(err.status).json({error: err.message})
        return next()
    } 
    res.status(500).json({error: `unknow error ${err}` })
    return next()
    
}
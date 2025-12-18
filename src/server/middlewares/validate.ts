// import { Logger } from "../../utils/logger.ts"
// import { plainToInstance } from "class-transformer"
// import { validate } from "class-validator"
// import {NextFunction, Request, Response} from "express"
// import { basename } from "path"

// export function validateMiddleware(dtoClass: any) {
//     return async function(req: Request, res: Response, next: NextFunction) {
//         const dtoObject = plainToInstance(dtoClass, req.body)
//         const errors = await validate(dtoObject)
//         if (errors.length === 0) {
//             req.body = dtoObject
//             return next()
//         }
//         Logger.error(new Error(errors.toString()), {file: basename(import.meta.url)})
//         return res.status(400).json({error: errors.toString()})
//     }
// }
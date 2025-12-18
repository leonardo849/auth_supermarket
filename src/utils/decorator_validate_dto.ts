import { RequestWithUser } from "@src/types/interfaces/request.interface.ts"
import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { basename } from "path"
import { Logger } from "./logger.ts"
import createHttpError from "http-errors"

const file = basename(import.meta.url)

export function ValidateDto(dto: any) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		const original = descriptor.value

		descriptor.value = async function (...args: any[]) {
			const req = args[0] as RequestWithUser

			const dtoObject = plainToInstance(dto, req.body)
			const errors = await validate(dtoObject)

			if (errors.length > 0) {
				Logger.error(new Error(errors.toString()), { file })
				throw createHttpError.BadRequest(errors.toString())
			}

			req.body = dtoObject
			return await original.apply(this, args)
		}

		return descriptor
	}
}

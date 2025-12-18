import { UpdateQuery } from "mongoose"
import { isPlainObject } from "./is_plain_object.ts"

export function validateUpdateQuery<T>(
	update: UpdateQuery<T>,
	allowedFields: string[],
	allowedOperators: string[]
): boolean {
	if (!isPlainObject(update) || Object.keys(update).length === 0) {
		return false
	}

	for (const operator of Object.keys(update)) {
		if (!allowedOperators.includes(operator)) {
			return false
		}

		const payload = update[operator as keyof UpdateQuery<T>]

		if (!isPlainObject(payload) || Object.keys(payload).length === 0) {
			return false
		}

		for (const field of Object.keys(payload)) {
			if (!allowedFields.includes(field)) {
				return false
			}
		}
	}

	return true
}

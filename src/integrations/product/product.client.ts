import { basename } from "path";
import { Logger } from "../../utils/logger/logger.ts";
import httpError from "http-errors"
import {checkIfServicesAreOn} from "../../utils/config/are_services_on.ts"

type getUserInErrorsType = {allowed: boolean, error: string|null}

export class ProductClient {
	private baseUrl: string
	private file = basename(import.meta.url)

	constructor() {
		this.baseUrl = process.env.PRODUCT_SERVICE as string
	}

	async getUserInErrors(id: string, token: string): Promise<getUserInErrorsType>  {
        if (!checkIfServicesAreOn()) {
            return {allowed: true, error: null}
        }
		const res = await fetch(`${this.baseUrl}/user/${id}/permissions/errors`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

		if (!res.ok) {
			const text = await res.text()
            let error: any
            if (res.status === 404) {
                error = httpError.NotFound(`status code ${res.status}: ${text}`)
            } else  {
                error = httpError.InternalServerError(`status code ${res.status}: ${text}`)
            }
            
            Logger.error(error, {file: this.file})
			throw error
		}

		const json = (await  res.json()) as getUserInErrorsType
        return json
	}
}

import { basename } from "path"
import { Logger } from "../../utils/logger/logger.ts"
import axios, { AxiosInstance } from "axios"

type checkIfUserIsInErrors = {allowed: boolean, error: string|null}

export class ProductClient {
    private readonly client: AxiosInstance
    private readonly file: string = basename(import.meta.url)
    constructor() {
        if (process.env.PRODUCT_SERVICE === "" || !process.env.PRODUCT_SERVICE) {
            Logger.error(new Error("product service url doesn't exist"), {file: this.file})
            process.exit(1)
        }
        const url = process.env.PRODUCT_SERVICE
        this.client = axios.create({
            baseURL: url,
            timeout: 5000
        })
        
    }
    
    async CheckIfUserIsInErrors(token: string, targetId: string): Promise<checkIfUserIsInErrors> {
        if (!this.checkIfServicesAreOn()) {
            return {allowed: true, error: null}
        }
        try {
            const res = await this.client.get<checkIfUserIsInErrors>(`/user/${targetId}/permissions/errors`, {
            headers: {
                "Authorization": `Bearer ${token}`
                }
            })
            return res.data
        } catch (err: unknown) {
            if (err instanceof axios.AxiosError) {
                Logger.error(err.message, {file: this.file})
                throw err
            }
            Logger.error(new Error("error in request"), {file: this.file})
            throw err
        }
    }
    private checkIfServicesAreOn(): boolean {
        if (!process.env.SERVICES) {
            return false
        }
        return process.env.SERVICES.toLowerCase() === "true"
    }
} 
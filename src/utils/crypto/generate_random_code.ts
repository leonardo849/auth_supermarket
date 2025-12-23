import { randomInt } from "crypto"

export function generateRandomCode(quantityOfNumbers: number = 6): string {
    let code: string = ""
    for (let i = 1; i<=quantityOfNumbers; i++) {
        code += randomInt(0, 10).toString()
    }
    
    return code
}
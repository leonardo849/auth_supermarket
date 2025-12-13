import { getRandomInt } from "./random_int.ts"

export function generateRandomCode(quantityOfNumbers: number = 6): string {
    const arr: number[] = []
    for (let i = 1; i<=quantityOfNumbers; i++) {
        arr.push(getRandomInt(0, 9))
    }
    const code = arr.join("")

    return code
}
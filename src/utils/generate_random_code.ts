import { getRandomInt } from "./random_int.ts"

export function generateRandomCode(): string {
    const arr: number[] = []
    for (let i = 1; i<=6; i++) {
        arr.push(getRandomInt(0, 9))
    }
    const code = arr.join("")

    return code
}
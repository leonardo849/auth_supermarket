import {compare} from "../../src/utils/hash.ts"
import {generateRandomCode} from "../../src/utils/generate_random_code.ts"
import bcrypt from "bcrypt"
import { getRandomInt } from "../../src/utils/random_int.ts"
import {validateToken, generateJwt} from "../../src/utils/jwt.ts"
import {IUser} from "../../src/types/interfaces/user.interface.ts"
import { Roles } from "../../src/types/enums/roles.ts"



describe("test functions", () => {
    it("should compare a hash", async () => {
        const password = "batman123"
        const hash = await bcrypt.hash(password, 10)
        const value = await compare(password, hash)
        expect(value).toBe(true)
    })
    it("should generate a random int between 0 and 9", async() => {
        const code = getRandomInt(0, 9)
        expect(code).toBeGreaterThanOrEqual(0)
        expect(code).toBeLessThanOrEqual(9)
    })
    it("should generate random code", async() => {
        const quantityOfNumbers = 6
        const code = generateRandomCode(quantityOfNumbers)
        expect(code.length).toBe(quantityOfNumbers)
    })
    const iUser: IUser = {
        id: "kdoafkfoadkofdkokfosdofk",
        role: Roles.CUSTOMER
    }
    it("generate a jwt", async() => {
        const jwt = generateJwt(iUser)
        expect(jwt).toBeDefined()
        expect(typeof jwt).toBe("string")
        expect(jwt.length).toBeGreaterThan(0)
    })
    it("should validate a jwt", async() => {
        const token = generateJwt(iUser)
        const payload = validateToken(token) as IUser
        if (payload.id !== iUser.id || payload.role !== iUser.role ) {
            throw new Error("error validate token")
        }
    })
})
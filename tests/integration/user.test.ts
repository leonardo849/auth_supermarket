import request from "supertest"
import { app, genericalPassword } from "../setup.ts"
import { CreateUserDTO } from "../../src/dto/user.dto.ts"
import usersJson from "../../src/database/seeds/users.json" with {type: "json"}
import { Roles } from "../../src/types/enums/roles.ts"

describe("test user's routes", () => {
    const prefixUsers = "/users"
    const prefixAuth = "/auth"
    let tokenDev: string
    let tokenManager: string
    const dev = usersJson.find(element => element.role === Roles.DEVELOPER)
    const manager = usersJson.find(element => element.role === Roles.MANAGER)
    it("should return http 200 create user ", async () => {
        const body:CreateUserDTO = {
            address: {
                city: "gotham",
                neighborhood: "downtown",
                number: 1929,
                state: "batman state",
                street: "batman street"
            },
            dateOfBirth: "1990-10-10",
            email: "batman@gmail.com",
            name: "Bruce Wayner",
            password: genericalPassword
        }
        const response = await request(app).post(prefixUsers). 
        send(body)

        expect(response.status).toBe(200)
        
        expect(response.body).toEqual({message: "user was created"})
    })
    it("should return http 400 create user", async () => {
        
        const body:CreateUserDTO = {
            address: {
                city: "gotham",
                neighborhood: "downtown",
                number: 32.2,
                state: "batman state",
                street: "batman street"
            },
            dateOfBirth: "1990-10-10",
            email: "batman@gmail.com",
            name: "Bruce Wayner",
            password: "123456"
        }
        const response = await request(app).post(prefixUsers). 
        send(body)

        expect(response.status).toBe(400)
    })
    it("login dev", async () => {
        const loginDev = {
            email: dev?.email,
            password: dev?.password
        }
        const response = await request(app).post(`${prefixAuth}/login`). 
        send(loginDev)
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("token")
        tokenDev = response.body.token 
    })
    it("login manager", async() => {
        const loginManager = {
            email: manager?.email,
            password: manager?.password
        }
        const response = await request(app).post(`${prefixAuth}/login`). 
        send(loginManager)
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("token")
        
        tokenManager = response.body.token
    })
    it("find all", async () => {
        const response = await request(app).get(`${prefixUsers}`). 
        set("Authorization", `Bearer ${tokenManager}`)
        expect(response.status).toBe(200)
        expect(response.body.length).toBeGreaterThanOrEqual(3)
    })
})
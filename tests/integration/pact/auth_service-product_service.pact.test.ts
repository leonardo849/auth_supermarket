import { PactV4, MatchersV3 } from "@pact-foundation/pact"
import path from "path"
import { ProductClient } from "../../../src/integrations/product/product.client.ts"

const { like, boolean } = MatchersV3

describe("Pact V4 | AuthService -> product_service", () => {
	beforeAll(() => {
		process.env.SERVICES = "false"
	})

	it("should validate product_service contract", async () => {
		const pact = new PactV4({
			consumer: "auth_service",
			provider: "product_service",
			dir: path.resolve(process.cwd(), "pacts"),
		})

		const userId = "user-id-123"
		const token = "user_token"

		await pact
			.addInteraction()
			.given("user exists and permissions were evaluated")
			.uponReceiving("a request to check if user is in error in product_service")
			.withRequest("GET", `/user/${userId}/permissions/errors`, (builder) => {
				builder.headers({
					Authorization: `Bearer ${token}`,
				})
			})
			.willRespondWith(200, (builder) => {
				builder
					.headers({
						"Content-Type": "application/json",
					})
					.jsonBody({
						allowed: boolean(true),
						error: like(null),
					})
			})
			.executeTest(async (mockServer) => {
				process.env.PRODUCT_SERVICE = mockServer.url
				process.env.SERVICES = "true"

				const client = new ProductClient()

				const response = await client.getUserInErrors(userId, token)

				expect(response.allowed).toBe(true)
				expect(response).toHaveProperty("error")
			})
	})
})

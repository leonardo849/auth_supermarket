import { Index } from "../src/index"
import mongoose from "mongoose"
import {Express} from "express"


export const genericalPassword = ";0p$e(v^EY38"

let index: Index
export let app: Express

async function deleteAllInMongodb() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
}



beforeAll(async () => {
    process.env.RABBIT_ON = "false"
    index = new Index()
    index.initEnvironment()
    await index.connectToDatabases()
    await index.connectToRabbit()
    await deleteAllInMongodb()
    await index.migrateSeeds()
    index.setupServer()

    
    app = index.getApp()

    
})

afterAll(async () => {
    await deleteAllInMongodb()
    await index.disconnectToDatabases()
    await index.disconnectFromRabbit()
})

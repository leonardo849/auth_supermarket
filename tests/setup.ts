import {Index} from "../src/index"

const index = new Index()
index.initEnvironment()
index.connectToDatabases()
index.setupServer()


export const app = index.getApp()



import {Index} from "../src/index"

const index = new Index()
index.initEnvironment()
index.setupServer()


export const app = index.getApp()



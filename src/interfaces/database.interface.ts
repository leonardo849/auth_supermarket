export interface IDatabase {
    connectToDB(): Promise<void>
}
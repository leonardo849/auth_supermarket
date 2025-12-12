import bcrypt from "bcrypt";


export async function compare(password: string, passwordInDB: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordInDB)
}
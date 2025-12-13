import bcrypt from "bcrypt";


export async function compare(string: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(string, hash)
}
import { hash, compare, genSalt } from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const saltRounds: number = parseInt(process.env.ROUNDS!);

export const verifyPassword = async (password : string, dbHash : string) : Promise<boolean> => {
    return await compare(password, dbHash);
}

export const generateHas = async (password: string) : Promise<string> => {
    try {
        const salt = await genSalt(saltRounds);
        return hash(password, salt);
    } catch(error) {
        throw error;
    }
}
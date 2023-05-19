import { hash, compare } from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const saltRounds = process.env.ROUNDS!;

export const verifyPassword = async (password : string, dbHash : string) : Promise<boolean> => {
    return await compare(password, dbHash);
}

export const generateHas = async (password: string) : Promise<string> => {
    return await hash(password, saltRounds);
}
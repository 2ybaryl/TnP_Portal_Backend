import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
dotenv.config();

const secret : string = process.env.SECRET!;
const expirationTime : string = process.env.EXP_TIME!;

// Assign a JWT token to a user logging in
export const assign = async (id: String, role: Number) : Promise<string> => {
    let res : string = "";
    await jwt.sign({id: id, role: role}, secret, {expiresIn: expirationTime},
        (err, token)=>{
            if(err){
                throw err;
            } else {
                res=token!;
                console.log(token);
            }
        }
    );
    return res;
};

// Verify user's JWT token
export const verify = async (token: string) : Promise<Object> => {
    let r : Object = {};
    await jwt.verify(token, secret, (err, decoded)=>{
        if(err){
            throw err;
        } else {
            r=decoded!;
        }
    })
    return r;
}
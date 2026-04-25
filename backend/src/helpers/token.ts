import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'Manthan';
const JWT_EXPIRY_MIN = Number(process.env.JWT_EXPIRY_MIN) || 30;


export function generateAuthToken(data: object): string {
    return JWT_EXPIRY_MIN
        ? jwt.sign(data, JWT_SECRET, { expiresIn: JWT_EXPIRY_MIN * 60 })
        : jwt.sign(data, JWT_SECRET);
}

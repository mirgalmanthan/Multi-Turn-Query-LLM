import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';

dotenv.config();


export function verifyAuthToken(request: Request, response: Response, next: NextFunction) {
    console.log("verify token invoked");
    let token = request.headers.authorization?.replace("Bearer", "").trim() || ""
    console.log("token:" + token)
    console.log('req under verify token:')
    try {
        let payload = jwt.verify(token, process.env.JWT_SECRET || "")
        console.log("payload")
        console.log(payload)
        if (payload && typeof payload !== "string") {
            console.log("payload found")
            console.log(payload)
            next()
        } else {
            response.status(403).json({
                "error": true,
                "error_payload": {
                    "message": "Invalid token format"
                }
            })
        }
    } catch (e) {
        console.log("ERROR:" + e)
        response.status(403).json({
            "error": true,
            "error_payload": {
                "message": "Invalid token"
            }
        })
    }
}

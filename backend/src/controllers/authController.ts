import { Request, Response } from 'express';
import { generateAuthToken } from '../helpers/token';
import { ApiResponse } from '../structs/io';


export function demoToken(req: Request, res: Response): void {
    const token = generateAuthToken({ sub: 'demo', role: 'USER' });

    const response = new ApiResponse(200, [], { token });
    res.status(200).json(response);
}

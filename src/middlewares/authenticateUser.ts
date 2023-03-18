import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


const verifyJWT = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization || req.headers.Authorization as string;
    const tokenSecret = process.env.SERVER_ACCESS_TOKEN_SECRET as string;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).send("Expected ACCESS_TOKEN");
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            tokenSecret,
        );
        req.userId = (decoded as any).aud;
        return next();
    }
    catch (error) {
        return res.sendStatus(403);
    }

}


export default verifyJWT;
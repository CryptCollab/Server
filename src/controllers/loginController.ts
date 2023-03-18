import { Request, Response } from "express";
import JWT, { SignOptions } from "jsonwebtoken";
import { getUserWithEmail, User } from "../databaseUtil";
import emailValidator from "email-validator";
import bcrypt from "bcrypt";



export default async function loginController(req: Request, res: Response) {
    // Check if email is valid
    const email = req.body.email;
    if (email === undefined) {
        return res.status(400).send("Email is a required field");
    }
    else if (typeof email !== "string") {
        return res.status(400).send("Email must be of type string");
    }
    else if (!emailValidator.validate(email)) {
        return res.status(400).send("This email is not valid");
    }
    // Check if password is valid
    const password = req.body.password;
    if (password === undefined) {
        return res.status(400).send("Password is a required field");
    }
    else if (typeof password !== "string") {
        return res.status(400).send("Password must be of type string");
    }
    // Get user credentials from database and compare them
    const user = await getUserWithEmail(email);
    if (user.length === 0) {
        return res.status(404).send("Account associated with the email does not exist");
    }
    else if (!bcrypt.compareSync(password, user[0].password)) {
        return res.status(401).send("Invalid password or email");
    }
    const { userData, accessToken, refreshToken } = getUserDetailsWithTokens(user[0]);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 1000 * 60 * 5
    });
    return res.send({ user: userData, accessToken });
}

export function generateAccessToken(userID: string) {

    const accessTokenSecret = process.env.SERVER_ACCESS_TOKEN_SECRET as string;

    const signingOptions: SignOptions = {
        expiresIn: "1h",
        issuer: "https://www.github.com/CryptCollab",
        audience: userID
    }

    return JWT.sign({}, accessTokenSecret, signingOptions);

}

export function generateRefreshToken(userID: string) {

    const refreshTokenSecret = process.env.SERVER_REFRESH_TOKEN_SECRET as string;

    const signingOptions: SignOptions = {
        expiresIn: "30d",
        issuer: "https://www.github.com/CryptCollab",
        audience: userID
    }

    return JWT.sign({}, refreshTokenSecret, signingOptions);

}


export function getUserDetailsWithTokens(user: User) {
    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    return {
        userData: {
            email: user.email,
            userName: user.user_name,
            userID: user.user_id
        },
        accessToken,
        refreshToken,
    }

}

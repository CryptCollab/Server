import { Response } from "express";
import { SignOptions } from "jsonwebtoken";
import { User, saveRefreshToken } from "./database/api";
import JWT from "jsonwebtoken";

export function generateAccessToken(userID: string) {

	const accessTokenSecret = process.env.SERVER_ACCESS_TOKEN_SECRET as string;

	const signingOptions: SignOptions = {
		expiresIn: "15m",
		issuer: "https://www.github.com/CryptCollab",
		audience: userID
	};

	return JWT.sign({}, accessTokenSecret, signingOptions);

}

export function generateRefreshToken(userID: string) {

	const refreshTokenSecret = process.env.SERVER_REFRESH_TOKEN_SECRET as string;

	const signingOptions: SignOptions = {
		expiresIn: "30d",
		issuer: "https://www.github.com/CryptCollab",
		audience: userID
	};

	return JWT.sign({}, refreshTokenSecret, signingOptions);

}


export async function sendUserDetailsWithTokens(res: Response, user: User) {
	const accessToken = generateAccessToken(user.entityId);
	const refreshToken = generateRefreshToken(user.entityId);

	await saveRefreshToken(refreshToken, user.entityId);

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		sameSite: "strict",
		secure: (process.env.NODE_ENV === "production"),
		maxAge: 1000 * 60 * 5
	});

	return res.send({
		userData: {
			email: user.toJSON().email,
			userName: user.toJSON().user_name,
			userID: user.entityId
		}, accessToken
	});

}
import { Response } from "express";
import { SignOptions } from "jsonwebtoken";
import { User, saveRefreshTokenToDatabase, deleteRefreshTokenFromDatabase } from "./database/api";
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

export function sendUserDataWithAccessToken(res: Response, user: User) {

	const accessToken = generateAccessToken(user.entityId);

	return res.send({
		userData: {
			email: user.toJSON().email,
			userName: user.toJSON().user_name,
			userID: user.entityId,
			accessToken
		},
	});
}

export async function setRefreshToken(res: Response, user: User) {
	//Generate refresh token
	const refreshToken = generateRefreshToken(user.entityId);

	//Save refresh token to database
	await saveRefreshTokenToDatabase(refreshToken, user.entityId);

	//Set refresh token cookie
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		sameSite: "none",
		secure: (process.env.NODE_ENV === "production"),
		maxAge: 1000 * 60 * 5
	});
}


export async function deleteRefreshToken(res: Response, refreshToken: string) {

	await deleteRefreshTokenFromDatabase(refreshToken);

	res.clearCookie("refreshToken", {
		httpOnly: true,
		sameSite: "none",
		secure: (process.env.NODE_ENV === "production")
	});
}


export async function sendUserDataWithTokens(res: Response, user: User) {

	await setRefreshToken(res, user);

	return sendUserDataWithAccessToken(res, user);

}
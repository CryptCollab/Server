import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { doesRefreshTokenExsists, getRefreshToken, getUserWithId } from "../database/api";
import { generateAccessToken } from "../tokenUtils";


export default async function refreshController(req: Request, res: Response) {

	const cookies = req.cookies;

	if (!cookies?.refreshToken) {
		return res.status(401).send("Unauthorized");
	}

	const refreshToken = cookies.refreshToken;

	const userID = await getRefreshToken(refreshToken);

	if (userID === null) {
		return res.status(403).send("Invalid Refresh Token 1");
	}

	const tokenSecret = process.env.SERVER_REFRESH_TOKEN_SECRET as string;
	try {
		const decoded: any = jwt.verify(refreshToken, tokenSecret);

		if (decoded?.aud !== userID) {
			return res.send(403).send("Invalid Refresh Token 2");
		}

	}
	catch (error) {
		console.error(error);
		return res.status(403).send("Invalid Refresh Token 3");
	}

	const accessToken = generateAccessToken(userID);
	const user = await getUserWithId(userID);
	if (user === null) {
		return res.status(500).send("Internal Server Error");
	}

	return res.send({
		userData: {
			userName: user.toJSON().user_name,
			email: user.toJSON().email,
			userID: user.entityId,
		}, accessToken
	});


}
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getRefreshToken, getUserWithID } from "../database/api";
import { sendUserDataWithAccessToken } from "../tokenUtils";


export default async function refreshController(req: Request, res: Response) {

	const cookies = req.cookies;

	if (!cookies?.refreshToken) {
		return res.sendStatus(401);
	}

	const refreshToken = cookies.refreshToken;

	const userID = await getRefreshToken(refreshToken);

	if (userID === null) {
		return res.status(403);
	}

	const tokenSecret = process.env.SERVER_REFRESH_TOKEN_SECRET as string;
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const decoded: any = jwt.verify(refreshToken, tokenSecret);

		if (decoded?.aud !== userID) {
			return res.sendStatus(403);
		}

	}
	catch (error) {
		console.error(error);
		return res.sendStatus(403);
	}


	const user = await getUserWithID(userID);
	if (user === null) {
		return res.status(500).send("Internal Server Error");
	}

	return sendUserDataWithAccessToken(res, user);

}
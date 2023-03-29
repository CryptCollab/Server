import { Request, Response } from "express";
import { deleteRefreshToken } from "../tokenUtils";


export default async function logoutController(req: Request, res: Response) {

	const cookies = req.cookies;
	if (!cookies?.refreshToken) return res.sendStatus(204); //No content

	await deleteRefreshToken(res, cookies.refreshToken);

	return res.sendStatus(204);
}
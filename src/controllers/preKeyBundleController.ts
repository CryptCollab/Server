import { Request, Response } from "express";
import { UserPreKeyBundle, insertUserPreKeyBundleIntoDatabase } from "../database/api";


export default async function preKeyBundleController(req: Request, res: Response) {
	const userID = req.userID as string;
	const preKeyBundle = req.body;
	const userBundle: UserPreKeyBundle = {
		userID: userID,
		preKeyBundle: preKeyBundle
	};
	await insertUserPreKeyBundleIntoDatabase(userBundle as UserPreKeyBundle);
	res.status(200).send("PrekeyBundle saved to DB");
}
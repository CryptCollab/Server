import { Request, Response } from "express";
import { insertUserKeyStoreIntoDatabase } from "../database/api";



export default async function userKeyStoreController(req: Request, res: Response) {
	const userKeyStore = req.body;
	await insertUserKeyStoreIntoDatabase(userKeyStore);
	return res.status(200).send("KeyStore inserted");
}
import { Request, Response } from "express";
import { insertDocumentGroupKeyIntoDatabase } from "../database/api";
import log from "../logger";

async function groupKeyController(req: Request, res: Response) {
	const userID = req.userID;
	const documentID = req.body.documentID;
	const groupKey = req.body.groupKey;
	const groupKeyiv = req.body.groupKeyiv;

	try {
		await insertDocumentGroupKeyIntoDatabase(userID, documentID, groupKey, groupKeyiv);
		res.status(200).send("group key pushed to DB");
	} catch (err) {
		log.debug(err);
		res.status(500).json({ error: "Internal Server Error" });
	}

}

export default groupKeyController;
import { Request, Response } from "express";
import { getDocumentListWithUserID } from "../database/api";


export default async function existingDocumentController(req: Request, res: Response) {
	const userID = req.userID;
	const documentList = await getDocumentListWithUserID(userID);
	return res.status(200).send(documentList);
}


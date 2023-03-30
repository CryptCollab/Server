import { Request, Response } from "express";
import { insertDocumentMetaDataIntoDatabase } from "../database/api";


export default async function documentCreationController(req: Request, res: Response) {
	const userID = req.body.userID;
	//Add the document metadata to the database
	const documentMetaData = await insertDocumentMetaDataIntoDatabase(userID, 1, [userID], "");
	//Send the document ID to the client
	return res.status(200).send(documentMetaData.entityId);

}
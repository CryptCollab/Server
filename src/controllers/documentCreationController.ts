import { Request, Response } from "express";
import { insertDocumentMetaDataIntoDatabase } from "../database/api";
import { EntityId } from "redis-om";

export default async function documentCreationController(req: Request, res: Response) {
	const userID = req.userID as string;
	//Add the document metadata to the database
	const documentMetaData = await insertDocumentMetaDataIntoDatabase(userID, 1, [userID], "");
	//Send the document ID to the client
	return res.status(200).send(documentMetaData[EntityId]);

}
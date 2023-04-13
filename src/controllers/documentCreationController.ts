import { Request, Response } from "express";
import { insertDocumentMetaDataIntoDatabase, insertDocumentIDIntoUserDatabase } from "../database/api";

export default async function documentCreationController(req: Request, res: Response) {
	const userID = req.userID as string;
	//Add the document metadata to the database
	const documentMetaData = await insertDocumentMetaDataIntoDatabase(userID, 1, [userID], "");
	//Add the document ID to the user's document list
	await insertDocumentIDIntoUserDatabase(documentMetaData?.entityId as string, userID);
	//Send the document ID to the client
	return res.status(200).send(documentMetaData?.entityId);

}
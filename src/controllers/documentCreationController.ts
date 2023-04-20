import { Request, Response } from "express";
import { insertDocumentMetaDataIntoDatabase } from "../database/api";
//import log from "../logger";

export default async function documentCreationController(req: Request, res: Response) {
	const userID = req.userID as string;
	const documentName = req.body.documentName;
	//Add the document metadata to the database
	const documentMetaData = await insertDocumentMetaDataIntoDatabase(documentName,userID, 1, [userID], "");
	//Add the document ID to the user's document list
	//log.debug(documentMetaData);
	//Send the document ID to the client
	return res.status(200).send(documentMetaData?.entityId);

}
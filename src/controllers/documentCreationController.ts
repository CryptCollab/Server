import { Request, Response } from "express";
import { insertDocumentMetaDataIntoDatabase } from "../database/api";


export default async function documentCreationController(req: Request, res: Response) {
	//Check if username is correct and is a string
	const userID = req.body.userID;
	if (userID === undefined) {
		return res.status(400).send("userID is a required field");
	}
	else if (typeof userID !== "string") {
		return res.status(400).send("userID must be of type string");
	}
	//Add the document metadata to the database
	const documentMetaData = await insertDocumentMetaDataIntoDatabase(userID, 1, [userID], "");
	//Send the document ID to the client
	return res.redirect(`/document/${documentMetaData.entityId}`);

}
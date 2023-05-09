import { Request, Response } from "express";
import { getDocumentListWithUserID, getDocumentMetaDataWithDocumentID } from "../database/api";
//import log from "../logger";

type documentInfo = {
	documentName: string;
	documentID: string;
}

export default async function existingDocumentController(req: Request, res: Response) {
	const userID = req.userID;
	//log.debug("userID: ", userID);
	const documentIDsList = await getDocumentListWithUserID(userID);
	//log.debug("documentIDsList: ", documentIDsList);
	const documentInfoList: documentInfo[] = [];
	for (const documentID of documentIDsList) { 
		const documentMetaData = await getDocumentMetaDataWithDocumentID(documentID);
		if (documentMetaData) {
			documentInfoList.push({
				documentName: documentMetaData.documentName,
				documentID
			});
		}
	}
	return res.status(200).send(documentInfoList);
}


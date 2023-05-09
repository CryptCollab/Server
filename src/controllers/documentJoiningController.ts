import { Request, Response } from "express";
import { getDocumentInvitationWithUserID } from "../database/api";


export default async function documentJoiningController(req: Request, res: Response) {
	const participantID = req.userID;
	const documentInvites = await getDocumentInvitationWithUserID(participantID);
	return res.status(200).send(documentInvites);
}

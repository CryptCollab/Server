import { Request, Response } from "express";
import { getDocumentInvitationWithId } from "../database/api";


export default async function documentJoiningController(req: Request, res: Response) {
	const participantID = req.userID;
	const documentInvites = await getDocumentInvitationWithId(participantID);
	return res.status(200).send(documentInvites);
}

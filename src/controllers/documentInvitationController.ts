import { Request, Response } from "express";
import { insertDocumentInvitationIntoDatabase } from "../database/api";
import log from "../logger";

type userInvites = {
	documentID: string;
	participantID: string;
	leaderID: string;
	preKeyBundle: string;
}

export default async function documentInvitationController(req: Request, res: Response) {
	const invitationData: userInvites[] = req.body.userInvitesArray;
	for (const inviteData of invitationData) {

		const documentInvitation = await insertDocumentInvitationIntoDatabase(inviteData.documentID, inviteData.participantID, inviteData.leaderID, inviteData.preKeyBundle);
		log.debug(documentInvitation);
	}
	return res.status(200).send("Invitations sent");
}
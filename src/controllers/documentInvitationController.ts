import { Request, Response } from "express";
import { insertDocumentInvitationIntoDatabase } from "../database/api";

type userInvites = {
	documentID: string;
	participantID: string;
	leaderID: string;
	preKeyBundle: string;
}

export default async function documentInvitationController(req: Request, res: Response) {
	const invitationData: userInvites[] = req.body.userInvitesArray;
	for (const inviteData of invitationData) {

		await insertDocumentInvitationIntoDatabase(inviteData.documentID, inviteData.participantID, inviteData.leaderID, inviteData.preKeyBundle);
		
	}
	return res.status(200).send("Invitations sent");
}
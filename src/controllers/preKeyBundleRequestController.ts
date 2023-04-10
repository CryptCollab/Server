import { UserPreKeyBundle, getPreKeyBundleWithUserID } from "../database/api";
import { Request, Response } from "express";
import log from "../logger";
export default async function preKeyBundleRequestController(req: Request, res: Response) {
	const participantIDs: string[] = req.body.participantIDs;
	console.log(participantIDs);
	const preKeyBundleArray: UserPreKeyBundle[] = [];
	for (const userID of participantIDs) {
		const preKeyBundle = await getPreKeyBundleWithUserID(userID);
		log.debug(preKeyBundle);
		if (preKeyBundle) {
			preKeyBundleArray.push(preKeyBundle);
		}
	}
	res.status(200).send(preKeyBundleArray);

}
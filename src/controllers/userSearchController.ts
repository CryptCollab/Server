import { Request, Response } from "express";
import { User, getUserStartingWithUsernameOrEmail } from "../database/api";

export default async function userSearchController(req: Request, res: Response) {
	const queryResult = await getUserStartingWithUsernameOrEmail(req.query.user as string);
	const response = queryResult.map((user: User) => {
		return {
			userID: user.entityId,
			userName: user.user_name,
			email: user.email
		};
	});

	res.send(response);
}
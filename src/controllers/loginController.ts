import { Request, Response } from "express";
import { getUserWithUsernameOrEmail } from "../database/api";
import bcrypt from "bcrypt";
import { sendUserDataWithTokens } from "../tokenUtils";



export default async function loginController(req: Request, res: Response) {

	const { user, password } = req.body;

	// Get user credentials from database and compare them
	const userDetails = await getUserWithUsernameOrEmail(user);
	if (userDetails === null) {
		return res.status(404).send({
			errors: [
				{
					param: "user",
					msg: "Account associated with this email or username does not exist",
					location: "body"
				}
			]
		});
	}
	else if (!bcrypt.compareSync(password, userDetails.password)) {
		return res.status(401).send({
			errors: [
				{
					param: "user",
					msg: "Credentials for this email or username is incorrect",
					location: "body"
				},
				{
					param: "password",
					msg: "Password does not match for the above email or username",
					location: "body"
				}
			]
		});
	}
	return sendUserDataWithTokens(res, userDetails);
}



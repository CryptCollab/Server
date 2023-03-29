import { Request, Response } from "express";
import { getUserWithEmail } from "../database/api";
import bcrypt from "bcrypt";
import { sendUserDataWithTokens } from "../tokenUtils";



export default async function loginController(req: Request, res: Response) {

	const { email, password } = req.body.email;

	// Get user credentials from database and compare them
	const user = await getUserWithEmail(email);
	if (user === null) {
		return res.status(404).send("Account associated with the email does not exist");
	}
	else if (!bcrypt.compareSync(password, user.toJSON().password)) {
		return res.status(401).send("Invalid password or email");
	}
	return sendUserDataWithTokens(res, user);
}



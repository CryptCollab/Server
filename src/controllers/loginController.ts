import { Request, Response } from "express";
import { getUserWithEmail } from "../database/api";
import emailValidator from "email-validator";
import bcrypt from "bcrypt";
import { sendUserDataWithTokens } from "../tokenUtils";


//TODO joi validation
export default async function loginController(req: Request, res: Response) {
	// Check if email is valid
	const email = req.body.email;
	if (email === undefined) {
		return res.status(400).send("Email is a required field");
	}
	else if (typeof email !== "string") {
		return res.status(400).send("Email must be of type string");
	}
	else if (!emailValidator.validate(email)) {
		return res.status(400).send("This email is not valid");
	}
	// Check if password is valid
	const password = req.body.password;
	if (password === undefined) {
		return res.status(400).send("Password is a required field");
	}
	else if (typeof password !== "string") {
		return res.status(400).send("Password must be of type string");
	}
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



import { Request, Response } from "express";
import { getUserWithEmail, getUserWithUsername, insertUserIntoDatabase } from "../database/api";
import bcrypt from "bcrypt";
import { sendUserDataWithTokens } from "../tokenUtils";


/**
 * function to register a user
 * takes the request and response objects as parameters
 * Then checks if the email, username and password are valid
 * If they are valid, then it inserts the user into the database
 */
export default async function registerController(req: Request, res: Response) {

	const { email, userName, password } = req.body;

	// Check if email already exists
	const errors = [];

	if ((await getUserWithEmail(email)) !== null) {
		errors.push({
			param: "email",
			msg: "An account associated with this email already exists",
			location: "body"
		});
	}

	if ((await getUserWithUsername(userName)) !== null) {
		errors.push({
			param: "username",
			msg: "An account associated with this username already exist",
			location: "body"
		});
	}

	if (errors.length > 0) return res.status(409).send({ errors });

	//Store the user in the database
	const hashedPassword = await bcrypt.hash(password, 10);
	const user = await insertUserIntoDatabase(userName, email, hashedPassword);

	if (user === null) throw new Error("User is returned as null after inserting into database");

	return sendUserDataWithTokens(res, user);
}


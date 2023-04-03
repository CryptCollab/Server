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

	const { email, username, password } = req.body;

	// Check if email already exsists
	if ((await getUserWithEmail(email)) !== null) {
		return res.status(409).send("An account with this email already exists");
	}

	if ((await getUserWithUsername(username)) !== null) {
		return res.status(409).send("An account with this username already exists");
	}

	//Store the user in the database
	const hashedPassword = await bcrypt.hash(password, 10);
	const user = await insertUserIntoDatabase(username, email, hashedPassword);

	if (user === null) throw new Error("User is returned as null after inserting into database");

	return sendUserDataWithTokens(res, user);
}


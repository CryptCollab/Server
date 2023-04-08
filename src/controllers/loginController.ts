import { Request, Response } from "express";
import {  getUserWithUsernameOrEmail } from "../database/api";
import bcrypt from "bcrypt";
import { sendUserDataWithTokens } from "../tokenUtils";



export default async function loginController(req: Request, res: Response) {

	const {  user, password } = req.body;

	// Get user credentials from database and compare them
	const userDetails = await getUserWithUsernameOrEmail(user);
	if (userDetails === null) {
		return res.status(404).send("Account associated with the email does not exist");
	}
	else if (!bcrypt.compareSync(password, userDetails.password)) {
		return res.status(401).send("Invalid password or email");
	}
	return sendUserDataWithTokens(res, userDetails);
}



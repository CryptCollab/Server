import { Request, Response, Router } from "express";
import emailValidator from "email-validator";
import { getUserWithEmail, getUserWithUsername, insertUserIntoDatabase } from "../databaseUtil";
import bcrypt from "bcrypt";
import passwordValidator from "password-validator";
import { getUserDetailsWithTokens } from "./loginController";

/**
 * function to register a user
 * takes the request and response objects as parameters
 * Then checks if the email, username and password are valid
 * If they are valid, then it inserts the user into the database
 */
export default async function registerController(req: Request, res: Response) {

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
    else if (((await getUserWithEmail(email))).length > 0) {
        return res.status(409).send("An account with this email already exists");
    }

    // Check if username is valid
    const username = req.body.username;
    const usrenameRegex = /^[a-zA-Z][a-zA-Z0-9\-_\.]{2,99}$/;
    if (username === undefined) {
        return res.status(400).send("Username is a required field");
    }
    else if (typeof username !== "string") {
        return res.status(400).send("Username must be of type string");
    }
    else if (!usrenameRegex.test(username)) {
        return res.status(400).send("Username must be at least 3 characters long, start with a letter, and only contain letters, numbers, dashes, underscores and dots");
    }
    else if ((await getUserWithUsername(username)).length > 0) {
        return res.status(409).send("An account with this username already exists");
    }

    // Check if password is valid
    const password = req.body.password;
    const passwordSchema = new passwordValidator();
    passwordSchema
        .min(8, "Password must be at least 8 characters long")
        .max(100, "Password must be at most 100 characters long")

    if (password === undefined) {
        return res.status(400).send("Password is a required field");
    }
    else if (typeof password !== "string") {
        return res.status(400).send("Password must be of type string");
    }
    else if (!passwordSchema.validate(password)) {
        const errorMessageListWithDetails = passwordSchema.validate(password, { details: true }) as any[];
        return res.status(400).send(errorMessageListWithDetails[0].message);
    }

    //Store the user in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await insertUserIntoDatabase(username, email, hashedPassword);

    return res.send(getUserDetailsWithTokens(user[0]));
}

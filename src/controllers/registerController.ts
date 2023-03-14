import { Router } from "express";
import emailvalidator from "email-validator";
import { checkIfEmailExists as doesEmailAlreadyExists, insertUser as insertUserIntoDatabase } from "../databaseUtil";
import bcrypt from "bcrypt";
import passwordValidator from "password-validator";


const router = Router();

router.get("/", (_req, res) => {
    return res.send("Hey! This is the GET response for the /register route. Did you meant to POST to this route?");
});

router.post("/", async (req, res) => {

    const email = req.body.email;
    if (email === undefined) {
        return res.status(400).send("Email is a required field");
    }
    else if (typeof email !== "string") {
        return res.status(400).send("Email must be of type string");
    }
    else if (!emailvalidator.validate(email)) {
        return res.status(400).send("This email is not valid");
    }
    else if (await doesEmailAlreadyExists(email)) {
        return res.status(409).send("An account with this email already exists");
    }

    const username: string | undefined = req.body.username;
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

    const password: string | undefined = req.body.password;
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

    try {
        await insertUserIntoDatabase(username, email, hashedPassword);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Something went wrong while trying to register the user");
    }

    return res.send("User registered successfully!");
});


export default router;
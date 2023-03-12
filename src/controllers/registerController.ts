import { Router } from "express";
import emailvalidator from "email-validator";
import { checkIfEmailExists as doesEmailAlreadyExists, insertUser as insertUserIntoDatabase } from "../databaseUtil";
import bcrypt from "bcrypt";


const router = Router();

router.get("/", (_req, res) => {
    return res.send("Hey! This is the GET response for the /register route. Did you meant to POST to this route?");
});

router.post("/", async (req, res) => {

    const email = req.body.email;
    if (email === undefined) {
        return res.status(400).send("Email is a required field");
    }
    else if (!emailvalidator.validate(email)) {
        return res.status(400).send("This email is not valid");
    }
    else if (await doesEmailAlreadyExists(email)) {
        return res.status(409).send("An account with this email already exists");
    }


    const username = req.body.username;
    if (username === undefined) {
        return res.status(400).send("Username is a required field");
    }
    else if (username.length < 3) {
        return res.status(400).send("Username must be at least 3 characters long");
    }


    const password = req.body.password;
    if (password === undefined) {
        return res.status(400).send("Password is a required field");
    }
    else if (password.length < 8) {
        return res.status(400).send("Password must be at least 8 characters long");
    }

    //Store the user in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    await insertUserIntoDatabase(username, email, hashedPassword);

    return res.send("User registered successfully!");
});


export default router;
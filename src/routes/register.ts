import { Router } from "express";
import registerController from "../controllers/registerController";
import validate, { emailValidation, passwordValidation, usernameValidation } from "../middlewares/validateBody";


const router = Router();

router.get("/", (_req, res) => {
	return res.send("Hey! This is the GET response for the /register route. Did you meant to POST to this route?");
});

router.post("/", validate(emailValidation, usernameValidation, passwordValidation), async (req, res) => {
	
	try {
		await registerController(req, res);
	}
	catch (error) {
		console.error(error);
		return res.status(500).send("Internal server error");
	}

});


export default router;
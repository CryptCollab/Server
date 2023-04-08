import { exsistsInBody, passwordValidation } from "../middlewares/validateBody";
import { Request, Response, Router } from "express";
import loginController from "../controllers/loginController";

const router = Router();

router.get("/", (_req, res) => {
	return res.send("Hey! This is the GET response for the /login route. Did you meant to POST to this route?");
});

router.post("/", exsistsInBody("user"), passwordValidation, async (req: Request, res: Response) => {

	try {
		await loginController(req, res);
	}
	catch (error) {
		console.error(error);
		return res.status(500).send("Internal server error");
	}

});


export default router;
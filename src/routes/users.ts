import { Router } from "express";
import searchUsers from "../controllers/userSearchController";
import validate, { existsInQuery } from "../middlewares/validateBody";


const router = Router();

router.get("/", validate(...existsInQuery("user")), async (req, res) => {
	try {
		await searchUsers(req, res);
	}
	catch (error) {
		console.error(error);
		return res.status(500).send("Internal server error");
	}
});



export default router;

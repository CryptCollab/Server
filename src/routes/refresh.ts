import { Router } from "express";
import refreshController from "../controllers/refreshTokenController";

const router = Router();

router.get("/", async (req, res) => {
	try {
		await refreshController(req, res);
	}
	catch (error) {
		console.error(error);
		return res.status(500).send("Internal server error");
	}
});


export default router;
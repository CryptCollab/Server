import { Router } from "express";
import verifyJWT from "../middlewares/authenticateUser";



const router = Router();



export default router;

router.get("/", verifyJWT, (req, res) => {
	return res.send(`Hey! This is the GET response for the /documet route. ${req.userId}`);
});

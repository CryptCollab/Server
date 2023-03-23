import { Router } from "express";
import logoutController from "../controllers/logoutController";

const router = Router();

router.get("/", async (req, res) => {
    try {
        await logoutController(req, res);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
});


export default router;
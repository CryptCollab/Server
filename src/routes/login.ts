import { Router } from "express";
import loginController from "../controllers/loginController";

const router = Router();



router.get("/", async (req, res) => {

    try {
        await loginController(req, res);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }

});


export default router;
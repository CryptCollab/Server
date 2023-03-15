import { Router } from "express";
import registerController from "./registerController";
import loginController from "./loginController";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello! This is the API route home page.");
});

router.use("/register", registerController);

router.use("/login", loginController);


export default router;
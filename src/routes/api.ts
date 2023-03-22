import { Router } from "express";
import registerController from "./register";
import loginController from "./login";
import documentRouter from "./document";
import refreshRouter from "./refresh";

const router = Router();

router.get("/", (req, res) => {
	res.send("Hello! This is the API route home page.");
});

router.use("/register", registerController);

router.use("/login", loginController);

router.use("/document", documentRouter);

router.use("/refresh", refreshRouter);


export default router;
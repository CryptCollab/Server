import { Router } from "express";
import registerController from "./register";
import loginController from "./login";
import documentRouter from "./document";
import refreshRouter from "./refresh";
import userRouter from "./users";
import logoutController from "../controllers/logoutController";

const router = Router();

router.get("/", (req, res) => {
	res.send("Hello! This is the API route home page.");
});

router.use("/register", registerController);

router.use("/login", loginController);

router.use("/logout", logoutController);

router.use("/document", documentRouter);

router.use("/refresh", refreshRouter);

router.use("/users", userRouter);



export default router;
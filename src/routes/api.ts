import { Router } from "express";
import registerController from "./register";
import loginController from "./login";
import documentRouter from "./document";
import refreshRouter from "./refresh";
import userRouter from "./users";
import logoutController from "../controllers/logoutController";
import keyStoreRouter from "./UserKeyStore";
import preKeyBundleRouter from "./preKeyBundle";
import groupKeyRouter from "./groupKey";
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

router.use("/prekeybundle", preKeyBundleRouter);

router.use("/userkeystore", keyStoreRouter);

router.use("/groupkey", groupKeyRouter);


export default router;
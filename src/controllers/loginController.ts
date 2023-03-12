import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello! This is the API login route.");
});

export default router;
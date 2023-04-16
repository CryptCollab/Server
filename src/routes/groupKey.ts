import { Request, Response, Router } from "express";
import verifyJWT from "../middlewares/authenticateUser";
import validate, { exsistsInQuery } from "../middlewares/validateBody";
import { getDocumentGroupKeyWithDocumentIDAndUserID } from "../database/api";
import groupKeyController from "../controllers/groupKeyController";
import log from "../logger";
import { Schema, checkSchema } from "express-validator";
const router = Router();


const groupKeySchema: Schema = {
	documentID: {
		in: ["body"],
		isString: true,
		notEmpty: true,
		errorMessage: "documentID is required"
	},
	groupKey: {
		in: ["body"],
		isString: true,
		notEmpty: true,
		errorMessage: "groupKey is required"
	},
	groupKeyiv: {
		in: ["body"],
		isString: true,
		notEmpty: true,
		errorMessage: "groupKeyiv is required"
	}
};

router.get("/", verifyJWT, validate(exsistsInQuery("documentID")), async (req: Request, res: Response) => {
	const userID = req.userID;
	const documentID = req.query.documentID;

	try {

		const queryResponse = await getDocumentGroupKeyWithDocumentIDAndUserID(documentID as string, userID);
		const groupKey = {
			groupKey: queryResponse?.groupKey,
			groupKeyiv: queryResponse?.groupKeyiv
		};
		res.status(200).json(groupKey);
	}
	catch (err) {
		res.status(500).json({ error: "Internal Server Error" });
	}

});


router.post("/", verifyJWT, checkSchema(groupKeySchema), async (req: Request, res: Response) => {
	try {
		await groupKeyController(req, res);
	}
	catch (err) {
		res.status(500).json({ error: "Internal Server Error" });
		log.error(err);
	}
});







export default router;
import { Request, Response, Router } from "express";
import { checkSchema, Schema } from "express-validator";
import preKeyBundleController from "../controllers/preKeyBundleController";
import preKeyBundleRequestController from "../controllers/preKeyBundleRequestController";
import log from "../logger";
import verifyJWT from "../middlewares/authenticateUser";



const router = Router();


const participantIDsSchema: Schema = {
	participantIDs: {
		isArray: {
			bail: true,
			options: {
				min: 1,
			}
		}
	},
	"participantIDs.*.userID": {
		isString: true,
		in: ["body"],
		errorMessage: "userID is a required field",
		exists: {
			errorMessage: "userID is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "userID cannot be empty",
		},
	},
};

router.post("/request", verifyJWT, checkSchema(participantIDsSchema), async (req: Request, res: Response) => { 
	try {
		await preKeyBundleRequestController(req, res);
	}
	catch (err) {
		log.error(err);
		res.status(500).send("Internal Server Error");
	}
} );
router.post("/", verifyJWT, preKeyBundleController);


export default router;
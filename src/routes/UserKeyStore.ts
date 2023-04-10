import { Request, Response, Router } from "express";
import verifyJWT from "../middlewares/authenticateUser";
import userKeyStoreController from "../controllers/UserKeyStoreController";
import { checkSchema, Schema } from "express-validator";
import log from "../logger";
import { getUserKeyStoreWithUserID } from "../database/api";

const router = Router();

const userKeyStoreSchema: Schema = {
	userID: {
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
	idenitityPublic: {
		isString: true,
		in: ["body"],
		errorMessage: "idenitityPublic is a required field",
		exists: {
			errorMessage: "idenitityPublic is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "idenitityPublic cannot be empty",
		},
	},
	identityPubliciv: {
		isString: true,
		in: ["body"],
		errorMessage: "identityPubliciv is a required field",
		exists: {
			errorMessage: "identityPubliciv is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "identityPubliciv cannot be empty",
		},
	},
	identitySecret: {
		isString: true,
		in: ["body"],
		errorMessage: "identitySecret is a required field",
		exists: {
			errorMessage: "identitySecret is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "identitySecret cannot be empty",
		},
	},
	identitySecretiv: {
		isString: true,
		in: ["body"],
		errorMessage: "identitySecretiv is a required field",
		exists: {
			errorMessage: "identitySecretiv is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "identitySecretiv cannot be empty",
		},
	},
	preKeyPublic: {
		isString: true,
		in: ["body"],
		errorMessage: "preKeyPublic is a required field",
		exists: {
			errorMessage: "preKeyPublic is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "preKeyPublic cannot be empty",
		},
	},
	preKeyPubliciv: {
		isString: true,
		in: ["body"],
		errorMessage: "preKeyPubliciv is a required field",
		exists: {
			errorMessage: "preKeyPubliciv is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,	
			errorMessage: "preKeyPubliciv cannot be empty",
		},
	},
	preKeySecret: {
		isString: true,
		in: ["body"],
		errorMessage: "preKeySecret is a required field",
		exists: {
			errorMessage: "preKeySecret is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "preKeySecret cannot be empty",
		},
	},
	preKeySecretiv: {
		isString: true,
		in: ["body"],
		errorMessage: "preKeySecretiv is a required field",
		exists: {
			errorMessage: "preKeySecretiv is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "preKeySecretiv cannot be empty",
		},
	},
	masterKey: {
		isString: true,
		in: ["body"],
		errorMessage: "masterKey is a required field",
		exists: {
			errorMessage: "masterKey is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "masterKey cannot be empty",
		},
	},
};


router.get("/", verifyJWT, async (req, res) => {
	const userID = req.userID;
	const userKeyStore = await getUserKeyStoreWithUserID(userID as string);
	if (userKeyStore) {
		return res.status(200).send(userKeyStore);
	}
	console.log("KeyStore not found");
	return res.status(404).send("KeyStore not found");
});

router.post("/", verifyJWT, checkSchema(userKeyStoreSchema), async (req: Request, res: Response) => {
	try {
		userKeyStoreController(req, res);
	}
	catch (err) {
		log.error(err);
		res.status(500).send("Internal server error");
	}

});

export default router;
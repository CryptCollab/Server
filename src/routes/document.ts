import { Request, Response, Router } from "express";
import documentCreationController from "../controllers/documentCreationController";
import verifyJWT from "../middlewares/authenticateUser";
import documentJoiningController from "../controllers/documentJoiningController";
import documentInvitationController from "../controllers/documentInvitationController";
import existingDocumentsController from "../controllers/existingDocumentController";
import { checkSchema, Schema } from "express-validator";
import log from "../logger";
import { deleteDocumentInvitation, getDocumentMetaDataWithDocumentID } from "../database/api";
import validate, { exsistsInQuery } from "../middlewares/validateBody";


const router = Router();


const documentInvitationSchema: Schema = {
	documentInvites: {
		isArray: {
			bail: true,
			options: {
				min: 1,
			}
		}
	},
	"documentInvites.*.document_id": {
		isString: true,
		in: ["body"],
		errorMessage: "document_id is a required field",
		exists: {
			errorMessage: "document_id is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "document_id cannot be empty",
		},
	},
	"documentInvites.*.participant_id": {
		isString: true,
		in: ["body"],
		errorMessage: "participant_id is a required field",
		exists: {
			errorMessage: "participant_id is a required field",
			bail: true,
			options: {
				checkNull: true,
			},
		},
		isEmpty: {
			bail: true,
			errorMessage: "participant_id cannot be empty",
		},
	},
	"documentInvites.*.leader_id": {
		isString: true,
		in: ["body"],
		errorMessage: "leader_id is a required field",
		exists: {
			errorMessage: "leader_id is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "leader_id cannot be empty",
		},
	},
	"documentInvites.*.preKeyBundle": {
		isString: true,
		in: ["body"],
		errorMessage: "preKeyBundle is a required field",
		exists: {
			errorMessage: "preKeyBundle is a required field",
			bail: true,
			options: {
				checkNull: true,
			}
		},
		isEmpty: {
			bail: true,
			errorMessage: "preKeyBundle cannot be empty",
		},
	}
};
router.get("/", verifyJWT, validate(exsistsInQuery("documentID")), async (req, res) => {
	const documentID = req.query.documentID;
	const documentMetaData = await getDocumentMetaDataWithDocumentID(documentID as string);
	if (documentMetaData) {
		return res.status(200).send(documentMetaData);
	}
	else {
		return res.status(404).send("Document not found");
	}

});

router.post("/", verifyJWT, documentCreationController);

router.get("/invites", verifyJWT, documentJoiningController);

router.get("/existingdocuments", verifyJWT, existingDocumentsController);

router.post("/invites", verifyJWT, checkSchema(documentInvitationSchema), async (req: Request, res: Response) => {
	try {
		await documentInvitationController(req, res);
	}
	catch (error) {
		log.error(error);
		return res.status(500).send("Internal server error");
	}
});

router.delete("/invites", verifyJWT, async (req: Request, res: Response) => { 
	log.debug("delete invite");
	const documentID = req.body.documentID;
	const userID = req.userID;
	//console.log(documentID, userID);
	try {
		await deleteDocumentInvitation(userID,documentID);
	}
	catch (error) {
		log.error(error);
		return res.status(500).send("Internal server error");
	}
});


export default router;






// {
//     "userData": {
//         "email": "r@g.com",
//         "userName": "zeus",
//         "userID": "01GWP2QD2CB59BDDT76JWQB0SG",
//         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2ODAwNzQyMTMsImV4cCI6MTY4MDA3NTExMywiYXVkIjoiMDFHV1AyUUQyQ0I1OUJERFQ3NkpXUUIwU0ciLCJpc3MiOiJodHRwczovL3d3dy5naXRodWIuY29tL0NyeXB0Q29sbGFiIn0.sdJPJw4SKlQO_QmmkTP-egVtGz14WcXfTeWRx5BfYak"
//     }
// }
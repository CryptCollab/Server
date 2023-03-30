import { Router } from "express";
import documentCreationController from "../controllers/documentCreationController";
import verifyJWT from "../middlewares/authenticateUser";
import validateBody, { userIDvalidation } from "../middlewares/validateBody";



const router = Router();



export default router;

router.get("/", verifyJWT, (req, res) => {
	return res.send(`Hey! This is the GET response for the /documet route. ${req.userId}`);
});

router.post("/", verifyJWT,validateBody(userIDvalidation), documentCreationController);



// {
//     "userData": {
//         "email": "r@g.com",
//         "userName": "zeus",
//         "userID": "01GWP2QD2CB59BDDT76JWQB0SG",
//         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2ODAwNzQyMTMsImV4cCI6MTY4MDA3NTExMywiYXVkIjoiMDFHV1AyUUQyQ0I1OUJERFQ3NkpXUUIwU0ciLCJpc3MiOiJodHRwczovL3d3dy5naXRodWIuY29tL0NyeXB0Q29sbGFiIn0.sdJPJw4SKlQO_QmmkTP-egVtGz14WcXfTeWRx5BfYak"
//     }
// }
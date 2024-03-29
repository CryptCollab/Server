import { NextFunction, Request, Response } from "express";
import { body, query, ValidationChain, validationResult, } from "express-validator";

//TODO sanitize input

export const emailValidation = body("email")
	.exists({ checkNull: true, checkFalsy: true }).withMessage("Email is a required field!").bail()
	.notEmpty().withMessage("Email cannot be empty!").bail()
	.isEmail().withMessage("This mail is not valid!");

export const usernameValidation = body("userName")
	.exists({ checkNull: true, checkFalsy: true }).withMessage("Username is a required field!").bail()
	.notEmpty().withMessage("Username cannot be empty!").bail()
	.isString().withMessage("Username must be of type string!").bail()
	.isLength({ min: 3 }).withMessage("Username must be at least 3 characters long!").bail()
	.isLength({ max: 50 }).withMessage("Username must be at most 50 characters long!").bail()
	.matches(/^[a-zA-Z][a-zA-Z0-9\-_]{2,49}$/).withMessage("Username must start with a letter, and only contain letters, numbers, dashes and underscores!");

//TODO weak password validation 
export const passwordValidation = body("password")
	.exists({ checkNull: true, checkFalsy: true }).withMessage("Password is a required field!").bail()
	.notEmpty().withMessage("Password cannot be empty!").bail()
	.isString().withMessage("Password must be of type string!").bail()
	.isLength({ min: 8 }).withMessage("Password must be at least 8 characters long!")
	.isLength({ max: 100 }).withMessage("Password must be at most 100 characters long!");

/**
 * Dynamic validation for checking if a field exists and is not empty
*/
export const existsInBody = (...fields: string[]) =>
	fields.map(field => body(field)
		.exists({ checkNull: true, checkFalsy: true }).withMessage(`${field} is a required field!`).bail()
		.notEmpty().withMessage(`${field} cannot be empty!`).bail()
		.isString().withMessage(`${field} must be of type string!`).bail());

export const existsInQuery = (...fields: string[]) =>
	fields.map(field => query(field)
		.exists({ checkNull: true, checkFalsy: true }).withMessage(`${field} is a required field!`).bail()
		.notEmpty().withMessage(`${field} cannot be empty!`).bail()
		.isString().withMessage(`${field} must be of type string!`).bail());



export default function validate(...validations: ValidationChain[]) {

	return async (req: Request, res: Response, next: NextFunction) => {
		await Promise.all(validations.map(validation => validation.run(req)));

		const errors = validationResult(req);
		if (errors.isEmpty()) {
			return next();
		}

		res.status(400).json({ errors: errors.array() });
	};
}

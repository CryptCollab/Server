import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import apiController from "./routes/api";
import { connectToDatabase } from "./database/api";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import checkAllEnviromentVariables from "./enviromentVariables";

dotenv.config();

checkAllEnviromentVariables();

connectToDatabase();

const port = process.env.PORT ?? 8080;

const app: Express = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", express.static(path.join(__dirname, "../public")));

app.use("/api", apiController);

app.listen(port, () => {
	console.log(`⚡️ Server is ready & running at http://localhost:${port}`);
});
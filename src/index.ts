/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import express, { Express } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import path from "path";
import apiController from "./routes/api";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import checkAllEnviromentVariables from "./enviromentVariables";
import cors from "cors";
import { createAdapter } from "@socket.io/redis-adapter";
import { RedisClientType } from "redis";
import { connectToDatabase } from "./database/api";
import { socketConnectionsHandler } from "./socketHandlers";

dotenv.config();

checkAllEnviromentVariables();




const port = process.env.PORT ?? 8080;

const app: Express = express();

const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});
let publisherClient: RedisClientType, subscriberClient: RedisClientType;
connectToDatabase().then(async (redisClient) => {
	publisherClient = redisClient;
	subscriberClient = publisherClient.duplicate();
	io.adapter(createAdapter(publisherClient, subscriberClient));
	subscriberClient.on("error", (err) => {
		console.log("Redis subscriber error", err);
	});
	await subscriberClient.connect();
}).then(() => {
	console.log("Connected to redis");
	socketConnectionsHandler(io, subscriberClient, publisherClient);
}).catch((err) => {
	console.log("Error connecting to redis", err);
});




app.use(cors({
	origin: process.env.CLIENT_BASE_URL,
	credentials: true,
	methods: ["GET", "POST"],
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", apiController);


server.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
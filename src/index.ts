import express, { Express, Request, Response } from 'express';
import { createServer } from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import path from "path";
import apiController from "./routes/api";
import { connectToDatabase } from "./database/api";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import checkAllEnviromentVariables from "./enviromentVariables";
import cors from 'cors';

dotenv.config();

checkAllEnviromentVariables();

// connectToDatabase();

const port = process.env.PORT ?? 8080;

const app: Express = express();

const server = createServer(app);
let users: string[] = [];
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
let prekey: any;
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", apiController);

app.get('*', (_req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

let documentLeader: string, participant: string;

io.on('connect', (socket) => {
  socket.join("documentRoom");
  //Check if total users in room is greater than 1
  console.log(`User connected with id: ${socket.id} in documentRoom with total users: ${io.sockets.adapter.rooms.get("documentRoom")?.size!}`);
  if (io.sockets.adapter.rooms.get("documentRoom")?.size! == 1) {
    documentLeader = socket.id;
    console.log(`New document leader with id: ${socket.id} in documentRoom`)
  }
  else {
    participant = socket.id;
    console.log(`New participant with id: ${socket.id} in documentRoom`)

  }

  socket.emit("usersInRoom", io.sockets.adapter.rooms.get("documentRoom")?.size!);

  socket.on("preKeyBundle", (data, peer) => {
    prekey = data;
    //console.log(`Recieved prekey bundle from ${socket.id}`);
    socket.to(documentLeader).emit("prekeyBundleForHandshake", prekey, participant);
  })

  socket.on("firstMessage", (firstMessageBundle, recipient, firstGroupMessage) => {
    //console.log(`Recieved first message from ${socket.id}`);
    socket.to(recipient).emit("firstMessageForHandshake", firstMessageBundle, firstGroupMessage);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected with id: ${socket.id} `);
  })
  
  socket.on("groupMessage", (groupMessage) => {
    //console.log(`Recieved group message from ${socket.id}`);
    socket.to("documentRoom").emit("groupMessage", groupMessage);
    //console.log(`Group Message: `, groupMessage);
  })

  socket.on("documentUpdate", (documentUpdate) => {
    socket.to("documentRoom").emit("documentUpdate",documentUpdate);
    console.log("Recieved document update", documentUpdate);
  })

  socket.on("awarenessUpdate", (awarenessUpdate) => {
    socket.to("documentRoom").emit("awarenessUpdate", awarenessUpdate);
    console.log("Recieved awareness update", awarenessUpdate);
  })

});


io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

io.on("disconnect", (reason) => {
  console.log(`disconnect due to ${reason}`);
});




// app.listen(port, () => {
//   console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
// });

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
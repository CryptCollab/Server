import express, { Express, Request, Response } from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
dotenv.config();

const app = express();
const port = process.env.PORT ?? 8080;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/api', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

io.on('connect', (socket) => {
  console.log('user connected with id: ', socket.id);
});

io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

// app.listen(port, () => {
//   console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
// });

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
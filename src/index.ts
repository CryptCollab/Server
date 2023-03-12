import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import apiController from './controllers/apiController';
import { connectToDatabase } from './databaseUtil';
import bodyParser from 'body-parser';

dotenv.config();

connectToDatabase();

const port = process.env.PORT ?? 8080;

const app: Express = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', express.static(path.join(__dirname, '../public')))

app.use('/api', apiController);

app.listen(port, () => {
  console.log(`⚡️ Server is ready & running at http://localhost:${port}`);
});
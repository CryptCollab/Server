import mysql, { RowDataPacket } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';


let pool: mysql.Pool;

export async function connectToDatabase() {

    if (process.env.MYSQL_HOST === undefined || process.env.MYSQL_HOST === null) {
        throw new Error("env:MYSQL_HOST is not defined");
    }
    else if (process.env.MYSQL_USER === undefined || process.env.MYSQL_USER === null) {
        throw new Error("env:MYSQL_USER is not defined");
    }
    else if (process.env.MYSQL_PASSWORD === undefined || process.env.MYSQL_PASSWORD === null) {
        throw new Error("env:MYSQL_PASSWORD is not defined");
    }
    else if (process.env.MYSQL_DATABASE === undefined || process.env.MYSQL_DATABASE === null) {
        throw new Error("env:MYSQL_DATABASE is not defined");
    }

    pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    console.log("✅ Database connection pools ready");

}

function returnIfPoolNotDefined() {
    if (pool === undefined) {
        throw new Error("Pool is not defined! Make sure you call connectToDatabase() first");
    }
}

export async function checkIfEmailExists(email: string): Promise<boolean> {
    returnIfPoolNotDefined();
    try {
        const queryResult = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [email]);
        return queryResult[0].length > 0;
    }
    catch (error) {
        console.error(error);
    }

    return false;
}

export async function insertUser(userName: string, email: string, hashedPassword: string): Promise<void> {
    returnIfPoolNotDefined();
    try {
        await pool.query("INSERT INTO users (user_id, user_name, email, password) VALUES (?, ?, ?, ?)", [uuid(), userName, email, hashedPassword]);
    }
    catch (error) {
        console.error(error);
    }
}


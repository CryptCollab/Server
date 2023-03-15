import mysql, { RowDataPacket } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';


export interface User extends RowDataPacket {
    user_id: string;
    email: string;
    user_name: string;
    password: string;
}

let pool: mysql.Pool;

export async function connectToDatabase() {

    pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        multipleStatements: true,
    });

    console.log("✅ Database connection pools ready");

}

function returnIfPoolNotDefined() {
    if (pool === undefined) {
        throw new Error("Pool is not defined! Make sure you call connectToDatabase() first");
    }
}


export async function getUserWithEmail(email: string): Promise<User[]> {
    returnIfPoolNotDefined();

    const queryResult = await pool.query<User[]>("SELECT * FROM users WHERE email = ?", [email]);

    return queryResult[0];

}
export async function getUserWithUsername(username: string): Promise<User[]> {
    returnIfPoolNotDefined();

    const queryResult = await pool.query<User[]>("SELECT * FROM users WHERE user_name = ?", [username]);

    return queryResult[0];

}

/**
 * 
 * @param userName 
 * @param email 
 * @param hashedPassword 
 * @returns assigned user ID
 */
//TODO optimize into a single query
export async function insertUserIntoDatabase(userName: string, email: string, hashedPassword: string): Promise<User[]> {
    returnIfPoolNotDefined();

    const uid = uuid();
    await pool.query(
        "INSERT INTO users (user_id, user_name, email, password) VALUES (?, ?, ?, ?)",
        [uid, userName, email, hashedPassword]
    );

    return await getUserWithEmail(email);

}


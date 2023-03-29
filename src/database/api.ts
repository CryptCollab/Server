import { RedisClientType, createClient } from "redis";

import { Client, Entity, Repository, Schema } from "redis-om";


/**
 * @apis 
 * getUserWithEmail(email: string): Promise<User[]>
 * getUserWithUsername(email: string): Promise<User[]>
 * insertUserIntoDatabase(userName: string, email: string, hashedPassword: string): Promise<User[]>
 */


const MONTH_IN_SECS = 60 * 60 * 24 * 30;

export class User extends Entity {
}

const userSchema = new Schema(User, {
	user_name: {
		type: "string",
	},
	email: {
		type: "string",
	},
	password: {
		type: "string",
	}
});

let redisClient: RedisClientType;
let redisOmClient: Client;
let userRepository: Repository<User>;


export async function connectToDatabase() {
	redisClient = createClient({ url: process.env.REDIS_URL });
	await redisClient.connect();

	redisOmClient = await new Client().use(redisClient);

	userRepository = redisOmClient.fetchRepository(userSchema);
	userRepository.createIndex();

	console.log("✅ Connected to Database");
}



function returnIfDatabaseNotInitialised(): void {
	const globalVariables = [
		redisClient,
		redisOmClient,
		userRepository,
	];

	globalVariables.forEach((variable) => {
		if (variable === undefined) {
			throw new Error("Database not Initialised! Please call connectToDatabase() first");
		}
	});

}


/**
 * Databse operations related to refresh tokens
 */
function getRefreshTokenIdentifier(refreshToken: string): string {
	return `refreshToken:${refreshToken}`;
}

export async function saveRefreshTokenToDatabase(refreshToken: string, userId: string): Promise<void> {
	returnIfDatabaseNotInitialised();
	await redisClient.set(getRefreshTokenIdentifier(refreshToken), userId, {
		EX: MONTH_IN_SECS,
	});
}

export async function deleteRefreshTokenFromDatabase(refreshToken: string): Promise<void> {
	returnIfDatabaseNotInitialised();
	await redisClient.del(getRefreshTokenIdentifier(refreshToken));
}
export async function doesRefreshTokenExsists(refreshToken: string): Promise<boolean> {
	return (await getRefreshToken(getRefreshTokenIdentifier(refreshToken))) !== null;
}
export async function getRefreshToken(refreshToken: string) {
	returnIfDatabaseNotInitialised();
	return await redisClient.getEx(getRefreshTokenIdentifier(refreshToken), {
		EX: MONTH_IN_SECS
	});
}


/**
 * Databse operations related to search in user Repository
 */
export async function getUserWithEmail(email: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();
	return await userRepository.search().where("email").eq(email).return.first();
}
export async function getUserWithUsername(userName: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();
	return await userRepository.search().where("user_name").eq(userName).return.first();
}
export async function getUserWithId(userId: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();
	return await userRepository.fetch(userId);
}


export async function insertUserIntoDatabase(userName: string, email: string, hashedPassword: string): Promise<User> {
	returnIfDatabaseNotInitialised();

	const user = await userRepository.createAndSave({
		user_name: userName,
		email: email,
		password: hashedPassword
	});

	return user;
}


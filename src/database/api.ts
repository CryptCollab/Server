import { RedisClientType, createClient } from "redis";

import { Client, Entity, Repository, Schema } from "redis-om";


/**
 * @apis 
 * getUserWithEmail(email: string): Promise<User[]>
 * getUserWithUsername(email: string): Promise<User[]>
 * getDocumentMetaDataWithId(documentId: string): Promise<DocumentMetaData[]>
 * getDocumentInvitationWithId(documentId: string): Promise<DocumentInvitationStore[]>
 * insertUserIntoDatabase(userName: string, email: string, hashedPassword: string): Promise<User[]>
 * insertDocumentInvitationIntoDatabase(documentId: string, participantId: string, leaderId: string, preKeyBundle: string, firstMessage: string): Promise<DocumentInvitationStore[]>
 * insertDocumentMetaDataIntoDatabase(documentId: string, leaderId: string, totalParticipants: number, participantIds: string[], latestDocumentUpdate: string): Promise<DocumentMetaData[]>
 */


const MONTH_IN_SECS = 60 * 60 * 24 * 30;

export class User extends Entity {
}

export class DocumentInvitationStore extends Entity {
}

export class DocumentMetaData extends Entity {
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

const documentInvitationStoreSchema = new Schema(DocumentInvitationStore, {
	document_id: {
		type: "string",
	},
	participant_id: {
		type: "string",
	},
	leader_id: {
		type: "string",
	},
	preKeyBundle: {
		type: "string",
	},
	firstMessage: {
		type: "string",
	},
});

const documentMetaDataSchema = new Schema(DocumentMetaData, {
	leader_id: {
		type: "string",
	},
	total_participants: {
		type: "number",
	},
	participant_ids: {
		type: "string[]",
	},
	latest_document_update: {
		type: "string",
	},
});

let redisClient: RedisClientType;
let redisOmClient: Client;
let userRepository: Repository<User>;
let documentInvitationStoreRepository: Repository<DocumentInvitationStore>;
let documentMetaDataRepository: Repository<DocumentMetaData>;

export async function connectToDatabase() {
	redisClient = createClient({ url: process.env.REDIS_URL });
	await redisClient.connect();

	redisOmClient = await new Client().use(redisClient);

	userRepository = redisOmClient.fetchRepository(userSchema);
	documentInvitationStoreRepository = redisOmClient.fetchRepository(documentInvitationStoreSchema);
	documentMetaDataRepository = redisOmClient.fetchRepository(documentMetaDataSchema);
	userRepository.createIndex();
	documentInvitationStoreRepository.createIndex();
	documentMetaDataRepository.createIndex();


	console.log("✅ Connected to Database");
	return redisClient;
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

export async function getDocumentMetaDataWithId(documentId: string): Promise<DocumentMetaData | null> {
	returnIfDatabaseNotInitialised();
	return await documentMetaDataRepository.fetch(documentId);
}

export async function getDocumentInvitationWithId(documentInvitationId: string): Promise<DocumentInvitationStore | null> {
	returnIfDatabaseNotInitialised();
	return await documentInvitationStoreRepository.fetch(documentInvitationId);
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

export async function insertDocumentInvitationIntoDatabase(documentId: string, participantId: string, leaderId: string, preKeyBundle: string, firstMessage: string): Promise<DocumentInvitationStore> {

	const documentInvitation = await documentInvitationStoreRepository.createAndSave({
		document_id: documentId,
		participant_id: participantId,
		leader_id: leaderId,
		preKeyBundle: preKeyBundle,
		firstMessage: firstMessage
	});

	return documentInvitation;
}

export async function insertDocumentMetaDataIntoDatabase(leaderId: string, totalParticipants: number, participantIds: string[], latestDocumentUpdate: string): Promise<DocumentMetaData> {
	
	const documentMetaData = await documentMetaDataRepository.createAndSave({
		leader_id: leaderId,
		total_participants: totalParticipants,
		participant_ids: participantIds,
		latest_document_update: latestDocumentUpdate
	});

	return documentMetaData;
}


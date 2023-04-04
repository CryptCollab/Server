import { RedisClientType, createClient } from "redis";

import { Entity, EntityId, EntityKeyName, Repository, Schema } from "redis-om";
import log from "../logger";


// import util from "util";


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

export interface User {
	user_name: string;
	email: string;
	password: string;
	entityId: string;
	entityKeyName: string;
}

const userSchema = new Schema("user", {
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

const documentInvitationStoreSchema = new Schema("documentInvitationStore", {
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

const documentMetaDataSchema = new Schema("documentMetaData", {
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
let userRepository: Repository;
let documentInvitationStoreRepository: Repository;
let documentMetaDataRepository: Repository;
let hasDatabaseInitailised = false;

export async function connectToDatabase() {
	redisClient = createClient({ url: process.env.REDIS_URL });
	await redisClient.connect();

	// redisOmClient = await new Client().use(redisClient);

	// userRepository = redisOmClient.fetchRepository(userSchema);
	// documentInvitationStoreRepository = redisOmClient.fetchRepository(documentInvitationStoreSchema);
	// documentMetaDataRepository = redisOmClient.fetchRepository(documentMetaDataSchema);

	userRepository = new Repository(userSchema, redisClient);
	documentInvitationStoreRepository = new Repository(documentInvitationStoreSchema, redisClient);
	documentMetaDataRepository = new Repository(documentMetaDataSchema, redisClient);

	userRepository.createIndex();
	documentInvitationStoreRepository.createIndex();
	documentMetaDataRepository.createIndex();


	log.info("Succesfully connected to database ✅");
	hasDatabaseInitailised = true;
	// console.log(util.inspect(user, false, null, true /* enable colors */));

	return redisClient;


}



function returnIfDatabaseNotInitialised(): void {

	if (!hasDatabaseInitailised) {
		throw new Error("Database not Initialised! Please call connectToDatabase() first");
	}

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

const entityToUser = (entity: Entity | null): User | null => {

	if (entity === null) {
		//No entity found
		return null;
	}
	else if (Object.keys(entity).length === 0) {
		//Empty object
		return null;
	}

	return {
		user_name: entity.user_name as string,
		email: entity.email as string,
		password: entity.password as string,
		entityId: entity[EntityId] as string,
		entityKeyName: entity[EntityKeyName] as string,
	};
};

export async function getUserWithID(userId: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();
	const queryResult = await userRepository.fetch(userId);
	return entityToUser(queryResult);
}
export async function getUserWithEmail(email: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();
	const queryResult = await userRepository.search().where("email").equals(email).return.first();
	return entityToUser(queryResult);
}

export async function getUserWithUsername(userName: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();
	const queryResult = await userRepository.search().where("user_name").equals(userName).return.first();
	return entityToUser(queryResult);
}
//TODO better email matching
export async function getUserStartingWithUsernameOrEmail(user: string): Promise<User[]> {
	returnIfDatabaseNotInitialised();

	const queryTerm = `*${user}*`;
	const queryResult = await userRepository.search()
		.where("user_name").equals(queryTerm)
		.or("email").equals(queryTerm)
		.return.page(0, 10);
	console.log(queryResult);
	return queryResult.map((entity) => entityToUser(entity)).filter((user) => user !== null) as User[];
}

export async function insertUserIntoDatabase(userName: string, email: string, hashedPassword: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();


	const user = await userRepository.save({
		user_name: userName,
		email: email,
		email_username: email.split("@")[0],
		password: hashedPassword
	});
	return entityToUser(user);
}

export async function getDocumentMetaDataWithId(documentId: string): Promise<Entity | null> {
	returnIfDatabaseNotInitialised();
	return await documentMetaDataRepository.fetch(documentId);
}

export async function getDocumentInvitationWithId(documentInvitationId: string): Promise<Entity | null> {
	returnIfDatabaseNotInitialised();
	return await documentInvitationStoreRepository.fetch(documentInvitationId);
}



export async function insertDocumentInvitationIntoDatabase(documentId: string, participantId: string, leaderId: string, preKeyBundle: string, firstMessage: string): Promise<Entity> {
	returnIfDatabaseNotInitialised();

	const documentInvitation = await documentInvitationStoreRepository.save({
		document_id: documentId,
		participant_id: participantId,
		leader_id: leaderId,
		preKeyBundle: preKeyBundle,
		firstMessage: firstMessage
	});

	return documentInvitation;
}

export async function insertDocumentMetaDataIntoDatabase(leaderId: string, totalParticipants: number, participantIds: string[], latestDocumentUpdate: string): Promise<Entity> {
	returnIfDatabaseNotInitialised();

	const documentMetaData = await documentMetaDataRepository.save({
		leader_id: leaderId,
		total_participants: totalParticipants,
		participant_ids: participantIds,
		latest_document_update: latestDocumentUpdate
	});

	return documentMetaData;
}


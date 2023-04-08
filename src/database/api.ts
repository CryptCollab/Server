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
 * insertDocumentInvitationIntoDatabase(documentId: string, participantId: string, leaderId: string, preKeyBundle: string): Promise<DocumentInvitationStore[]>
 * insertDocumentMetaDataIntoDatabase(documentId: string, leaderId: string, totalParticipants: number, participantIds: string[], latestDocumentUpdate: string): Promise<DocumentMetaData[]>
 */


const MONTH_IN_SECS = 60 * 60 * 24 * 30;

export interface User {
	userName: string;
	email: string;
	password: string;
	entityId: string;
	entityKeyName: string;

}

export interface DocumentInvitation {
	documentID: string;
	participantID: string;
	leaderID: string;
	preKeyBundle: string;
	entityId: string;
	entityKeyName: string;
}

export interface DocumentMetaData {
	leaderID: string;
	totalParticipants: number;
	participantIDs: string[];
	latestDocumentUpdate: string;
	entityId: string;
	entityKeyName: string;
}

export interface UserPreKeyBundle {
	userID: string;
	preKeyBundle: {
		IdentityKey: string;
		SignedPreKey: {
			Signature: string;
			PreKey: string;
		}
	}

}

const userSchema = new Schema("user", {
	userName: {
		type: "string",
	},
	email: {
		type: "string",
	},
	password: {
		type: "string",
	},


});



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
		userName: entity.userName as string,
		email: entity.email as string,
		password: entity.password as string,
		entityId: entity[EntityId] as string,
		entityKeyName: entity[EntityKeyName] as string,
	};
};

const documentInvitationSchema = new Schema("documentInvitation", {
	documentID: {
		type: "string",
	},
	participantID: {
		type: "string",
	},
	leaderID: {
		type: "string",
	},
	preKeyBundle: {
		type: "string",
	},
});

const entityToDocumentInvitation = (entity: Entity | null): DocumentInvitation | null => {

	if (entity === null) {
		//No entity found
		return null;
	}
	else if (Object.keys(entity).length === 0) {
		//Empty object
		return null;
	}

	return {
		documentID: entity.documentID as string,
		participantID: entity.participantID as string,
		leaderID: entity.leaderID as string,
		preKeyBundle: entity.preKeyBundle as string,
		entityId: entity[EntityId] as string,
		entityKeyName: entity[EntityKeyName] as string,
	};
};


const documentMetaDataSchema = new Schema("documentMetaData", {
	leaderID: {
		type: "string",
	},
	totalParticipants: {
		type: "number",
	},
	participantIDs: {
		type: "string[]",
	},
	latestDocumentUpdate: {
		type: "string",
	},
});

const entityToDocumentMetaData = (entity: Entity | null): DocumentMetaData | null => {

	if (entity === null) {
		//No entity found
		return null;
	}
	else if (Object.keys(entity).length === 0) {
		//Empty object
		return null;
	}

	return {
		leaderID: entity.leaderID as string,
		totalParticipants: entity.totalParticipants as number,
		participantIDs: entity.participantIDs as string[],
		latestDocumentUpdate: entity.latestDocumentUpdate as string,
		entityId: entity[EntityId] as string,
		entityKeyName: entity[EntityKeyName] as string,
	};
};

const userPreKeyBundleSchema = new Schema("userPreKeyBundle", {
	userID: {
		type: "string",
	},
	IdentityKey: {
		type: "string",
	},
	Signature: {
		type: "string",
		path: "$.userPreKeyBundle.SignedPreKey.Signature"
	},
	PreKey: {
		type: "string",
		path: "$.userPreKeyBundle.SignedPreKey.PreKey"
	}
});

const entityToUserPreKeyBundle = (entity: Entity | null): UserPreKeyBundle | null => {
	if (entity === null) {
		//No entity found
		return null;
	}
	else if (Object.keys(entity).length === 0) {
		//Empty object
		return null;
	}
	return {
		userID: entity.userID as string,
		preKeyBundle: {
			IdentityKey: entity.IdentityKey as string,
			SignedPreKey: {
				Signature: entity.Signature as string,
				PreKey: entity.PreKey as string
			}
		}
	};
};

let redisClient: RedisClientType;
let userRepository: Repository;
let documentInvitationRepository: Repository;
let documentMetaDataRepository: Repository;
let userPreKeyBundleRepository: Repository;
let hasDatabaseInitailised = false;

export async function connectToDatabase() {
	redisClient = createClient({ url: process.env.REDIS_URL });
	await redisClient.connect();

	// redisOmClient = await new Client().use(redisClient);

	// userRepository = redisOmClient.fetchRepository(userSchema);
	// documentInvitationStoreRepository = redisOmClient.fetchRepository(documentInvitationStoreSchema);
	// documentMetaDataRepository = redisOmClient.fetchRepository(documentMetaDataSchema);

	userRepository = new Repository(userSchema, redisClient);
	documentInvitationRepository = new Repository(documentInvitationSchema, redisClient);
	documentMetaDataRepository = new Repository(documentMetaDataSchema, redisClient);
	userPreKeyBundleRepository = new Repository(userPreKeyBundleSchema, redisClient);

	userRepository.createIndex();
	documentInvitationRepository.createIndex();
	documentMetaDataRepository.createIndex();
	userPreKeyBundleRepository.createIndex();


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
	const queryResult = await userRepository.search().where("userName").equals(userName).return.first();
	return entityToUser(queryResult);
}

export async function getUserWithUsernameOrEmail(user: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();
	const queryResult = await userRepository.search()
		.where("userName").equals(user)
		.or("email").equals(user)
		.return.first();
	return entityToUser(queryResult);
}


export async function getUserStartingWithUsernameOrEmail(user: string): Promise<User[]> {
	returnIfDatabaseNotInitialised();

	const queryTerm = `*${user}*`;
	const queryResult = await userRepository.search()
		.where("userName").equals(queryTerm)
		.or("email").equals(queryTerm)
		.return.page(0, 10);
	console.log(queryResult);
	return queryResult.map((entity) => entityToUser(entity)).filter((user) => user !== null) as User[];
}

export async function insertUserIntoDatabase(userName: string, email: string, hashedPassword: string): Promise<User | null> {
	returnIfDatabaseNotInitialised();


	const user = await userRepository.save({
		userName: userName,
		email: email,
		email_username: email.split("@")[0],
		password: hashedPassword
	});
	return entityToUser(user);
}

export async function getDocumentMetaDataWithId(documentId: string): Promise<DocumentMetaData | null> {
	returnIfDatabaseNotInitialised();
	return entityToDocumentMetaData(await documentMetaDataRepository.fetch(documentId));
}

export async function getDocumentInvitationWithId(userID: string): Promise<DocumentInvitation[] | null> {
	returnIfDatabaseNotInitialised();
	const queryResult = await documentInvitationRepository.search().where("participantID").equals(userID).returnAll();
	const documentInvitations = queryResult.map((entity) => entityToDocumentInvitation(entity)).filter((documentInvitation) => documentInvitation !== null) as DocumentInvitation[];
	return documentInvitations;
}

export async function getPreKeyBundleWihUserId(userId: string): Promise<UserPreKeyBundle | null> {
	returnIfDatabaseNotInitialised();
	return entityToUserPreKeyBundle(await userPreKeyBundleRepository.fetch(userId));
}



export async function insertDocumentInvitationIntoDatabase(documentId: string, participantId: string, leaderId: string, preKeyBundle: string): Promise<DocumentInvitation | null> {
	returnIfDatabaseNotInitialised();

	const documentInvitation = await documentInvitationRepository.save({
		documentID: documentId,
		participantID: participantId,
		leaderID: leaderId,
		preKeyBundle: preKeyBundle
	});

	return entityToDocumentInvitation(documentInvitation);
}

export async function insertDocumentMetaDataIntoDatabase(leaderId: string, totalParticipants: number, participantIds: string[], latestDocumentUpdate: string): Promise<DocumentMetaData | null> {
	returnIfDatabaseNotInitialised();

	const documentMetaData = await documentMetaDataRepository.save({
		leaderID: leaderId,
		totalParticipants: totalParticipants,
		participantIDs: participantIds,
		latestDocumentUpdate: latestDocumentUpdate
	});

	return entityToDocumentMetaData(documentMetaData);
}

export async function insertUserPreKeyBundleIntoDatabase(userPreKeyBundle: UserPreKeyBundle) {
	returnIfDatabaseNotInitialised();

	const insertedData = await userPreKeyBundleRepository.save(userPreKeyBundle.userID, {
		userID: userPreKeyBundle.userID,
		IdentityKey: userPreKeyBundle.preKeyBundle.IdentityKey,
		Signature: userPreKeyBundle.preKeyBundle.SignedPreKey.Signature,
		PreKey: userPreKeyBundle.preKeyBundle.SignedPreKey.PreKey,
	});
	return entityToUserPreKeyBundle(insertedData);
}


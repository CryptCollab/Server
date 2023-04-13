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
	documentIDs: string[];

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

export interface UserKeyStore {
	userID: string;
	identityPublic: string;
	identityPubliciv: string;
	identitySecret: string;
	identitySecretiv: string;
	preKeyPublic: string;
	preKeyPubliciv: string;
	preKeySecret: string;
	preKeySecretiv: string;
	masterKey: string;
}

export interface DocumentGroupKey {
	userID: string;
	documentID: string;
	groupKey: string;
	groupKeyiv: string;
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
	documentIDs: {
		type: "string[]",
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
		documentIDs: entity.documentIDs as string[],
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

const userKeyStoreSchema = new Schema("userKeyStore", {
	userID: {
		type: "string",
	},
	identityPublic: {
		type: "string",
	},
	identityPubliciv: {
		type: "string",
	},
	identitySecret: {
		type: "string",
	},
	identitySecretiv: {
		type: "string",
	},
	preKeyPublic: {
		type: "string",
	},
	preKeyPubliciv: {
		type: "string",
	},
	preKeySecret: {
		type: "string",
	},
	preKeySecretiv: {
		type: "string",
	},
	masterKey: {
		type: "string",
	},
});

const entityToUserKeyStore = (entity: Entity | null): UserKeyStore | null => {
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
		identityPublic: entity.identityPublic as string,
		identityPubliciv: entity.identityPubliciv as string,
		identitySecret: entity.identitySecret as string,
		identitySecretiv: entity.identitySecretiv as string,
		preKeyPublic: entity.preKeyPublic as string,
		preKeyPubliciv: entity.preKeyPubliciv as string,
		preKeySecret: entity.preKeySecret as string,
		preKeySecretiv: entity.preKeySecretiv as string,
		masterKey: entity.masterKey as string,
	};
};

const documentGroupKeySchema = new Schema("documentGroupKey", {
	userID: {
		type: "string",
	},
	documentID: {
		type: "string",
	},
	groupKey: {
		type: "string",
	},
	groupKeyiv: {
		type: "string",
	},
});

const entityToDocumentGroupKey = (entity: Entity | null): DocumentGroupKey | null => {
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
		documentID: entity.documentID as string,
		groupKey: entity.groupKey as string,
		groupKeyiv: entity.groupKeyiv as string,
	};
};






let redisClient: RedisClientType;
let userRepository: Repository;
let documentInvitationRepository: Repository;
let documentMetaDataRepository: Repository;
let userPreKeyBundleRepository: Repository;
let userKeyStoreRepository: Repository;
let documentGroupKeyRepository: Repository;
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
	userKeyStoreRepository = new Repository(userKeyStoreSchema, redisClient);
	documentGroupKeyRepository = new Repository(documentGroupKeySchema, redisClient);

	userRepository.createIndex();
	documentInvitationRepository.createIndex();
	documentMetaDataRepository.createIndex();
	userPreKeyBundleRepository.createIndex();
	userKeyStoreRepository.createIndex();
	documentGroupKeyRepository.createIndex();


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
//TODO better email matching
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


export async function getDocumentMetaDataWithDocumentID(documentID: string): Promise<DocumentMetaData | null> {
	returnIfDatabaseNotInitialised();
	return entityToDocumentMetaData(await documentMetaDataRepository.fetch(documentID));
}

export async function getDocumentInvitationWithUserID(userID: string): Promise<DocumentInvitation[] | null> {
	returnIfDatabaseNotInitialised();
	const queryResult = await documentInvitationRepository.search().where("participantID").equals(userID).returnAll();
	const documentInvitations = queryResult.map((entity) => entityToDocumentInvitation(entity)).filter((documentInvitation) => documentInvitation !== null) as DocumentInvitation[];
	return documentInvitations;
}

export async function getPreKeyBundleWithUserID(userId: string): Promise<UserPreKeyBundle | null> {
	returnIfDatabaseNotInitialised();
	return entityToUserPreKeyBundle(await userPreKeyBundleRepository.fetch(userId));
}

export async function getUserKeyStoreWithUserID(userId: string): Promise<UserKeyStore | null> {
	returnIfDatabaseNotInitialised();
	return entityToUserKeyStore(await userKeyStoreRepository.fetch(userId));
}

export async function getDocumentGroupKeyWithDocumentIDAndUserID(documentID: string, userID: string): Promise<DocumentGroupKey | null> {
	returnIfDatabaseNotInitialised();
	const queryResult = await documentGroupKeyRepository.search().where("documentID").equals(documentID).and("userID").equals(userID).return.first();
	return entityToDocumentGroupKey(queryResult);
}

export async function getDocumentListWithUserID(userId: string): Promise<string[]>{
	returnIfDatabaseNotInitialised();
	const queryResult = await userRepository.fetch(userId);
	return entityToUser(queryResult)?.documentIDs ?? [];
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

export async function insertDocumentIDIntoUserDatabase(documentID: string, userID: string): Promise<void> {
	returnIfDatabaseNotInitialised();
	const user = entityToUser(await userRepository.fetch(userID));
	if (user && user.documentIDs !== null && user.documentIDs !== undefined) {
		const newDocumentIDs = [...user.documentIDs, documentID];
		await userRepository.save(user?.entityId as string, {
			userName: user?.userName,
			email: user?.email,
			password: user?.password,
			documentIDs: newDocumentIDs
		});
	}

}


export async function insertDocumentInvitationIntoDatabase(documentID: string, participantId: string, leaderId: string, preKeyBundle: string): Promise<DocumentInvitation | null> {
	returnIfDatabaseNotInitialised();

	const documentInvitation = await documentInvitationRepository.save({
		documentID: documentID,
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

export async function insertUserIDIntoDocumentMetaDataDatabase(documentID: string, userID: string): Promise<void> {
	returnIfDatabaseNotInitialised();
	const documentMetaData = entityToDocumentMetaData(await documentMetaDataRepository.fetch(documentID));
	if (documentMetaData && documentMetaData.participantIDs !== null && documentMetaData.participantIDs !== undefined) {
		const newParticipantIDs = [...documentMetaData.participantIDs, userID];
		await documentMetaDataRepository.save(documentMetaData?.entityId as string, {
			leaderID: documentMetaData?.leaderID,
			totalParticipants: documentMetaData?.totalParticipants,
			participantIDs: newParticipantIDs,
			latestDocumentUpdate: documentMetaData?.latestDocumentUpdate
		});
	}
}

export async function insertLatestUpdateIntoDocumentMetaDataDatabase(documentID: string, latestDocumentUpdate: string): Promise<void> {
	returnIfDatabaseNotInitialised();
	const documentMetaData = entityToDocumentMetaData(await documentMetaDataRepository.fetch(documentID));
	if (documentMetaData) {
		await documentMetaDataRepository.save(documentMetaData?.entityId as string, {
			leaderID: documentMetaData?.leaderID,
			totalParticipants: documentMetaData?.totalParticipants,
			participantIDs: documentMetaData?.participantIDs,
			latestDocumentUpdate: latestDocumentUpdate
		});
	}
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

export async function insertUserKeyStoreIntoDatabase(userKeyStore: UserKeyStore) {
	returnIfDatabaseNotInitialised();

	const insertedData = await userKeyStoreRepository.save(userKeyStore.userID, {
		userID: userKeyStore.userID,
		identityPublic: userKeyStore.identityPublic,
		identityPubliciv: userKeyStore.identityPubliciv,
		identitySecret: userKeyStore.identitySecret,
		identitySecretiv: userKeyStore.identitySecretiv,
		preKeyPublic: userKeyStore.preKeyPublic,
		preKeyPubliciv: userKeyStore.preKeyPubliciv,
		preKeySecret: userKeyStore.preKeySecret,
		preKeySecretiv: userKeyStore.preKeySecretiv,
		masterKey: userKeyStore.masterKey,
	});
	return entityToUserKeyStore(insertedData);
}

export async function insertDocumentGroupKeyIntoDatabase(userID: string, documentID: string, groupKey: string, groupKeyiv: string): Promise<DocumentGroupKey | null> {
	returnIfDatabaseNotInitialised();

	const insertedData = await documentGroupKeyRepository.save(userID, {
		userID: userID,
		documentID: documentID,
		groupKey: groupKey,
		groupKeyiv: groupKeyiv,
	});
	return entityToDocumentGroupKey(insertedData);
}


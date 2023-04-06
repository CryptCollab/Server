import { RedisClientType } from "redis";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getPreKeyBundleWihUserId } from "./database/api";


let documentLeader: string, participant: string;

let prekey: unknown;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function socketConnectionsHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, subscriberClient: RedisClientType, publisherClient: RedisClientType) {

	io.on("connect", async (socket) => {
		socket.join("documentRoom");
		const listener = (message: string, channel: string) => console.log(message, channel);
		await subscriberClient.subscribe("documentRoom", listener);
		//Check if total users in room is greater than 1
		console.log(`User connected with id: ${socket.id} in documentRoom with total users: ${io.sockets.adapter.rooms.get("documentRoom")?.size}`);
		if (io.sockets.adapter.rooms.get("documentRoom")?.size == 1) {
			documentLeader = socket.id;
			console.log(`New document leader with id: ${socket.id} in documentRoom`);
		}
		else {
			participant = socket.id;
			console.log(`New participant with id: ${socket.id} in documentRoom`);

		}

		socket.emit("usersInRoom", io.sockets.adapter.rooms.get("documentRoom")?.size);

		socket.on("preKeyBundle", (data) => {
			prekey = data;
			//console.log(`Recieved prekey bundle from ${socket.id}`);
			socket.to(documentLeader).emit("prekeyBundleForHandshake", prekey, participant);
		});

		socket.on("firstMessage", (firstMessageBundle, recipient, firstGroupMessage) => {
			//console.log(`Recieved first message from ${socket.id}`);
			socket.to(recipient).emit("firstMessageForHandshake", firstMessageBundle, firstGroupMessage);
		});

		socket.on("disconnect", () => {
			console.log(`User disconnected with id: ${socket.id} `);
		});

		socket.on("groupMessage", (groupMessage) => {
			//console.log(`Recieved group message from ${socket.id}`);
			socket.to("documentRoom").emit("groupMessage", groupMessage);
			//console.log(`Group Message: `, groupMessage);
		});

		socket.on("documentUpdate", (documentUpdate) => {
			socket.to("documentRoom").emit("documentUpdate", documentUpdate);
			//console.log("Recieved document update", documentUpdate);
			publisherClient.publish("documentRoom", documentUpdate);
		});

		socket.on("awarenessUpdate", (awarenessUpdate) => {
			socket.to("documentRoom").emit("awarenessUpdate", awarenessUpdate);
			//console.log("Recieved awareness update", awarenessUpdate);
		});

		socket.on("getPreKeyBundleWithUserID", async (userID) => {
			const preKeyBundle = await getPreKeyBundleWihUserId(userID);
			socket.emit("preKeyBundleWithUserID", preKeyBundle);
			socket.to(socket.id).emit("preKeyBundleWithUserID", preKeyBundle,userID);
		}
		);

	});


	io.on("connect_error", (err) => {
		console.log(`connect_error due to ${err.message}`);
	});

	io.on("disconnect", (reason) => {
		console.log(`disconnect due to ${reason}`);
	});
}
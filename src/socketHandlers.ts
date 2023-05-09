import { RedisClientType } from "redis";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function socketConnectionsHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, subscriberClient: RedisClientType, publisherClient: RedisClientType) {

	io.on("connect", async (socket) => {
		socket.join("documentRoom");
		const listener = (message: string, channel: string) => console.log(message, channel);
		await subscriberClient.subscribe("documentRoom", listener);
		//Check if total users in room is greater than 1
		console.log(`User connected with id: ${socket.id} in documentRoom with total users: ${io.sockets.adapter.rooms.get("documentRoom")?.size}`);

	

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

		socket.on("disconnect", () => {
			console.log(`User disconnected with id: ${socket.id} `);
		});

	});


	io.on("connect_error", (err) => {
		console.log(`connect_error due to ${err.message}`);
	});

	io.on("disconnect", (reason) => {
		console.log(`disconnect due to ${reason}`);
	});
}
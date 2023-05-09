import { RedisClientType } from "redis";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { createKafkaClient, createKafkaProducer, destroyKafkaInstances, getLatestMessageFromTopic, produceMessage } from "./kafkaUtil";
import { Consumer, Producer } from "kafkajs";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function socketConnectionsHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, subscriberClient: RedisClientType, publisherClient: RedisClientType) {

	io.on("connect", async (socket) => {
		//socket.join("documentRoom");
		//const listener = (message: string, channel: string) => console.log(message, channel);

		//Check if total users in room is greater than 1

		let kafkaClient, kafkaProducer: Producer, kafkaConsumer: Consumer;
		
		
		socket.on("documentID",  async(documentID) => {
			socket.join(documentID);
			//subscriberClient.subscribe(documentID, listener);
			kafkaClient = createKafkaClient();
			kafkaProducer = await createKafkaProducer(kafkaClient);
			kafkaConsumer = kafkaClient.consumer({ groupId: socket.id });
			await getLatestMessageFromTopic(kafkaConsumer, documentID, kafkaClient, io, socket.id);
			await kafkaConsumer.disconnect();
			console.log(`User ${socket.id} joined document room ${documentID} with ${io.sockets.adapter.rooms.get(documentID)?.size} users`);
		});



		socket.on("documentState", async (documentID, documentState) => {
			await produceMessage(kafkaProducer,documentID, documentState);
		});

		socket.on("groupMessage", (documentID, groupMessage) => {
			//console.log(`Recieved group message from ${socket.id}`);
			socket.to(documentID).emit("groupMessage", groupMessage);
			//console.log(`Group Message: `, groupMessage);
		});

		socket.on("documentUpdate", async (documentID, documentUpdate) => {
			socket.to(documentID).emit("documentUpdate", documentUpdate);
			//console.log("Recieved document update", documentUpdate);
			console.log("Publishing document update");
			publisherClient.publish(documentID, documentUpdate);
			
		});

		socket.on("awarenessUpdate", (documentID, awarenessUpdate) => {
			socket.to(documentID).emit("awarenessUpdate", awarenessUpdate);
			//console.log("Recieved awareness update", awarenessUpdate);
		});

		socket.on("disconnect", async() => {
			console.log(`User disconnected with id: ${socket.id} `);
			await destroyKafkaInstances(kafkaProducer);
		});

	});


	io.on("connect_error", (err) => {
		console.log(`connect_error due to ${err.message}`);
	});

	io.on("disconnect", (reason) => {
		console.log(`disconnect due to ${reason}`);

	});
}
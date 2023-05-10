import { Consumer, Kafka as KafkaJS, Producer } from "kafkajs";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";


export function createKafkaClient() {
	const kafkaClient = new KafkaJS({
		clientId: process.env.KAFKA_CLIENT_ID,
		brokers: [`${process.env.KAFKA_BROKERS}`],
		ssl: true,
		sasl: {
			mechanism: "plain",
			username: process.env.KAFKA_USERNAME as string,
			password: process.env.KAFKA_PASSWORD as string,
		},
		connectionTimeout: 10000,
	});
	return kafkaClient;
}


export async function createTopic(topicName: string, kafkaClient: KafkaJS) {
	const kafkaAdmin = kafkaClient.admin();
	try {
		await kafkaAdmin.connect();
		await kafkaAdmin.createTopics({
			topics: [{
				topic: topicName,
				numPartitions: 1,
			}],
		});
	}
	catch (error) {
		console.log(error);
	}

	await kafkaAdmin.disconnect();
}

export async function deleteTopic(topicName: string, kafkaClient: KafkaJS) {
	const kafkaAdmin = kafkaClient.admin();
	await kafkaAdmin.connect();
	await kafkaAdmin.deleteTopics({
		topics: [topicName],
	});
	await kafkaAdmin.disconnect();
}


export async function createKafkaProducer(kafkaClient: KafkaJS) {
	const producer = kafkaClient.producer();
	await producer.connect();
	return producer;
}



export async function produceMessage(producer: Producer, topicName: string, message: string) {
	await producer.send({
		topic: topicName,
		messages: [
			{ value: message },
		],
	});
}

async function fetchTopicOffsets(topicName: string, kafkaClient: KafkaJS) {
	const admin = kafkaClient.admin();
	await admin.connect();
	const offsets = await admin.fetchTopicOffsets(topicName);
	await admin.disconnect();
	return offsets[0].offset;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getLatestMessageFromTopic(consumer: Consumer,topic: string, kafkaClient: KafkaJS, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socketID: string) {
	await consumer.connect();
	let latestOffset = await fetchTopicOffsets(topic, kafkaClient);
	const latestOffsetInNumber = parseInt(latestOffset, 10) - 1;
	latestOffset = latestOffsetInNumber.toString();
	await consumer.subscribe({ topic: topic, fromBeginning: false });
	let latestMessage;
	consumer.run({
		eachMessage: async ({ message }) => {
			console.log({
				value: message?.value?.toString(),
			});
			latestMessage = message?.value?.toString();
			io.to(socketID).emit("documentState", latestMessage);
			if (latestMessage)
				return;
		}
	});
	consumer.seek({ topic: topic, partition: 0, offset: latestOffset });

}


export async function destroyKafkaInstances(producer: Producer) {
	await producer.disconnect();
	
}



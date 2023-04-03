import { createClient } from "redis";
import { Repository } from "redis-om";
import { Schema } from "redis-om";



async function main() {
	const redis = createClient();
	redis.on("error", (err) => console.log("Redis Client Error", err));
	await redis.connect();


	const albumSchema = new Schema("album", {
		artist: { type: "string" },
		title: { type: "text" },
		year: { type: "number" },
		genres: { type: "string[]" },
		outOfPublication: { type: "boolean" }
	},
	);

	const albumRepository = new Repository(albumSchema, redis);


	const album = {
		artist: "Mushroomhead",
		title: "The Righteous & The Butterfly",
		year: 2014,
		genres: ["metal"],
		outOfPublication: true
	};

	await albumRepository.save(album);
	await albumRepository.createIndex();

	const albums = await albumRepository.search().where("artist").eq("Mushroom*").return.all();
	console.log(albums);

}


main();
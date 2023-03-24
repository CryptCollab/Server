export const requiredEnviromentVariables: string[] = [
	"NODE_ENV",


	"REDIS_URL",

	"SERVER_ACCESS_TOKEN_SECRET",
	"SERVER_REFRESH_TOKEN_SECRET",

];



export default function checkAllEnviromentVariables() {
	let toExit = false;
	requiredEnviromentVariables.forEach((envVariable) => {
		if (process.env[envVariable] === undefined || process.env[envVariable] === null || process.env[envVariable] === "") {
			console.error(`⚠️  env:${envVariable} is not defined`);
			toExit = true;
		}
	});

	if (toExit) {
		console.error("Aborting...");
		process.exit(1);
	}

}
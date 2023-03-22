export const requiredEnviromentVariables: string[] = [
	"NODE_ENV",

	"MYSQL_USER",
	"MYSQL_PASSWORD",
	"MYSQL_DATABASE",
	"MYSQL_HOST",

	"REDIS_URL",

	"SERVER_ACCESS_TOKEN_SECRET",
	"SERVER_REFRESH_TOKEN_SECRET",

	"VITE_APP_BASE_URL"
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
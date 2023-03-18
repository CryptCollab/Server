export const requiredEnviromentVariables: string[] = [
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE",
    "MYSQL_HOST",

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
    })

    console.log(process.env.REACT_APP_BASE_URL)
    if (toExit) {
        console.error("Aborting...");
        process.exit(1);
    }

}
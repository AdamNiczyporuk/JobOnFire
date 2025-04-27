import dotenv from "dotenv";
dotenv.config()
dotenv.config({ path: './.env.local' }).parsed
    && console.log("Adding additional local env vars")
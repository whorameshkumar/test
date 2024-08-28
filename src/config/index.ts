import { config } from 'dotenv'; // dotenv mein const config tha uss ko nikal dia {config}
import path from 'path';

// config(); // called it
// ../../.env.${process.env.NODE_ENV means .env.NODE_ENV -> so NODE_ENV mein humara environments hain TEST, PROD, SIM, DEV  -> e.g. .env.TEST, .env.PROD, .env.SIM, .env.DEV
config({path:path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`)}); // agar koi env nhi tu  dev assume krdu

// DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME yhe mene data-source.ts sye naam liye bs, so receving them using process.env
const { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, REFRESH_TOKEN_SECRET, JWKS_URI, PRIVATE_KEY} = process.env; // object destructuring kri aur process.env sye PORT nikal dia // future mein process.env became process.file tu sirf yahan change krdena

//console.log("dekho konsa db hai -> ", DB_NAME);
export const Config = { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME,REFRESH_TOKEN_SECRET, JWKS_URI, PRIVATE_KEY}; // config sye conflict naa ho tu Config krida aur object mein PORT export krdia // NODE_ENV will tell konsa env hai Sim, Test, Prod, Dev


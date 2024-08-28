import app from './app';
import { Config } from './config'; // // why {Config} not Config? index.ts mein const Config kr k export kya howa hai so {Config}. Agar const naa hota export tu simple Config liktye
import { AppDataSource } from './config/data-source';
import logger from "./config/logger"; 
// import createError from "http-errors";

const startServer = async () => {  
    const PORT = Config.PORT; 
    try {
        await AppDataSource.initialize(); // initializing database, await kra tu function ko async krna paryegaa
        logger.info("Database connected successfully.")
        logger.debug("ramesh debug message",{})
        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`, {test:'yhe log mein jayegaa for testing'})); // look we used logger.info not console.log
    } catch (err: unknown) {
        if(err instanceof Error) { // why? agar error kaa instance hai tu iss case mein logger and proces exit krdu
            logger.error(err.message); // // look we used logger.info not console.log
            setTimeout(()=>{process.exit(1);}, 1000);  
        }
    }
};
void startServer(); // await ki warning dye raha tha tu await bhi krsaktye ho but hum n void use kr k ignore krdia 


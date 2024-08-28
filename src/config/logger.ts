import winston from 'winston';
import { Config } from '.'; // for env variables

// https://github.com/winstonjs/winston
// https://github.com/winstonjs/winston#transports
// https://github.com/winstonjs/winston/blob/master/docs/transports.md#additional-transports

const logger = winston.createLogger({

    // levels imp concept: error:0, warn:1, info:2, http:3, verbose:4, debug:5, silly:6    // e.g. debug krtye ho tu error+warn+info+http+verbose+debug sb show hongye
    level:'info', // porye instance ko info level dia hai u can change it 

    defaultMeta: {
        serviceName: 'restaurant',  // kis service kaa log hai 
    },

    // for timestamp
    format: winston.format.combine(
      winston.format.timestamp(), 
      winston.format.json(),
    ),

    // k logs store kha hongye maybe in file, db, terminal, elastic search, etc. 
    transports: [ 
        
        // Debug logs 
        // for logs in logs folder - jesye application ko save kro gye tu log mein entry chali jaye gii
        new winston.transports.File({
            dirname:'logs',
            filename:'app.log', // file kaa naam
            level:'debug', // mene debug kra so debug tu dikhye gaa plus iss k upar bhi show hongye  
            //silent:false,  // agar yhe true krogye tu log folder mein nhi jaeing gye logs 
            silent:Config.NODE_ENV==="test", // agar test environment hai tu logs mat record kro
        }),


        // Info logs in logs folder - combined.log
        new winston.transports.File({
            dirname:'logs',
            filename:'combined.log', // file kaa naam
            level:'info', 
            //silent:false,  // agar yhe true krogye tu log folder mein nhi jaeing gye logs 
            silent:Config.NODE_ENV==="test", // agar test environment hai tu logs mat record kro
        }),

        
        // Error logs in folder 
        new winston.transports.File({
            dirname:'logs',
            filename:'error.log',  // file kaa naam
            level:'error', // mene error kra so sirf error aaeingye wo level 0 p hai 
            silent:false,  // agar yhe true krogye tu log folder mein nhi jaeing gye logs - this will record logs in all environments 
        }),
        
        
        // for logs on console window when u run ur server.ts using npm run dev
        new winston.transports.Console({
            level:'info', // u can override the level in transports
            // format: winston.format.json()}) // u can write simple() but I wrote json() which is more meaningful
            silent:Config.NODE_ENV==="test", // agar test environment hai tu logs mat record kro
        }), // mene timestamp + json dono use kra hai
        
    ], 
}) 
export default logger; 
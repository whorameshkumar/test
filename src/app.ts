import express, { Request, Response, NextFunction } from 'express';
import logger from './config/logger'; // for logging
import { HttpError } from 'http-errors'; // for err:HttpError - I don't want to create class or use unknown
import createError from 'http-errors'; // for creating error
import authRouter from './routes/auth'; // for routes
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import cors from "cors";

const app = express();
// app.use(cors()); // agar options nhi dalo gye tu kisi bhi domain sye koi bhi request kr sakta hai so not secure  
app.use(cors({
    // better iss origin ko .env mein daal du yahan hard-coded naa kro abhi k liye krlia
    origin: ["http://localhost:5173"], // iss port p frontend chal raha hai 
    credentials: true, 
})); 
// keys publically accessible in JSON format
app.use(express.static("public")); // express ko bol rehye hain yhe public folder humara static folder hai. Aur jesye hum browser p jatye hai `localhost:5000/.well-known/jwks.json` tu yhe key hum ko browser p dekhyegii tu means publically key available hai
// need to use express middleware
app.use(cookieParser());
app.use(express.json());

// GET route - controller - localhost:3001/ -> u will see the msg

app.get('/', (req, res) => {
    res.status(201).send('Welcome to Auth service'); // dekho mene bola 201 status aayegaa from '/' route, aur test mein mene expect.toBe(201) likha both same tu test pass
});

// GET route - controller - localhost:3001/abc -> u will get error that u can't access this page, power of app.use where we used http-errors library
// now I made async, means asynchronous executions hogi aur jb async execution hogi tb import createError from "http-errors" app crash krdeta hai. To fix this issue use next and then return error
app.get('/abc', async (req, res, next) => {
    // Error - using library - Dekho controller k route mein aesye error handling krein gye -  using import createError from "http-errors";
    const err = createError(401, 'Hey abc u are not allowed to access this page');
    //throw err;
    return next(err);
});

// POST
// app.post('/auth/register', (req,res)=> {
//     res.status(201);
//     res.send(); // response dia taa k hang naa hojaye
// })

app.use('/auth', authRouter); // look ab hum ko app.ts mein pora route nhi dalna paryegaa all routes will be in route folder
app.use("/tenants", tenantRouter);
app.use("/users", userRouter); 

// Error handling - Middleware (usually middleware has req,res, next but app.use has error also)
// err: Request, Response, NextFunction -> Request, Response, NextFunction hum n iss kiye likha b/c typescript demand for type and hum n express sye lye lia yhe
// err:unknown -> ab unknown likha acha nhi, 2 options either create a class for error and define ur logic or use library i.e. npm i http-errors. Mene lib use ki err:HttpError
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.log("Error mein kya kya hai", err); // u will see status, tu we need to work on status property
    // app.use is our global middleware and it takes 4 arguments i.e. err, req, res and next
    //if(err instanceof Error){ // error kaa instance type bata rehye hain Error hai
    logger.error(err.message); // for logging

    const statusCode = err.statusCode || err.status || 500; // 500 is server status code aur bhi hai 400, 404, etc. Logic yhe hai agar err.statusCode and err.status nhi hai tu phir 500 return krna warna nhi.
    
    res.status(statusCode).json({
        // yhe client p hamesha visible hoga if server sye error aaraha hai tu
        errors: [{ type: err.name, msg: err.message, path: '', location: '' }], // error format - faida yhe howa when u go to localhost:5000 then u will see log output with this format
    });
    //}
});
export default app;

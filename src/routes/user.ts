import express from 'express';
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
//import { AppDataSource } from "../data-source";   -> this was causing the error, so make sure this import is correct
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { UserService } from "../services/UserService";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// here we used our powerful middleware authenticate for tokens 
router.post("/",authenticate,canAccess([Roles.ADMIN]),(req,res,next)=>userController.create(req,res,next)); // ([Roles.ADMIN]) so only Admin can create tenant, array aur bhi add kr saktye ho
// router.post("/",authenticate,canAccess([Roles.ADMIN]),(req: CreateUserRequest, res: Response, next: NextFunction) =>userController.create(req, res, next),);

export default router;
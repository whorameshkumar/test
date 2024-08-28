import { NextFunction, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";
import { validationResult } from "express-validator";

export class UserController {

    constructor(private userService: UserService) {}

  
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        //console.log("Request body:", req.body); // Log incoming request body
        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            });
          //  console.log("User created:", user); // Log created user
            res.status(201).json({ id: user.id });

        } catch (err) {
            next(err);
        }
    }
}

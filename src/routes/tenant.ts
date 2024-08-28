import express from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const router = express.Router();

// routes -> auth.ts mein dekho kesye hum repo get krtye hain
const tenantRepository = AppDataSource.getRepository(Tenant);
// TenantService is also expecting repository
const tenantService = new TenantService(tenantRepository); 
// TenantController ko import kra
const tenantController = new TenantController(tenantService, logger); // TenantController ko import kra

// here we used our powerful middleware authenticate for tokens 
router.post("/", authenticate, canAccess([Roles.ADMIN]), (req,res,next)=>tenantController.create(req,res,next)); // ([Roles.ADMIN]) so only Admin can create tenant, array aur bhi add kr saktye ho


// router.patch(
//     "/:id",
//     authenticate,
//     canAccess([Roles.ADMIN]),
//     tenantValidator,
//     (req: CreateTenantRequest, res: Response, next: NextFunction) =>
//         tenantController.update(req, res, next),
// );


// iss endpoint p yhe nhi dalein gye authenticate, canAccess([Roles.ADMIN]) kyn k customers ko restaurant ki tenant ki list show krwani hai 
// router.get("/", (req, res, next) => tenantController.getAll(req, res, next));


// tenant ki har koi info nhi get kr paye only Admin can access it, so we add authenticate, canAccess([Roles.ADMIN])
// router.get("/:id", authenticate, canAccess([Roles.ADMIN]),(req, res, next) => tenantController.getOne(req, res, next));


// router.delete(
//     "/:id",
//     authenticate,
//     canAccess([Roles.ADMIN]),
//     (req, res, next) => tenantController.destroy(req, res, next),
// );


export default router; 
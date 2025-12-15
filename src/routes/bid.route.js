import express from "express";
import bidController from "../controllers/bid.controller.js";
import { ensureAuthenticated } from "../middlewares/authenticate.js";


const router = express.Router();

router.post("/", ensureAuthenticated, bidController.createBib);

export default router;
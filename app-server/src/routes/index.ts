import { Router } from "express";
import { router as authRoute } from "./auth";
import { router as employerRoute } from "./employer";

export const router = Router();

router.use("/auth", authRoute);
router.use("/employer", employerRoute);
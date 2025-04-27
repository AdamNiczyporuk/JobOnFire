import { Router } from "express";
import {router as authRoute } from "./auth";

export const router = Router();

router.use("/auth", authRoute);
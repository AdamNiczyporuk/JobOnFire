import { Router } from "express";
import { router as authRoute } from "./auth";
import { router as employerRoute } from "./employer";
import { router as jobOfferRoute } from "./jobOffer";

export const router = Router();

router.use("/auth", authRoute);
router.use("/employer", employerRoute);
router.use("/job-offers", jobOfferRoute);
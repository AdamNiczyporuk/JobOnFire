import { Router } from "express";
import { router as authRoute } from "./auth";
import { router as employerRoute } from "./employer";
import { router as jobOfferRoute } from "./jobOffer";
import { router as candidateRoute } from "./candidate";
import { router as applicationRoute } from "./application";

export const router = Router();

router.use("/auth", authRoute);
router.use("/employer", employerRoute);
router.use("/job-offers", jobOfferRoute);
router.use("/candidate", candidateRoute);
router.use("/applications", applicationRoute);
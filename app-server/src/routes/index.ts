import { Router } from "express";
import { router as authRoute } from "./auth";
import { router as employerRoute } from "./employer";
import { router as jobOfferRoute } from "./jobOffer";
import { router as candidateRoute } from "./candidate";
import { router as applicationRoute } from "./application";
import { router as meetingRoute } from "./meeting";
import { router as externalJobOfferRoute } from "./externalJobOffer";
import { router as cvGeneratorRoute } from "./cvGenerator";
import { router as questionGeneratorRoute } from "./questionGenerator";
import { router as recruitmentQuestionRoute } from "./recruitementQuestion";
import { router as recruitmentTestRoute } from "./recruitmentTest";

export const router = Router();

router.use("/auth", authRoute);
router.use("/employer", employerRoute);
router.use("/job-offers", jobOfferRoute);
router.use("/candidate", candidateRoute);
router.use("/applications", applicationRoute);
router.use("/meetings", meetingRoute);
router.use("/external-job-offers", externalJobOfferRoute);
router.use("/cv-generator", cvGeneratorRoute);
router.use("/question-generator", questionGeneratorRoute);
router.use("/recruitment-questions", recruitmentQuestionRoute);
router.use("/recruitment-tests", recruitmentTestRoute);
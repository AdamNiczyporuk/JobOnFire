import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureEmployer } from '../auth/ensureEmployer';
import { prisma } from '../db';
import { validateEmployerProfile, validateJobOfferOwnership } from '../utils/employerHelpers';

export const router = Router();

// GET /recruitment-questions/job/:jobOfferId - list questions for a job offer (employer-owned)
router.get('/job/:jobOfferId', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
	try {
		const jobOfferId = parseInt(req.params.jobOfferId);
		if (isNaN(jobOfferId)) {
			res.status(400).json({ message: 'Invalid jobOfferId' });
			return;
		}

		const employerProfile = await validateEmployerProfile(req, res);
		if (!employerProfile) return;

		const jobOffer = await validateJobOfferOwnership(jobOfferId, employerProfile.id, res);
		if (!jobOffer) return;

		const questions = await prisma.recruitmentQuestion.findMany({
			where: { jobOfferId },
			orderBy: { id: 'asc' }
		});

		res.json({ questions });
	} catch (error) {
		console.error('Error fetching recruitment questions:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
});

// POST /recruitment-questions - create a question for a job offer
router.post('/', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
	try {
		const { jobOfferId, question } = req.body as { jobOfferId?: number; question?: string };
		if (!jobOfferId || typeof jobOfferId !== 'number') {
			res.status(400).json({ message: 'jobOfferId is required and must be a number' });
			return;
		}
		if (!question || typeof question !== 'string' || !question.trim()) {
			res.status(400).json({ message: 'question is required' });
			return;
		}

		const employerProfile = await validateEmployerProfile(req, res);
		if (!employerProfile) return;
		const jobOffer = await validateJobOfferOwnership(jobOfferId, employerProfile.id, res);
		if (!jobOffer) return;

		const created = await prisma.recruitmentQuestion.create({
			data: { jobOfferId, question: question.trim() }
		});

		res.status(201).json({ message: 'Question created', question: created });
	} catch (error) {
		console.error('Error creating recruitment question:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
});

// PUT /recruitment-questions/:id - update question text
router.put('/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id);
		const { question } = req.body as { question?: string };
		if (isNaN(id)) {
			res.status(400).json({ message: 'Invalid id' });
			return;
		}
		if (!question || typeof question !== 'string' || !question.trim()) {
			res.status(400).json({ message: 'question is required' });
			return;
		}

		const employerProfile = await validateEmployerProfile(req, res);
		if (!employerProfile) return;

		const existing = await prisma.recruitmentQuestion.findUnique({ where: { id } });
		if (!existing) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		const jobOffer = await validateJobOfferOwnership(existing.jobOfferId, employerProfile.id, res);
		if (!jobOffer) return;

		const updated = await prisma.recruitmentQuestion.update({
			where: { id },
			data: { question: question.trim() }
		});

		res.json({ message: 'Question updated', question: updated });
	} catch (error) {
		console.error('Error updating recruitment question:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
});

// DELETE /recruitment-questions/:id - delete a question if no answers exist
router.delete('/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id);
		if (isNaN(id)) {
			res.status(400).json({ message: 'Invalid id' });
			return;
		}

		const employerProfile = await validateEmployerProfile(req, res);
		if (!employerProfile) return;

		const existing = await prisma.recruitmentQuestion.findUnique({ where: { id } });
		if (!existing) {
			res.status(404).json({ message: 'Question not found' });
			return;
		}

		const jobOffer = await validateJobOfferOwnership(existing.jobOfferId, employerProfile.id, res);
		if (!jobOffer) return;

		// Cascade delete: remove candidate answers first, then the question, in a transaction
		await prisma.$transaction([
			prisma.candidateAnswer.deleteMany({ where: { recruitmentQuestionId: id } }),
			prisma.recruitmentQuestion.delete({ where: { id } })
		]);

		res.json({ message: 'Question and related answers deleted' });
	} catch (error) {
		console.error('Error deleting recruitment question:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
});

export default router;

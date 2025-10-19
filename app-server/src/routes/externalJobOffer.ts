import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureCandidate } from '../auth/ensureCandidate';
import { prisma } from '../db';
import { validateCandidateProfile } from '../utils/applicationHelpers';

export const router = Router();

// Simple URL validation
function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return !!u.protocol && !!u.host;
  } catch {
    return false;
  }
}

// GET /external-job-offers - list candidate's external job offers
router.get('/', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const items = await prisma.externalJobOffer.findMany({
      where: { candidateProfileId: candidateProfile.id },
      orderBy: { id: 'desc' }
    });

    res.json({ externalJobOffers: items });
  } catch (error) {
    console.error('Błąd podczas pobierania zewnętrznych ofert:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// GET /external-job-offers/:id - get single external job offer (owned by candidate)
router.get('/:id', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Nieprawidłowe ID oferty' });
      return;
    }

    const item = await prisma.externalJobOffer.findFirst({
      where: { id, candidateProfileId: candidateProfile.id }
    });

    if (!item) {
      res.status(404).json({ message: 'Oferta nie została znaleziona' });
      return;
    }

    res.json({ externalJobOffer: item });
  } catch (error) {
    console.error('Błąd podczas pobierania oferty:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// POST /external-job-offers - create new external job offer
router.post('/', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const { url, site, name, company } = req.body || {};

    if (!url || !name) {
      res.status(400).json({ message: 'Brak wymaganych pól: url, name' });
      return;
    }

    if (!isValidUrl(url)) {
      res.status(400).json({ message: 'Nieprawidłowy adres URL' });
      return;
    }

    const created = await prisma.externalJobOffer.create({
      data: {
        url,
        site: site ?? null,
        name,
        company: company ?? null,
        candidateProfileId: candidateProfile.id
      }
    });

    res.status(201).json({ message: 'Oferta została utworzona', externalJobOffer: created });
  } catch (error) {
    console.error('Błąd podczas tworzenia oferty:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// PUT /external-job-offers/:id - update existing external job offer
router.put('/:id', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Nieprawidłowe ID oferty' });
      return;
    }

    const existing = await prisma.externalJobOffer.findFirst({
      where: { id, candidateProfileId: candidateProfile.id }
    });
    if (!existing) {
      res.status(404).json({ message: 'Oferta nie została znaleziona' });
      return;
    }

    const { url, site, name, company } = req.body || {};
    if (url !== undefined && !isValidUrl(url)) {
      res.status(400).json({ message: 'Nieprawidłowy adres URL' });
      return;
    }

    const updated = await prisma.externalJobOffer.update({
      where: { id: existing.id },
      data: {
        url: url ?? existing.url,
        site: site !== undefined ? site : existing.site,
        name: name ?? existing.name,
        company: company !== undefined ? company : existing.company
      }
    });

    res.json({ message: 'Oferta została zaktualizowana', externalJobOffer: updated });
  } catch (error) {
    console.error('Błąd podczas aktualizacji oferty:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// DELETE /external-job-offers/:id - delete external job offer
router.delete('/:id', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateProfile = await validateCandidateProfile(req, res);
    if (!candidateProfile) return;

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Nieprawidłowe ID oferty' });
      return;
    }

    const existing = await prisma.externalJobOffer.findFirst({
      where: { id, candidateProfileId: candidateProfile.id }
    });
    if (!existing) {
      res.status(404).json({ message: 'Oferta nie została znaleziona' });
      return;
    }

    await prisma.externalJobOffer.delete({ where: { id: existing.id } });
    res.json({ message: 'Oferta została usunięta' });
  } catch (error) {
    console.error('Błąd podczas usuwania oferty:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

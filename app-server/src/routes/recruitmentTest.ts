import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureEmployer } from '../auth/ensureEmployer';
import { prisma } from '../db';
import { 
  recruitmentTestCreateValidation,
  recruitmentTestGenerateValidation,
  recruitmentTestUpdateValidation 
} from '../validation/recruitmentTestValidation';
import { createRecruitmentTest } from '../utils/recruitmentTestHelpers';

export const router = Router();

/**
 * GET /recruitment-tests/job/:jobOfferId - Get test for specific job offer
 */
router.get('/job/:jobOfferId', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const jobOfferId = parseInt(req.params.jobOfferId);
    const user = req.user!;
    const employerProfileId = user.employerProfile?.id;

    if (!employerProfileId) {
      res.status(400).json({ message: 'Employer profile not found' });
      return;
    }

    // Verify job offer belongs to employer
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: jobOfferId,
        employerProfileId: employerProfileId
      }
    });

    if (!jobOffer) {
      res.status(404).json({ message: 'Job offer not found or access denied' });
      return;
    }

    // Get test
    const test = await prisma.recruitmentTest.findUnique({
      where: { jobOfferId: jobOfferId }
    });

    if (!test) {
      res.status(404).json({ message: 'Test not found for this job offer' });
      return;
    }

    res.status(200).json({ test });
  } catch (error: any) {
    console.error('Error fetching recruitment test:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * POST /recruitment-tests - Create test manually
 */
router.post('/', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = recruitmentTestCreateValidation.validate(req.body);
    if (error) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: error.details.map(d => d.message) 
      });
      return;
    }

    const { jobOfferId, testJson } = value;
    const user = req.user!;
    const employerProfileId = user.employerProfile?.id;

    if (!employerProfileId) {
      res.status(400).json({ message: 'Employer profile not found' });
      return;
    }

    // Verify job offer belongs to employer
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: jobOfferId,
        employerProfileId: employerProfileId
      }
    });

    if (!jobOffer) {
      res.status(404).json({ message: 'Job offer not found or access denied' });
      return;
    }

    try {
      const test = await createRecruitmentTest(jobOfferId, testJson);
      res.status(201).json({ test });
    } catch (e: any) {
      if (e.code === 'RECRUITMENT_TEST_EXISTS') {
        res.status(409).json({ message: 'Test already exists for this job offer. Use PUT to update.' });
        return;
      }
      throw e;
    }
  } catch (error: any) {
    console.error('Error creating recruitment test:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * POST /recruitment-tests/generate - Generate test with AI
 */
router.post('/generate', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  console.log('[Generate Test API] Request received at:', new Date().toISOString());
  
  try {
    console.log('[Generate Test API] Validating request body:', req.body);
    
    const { error, value } = recruitmentTestGenerateValidation.validate(req.body);
    if (error) {
      console.log('[Generate Test API] Validation failed:', error.details);
      res.status(400).json({ 
        message: 'Validation error', 
        errors: error.details.map(d => d.message) 
      });
      return;
    }

    const { jobOfferId, difficulty, numQuestions, language } = value;
    const user = req.user!;
    const employerProfileId = user.employerProfile?.id;

    console.log('[Generate Test API] Request params:', { 
      jobOfferId, 
      difficulty, 
      numQuestions, 
      language, 
      employerProfileId 
    });

    if (!employerProfileId) {
      console.log('[Generate Test API] Employer profile not found for user:', user.id);
      res.status(400).json({ message: 'Employer profile not found' });
      return;
    }

    // Verify job offer belongs to employer and get details
    console.log('[Generate Test API] Fetching job offer...');
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: jobOfferId,
        employerProfileId: employerProfileId
      }
    });

    if (!jobOffer) {
      console.log('[Generate Test API] Job offer not found or access denied');
      res.status(404).json({ message: 'Job offer not found or access denied' });
      return;
    }

    console.log('[Generate Test API] Job offer found:', jobOffer.name);

    // Generate test with AI
    console.log('[Generate Test API] Starting AI generation...');
    const aiStartTime = Date.now();
    
    const testJson = await generateTestWithAI(
      jobOffer.name,
      jobOffer.description || undefined,
      jobOffer.requirements ? JSON.stringify(jobOffer.requirements) : undefined,
      jobOffer.responsibilities ? JSON.stringify(jobOffer.responsibilities) : undefined,
      jobOffer.jobLevel ? JSON.stringify(jobOffer.jobLevel) : undefined,
      difficulty,
      numQuestions,
      language
    );

    const aiDuration = Date.now() - aiStartTime;
    console.log('[Generate Test API] AI generation completed in', aiDuration, 'ms');
    console.log('[Generate Test API] Generated test has', testJson?.questions?.length || 0, 'questions');

    // Return generated test JSON without saving to database
    // User will save it manually by clicking "Save" button
    const totalDuration = Date.now() - startTime;
    console.log('[Generate Test API] Total duration:', totalDuration, 'ms');
    console.log('[Generate Test API] Success! Returning generated test JSON');

    // Return just the testJson structure without creating database record
    res.status(200).json({ 
      testJson: testJson,
      message: 'Test generated successfully. Save it to persist.'
    });
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error('[Generate Test API] Error after', totalDuration, 'ms:', error);
    console.error('[Generate Test API] Error stack:', error.stack);
    console.error('[Generate Test API] Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * PUT /recruitment-tests/:id - Update test
 */
router.put('/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const testId = parseInt(req.params.id);
    const { error, value } = recruitmentTestUpdateValidation.validate(req.body);
    
    if (error) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: error.details.map(d => d.message) 
      });
      return;
    }

    const { testJson } = value;
    const user = req.user!;
    const employerProfileId = user.employerProfile?.id;

    if (!employerProfileId) {
      res.status(400).json({ message: 'Employer profile not found' });
      return;
    }

    // Get test and verify ownership
    const existingTest = await prisma.recruitmentTest.findUnique({
      where: { id: testId },
      include: {
        jobOffer: {
          select: {
            employerProfileId: true
          }
        }
      }
    });

    if (!existingTest) {
      res.status(404).json({ message: 'Test not found' });
      return;
    }

    if (existingTest.jobOffer.employerProfileId !== employerProfileId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Update test
    const test = await prisma.recruitmentTest.update({
      where: { id: testId },
      data: { testJson: testJson }
    });

    res.status(200).json({ test });
  } catch (error: any) {
    console.error('Error updating recruitment test:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * DELETE /recruitment-tests/:id - Delete test
 */
router.delete('/:id', ensureAuthenticated, ensureEmployer, async (req: Request, res: Response): Promise<void> => {
  try {
    const testId = parseInt(req.params.id);
    const user = req.user!;
    const employerProfileId = user.employerProfile?.id;

    if (!employerProfileId) {
      res.status(400).json({ message: 'Employer profile not found' });
      return;
    }

    // Get test and verify ownership
    const existingTest = await prisma.recruitmentTest.findUnique({
      where: { id: testId },
      include: {
        jobOffer: {
          select: {
            employerProfileId: true
          }
        }
      }
    });

    if (!existingTest) {
      res.status(404).json({ message: 'Test not found' });
      return;
    }

    if (existingTest.jobOffer.employerProfileId !== employerProfileId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Delete test
    await prisma.recruitmentTest.delete({
      where: { id: testId }
    });

    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting recruitment test:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * Generate test with AI based on job offer data
 */
async function generateTestWithAI(
  position: string,
  description?: string,
  requirements?: string,
  responsibilities?: string,
  jobLevel?: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  numQuestions: number = 10,
  language: string = 'pl'
): Promise<any> {
  console.log('[AI Generation] Starting with params:', { 
    position, 
    difficulty, 
    numQuestions, 
    language 
  });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[AI Generation] API key not configured');
    throw new Error('AI API key not configured. Set OPENAI_API_KEY in environment variables.');
  }

  console.log('[AI Generation] Building prompt...');
  const prompt = buildTestPrompt(
    position,
    description,
    requirements,
    responsibilities,
    jobLevel,
    difficulty,
    numQuestions,
    language
  );

  console.log('[AI Generation] Prompt length:', prompt.length, 'characters');

  // Dynamically import ESM-only OpenAI SDK under CommonJS
  console.log('[AI Generation] Importing OpenAI SDK...');
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  console.log('[AI Generation] Using model:', model);

  try {
    console.log('[AI Generation] Calling OpenAI API...');
    const apiStartTime = Date.now();
    
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'Jesteś ekspertem HR specjalizującym się w tworzeniu testów rekrutacyjnych. Zawsze odpowiadasz wyłącznie w formacie JSON, bez żadnych dodatkowych znaczników markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    const apiDuration = Date.now() - apiStartTime;
    console.log('[AI Generation] OpenAI API responded in', apiDuration, 'ms');

    const outputText = response.choices[0]?.message?.content;
    if (!outputText) {
      console.error('[AI Generation] No response content from API');
      throw new Error('No response from AI service');
    }

    console.log('[AI Generation] Response length:', outputText.length, 'characters');

    // Parse JSON response
    console.log('[AI Generation] Parsing JSON response...');
    const parsed = JSON.parse(outputText);
    
    console.log('[AI Generation] Parsed response:', {
      hasTitle: !!parsed.title,
      questionsCount: parsed.questions?.length || 0
    });

    if (!parsed.title || !parsed.questions || !Array.isArray(parsed.questions)) {
      console.error('[AI Generation] Invalid response format:', parsed);
      throw new Error('Invalid response format from AI');
    }

    console.log('[AI Generation] Success! Generated', parsed.questions.length, 'questions');
    return parsed;

  } catch (error: any) {
    console.error('[AI Generation] Error occurred:', error);
    console.error('[AI Generation] Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    if (error.code === 'insufficient_quota') {
      throw new Error('Przekroczono limit API OpenAI. Skontaktuj się z administratorem.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Nieprawidłowy klucz API OpenAI.');
    }
    
    throw new Error(`Błąd API OpenAI: ${error.message}`);
  }
}

/**
 * Build prompt for AI to generate recruitment test
 */
function buildTestPrompt(
  position: string,
  description?: string,
  requirements?: string,
  responsibilities?: string,
  jobLevel?: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  numQuestions: number = 10,
  language: string = 'pl'
): string {
  const difficultyMap = {
    easy: 'łatwy - podstawowe pytania',
    medium: 'średni - pytania wymagające dobrej znajomości tematu',
    hard: 'trudny - zaawansowane pytania dla ekspertów'
  };

  const langInstruction = language === 'pl' 
    ? 'w języku polskim' 
    : 'in English';

  return `
Jesteś ekspertem HR. Twoim zadaniem jest wygenerowanie profesjonalnego testu rekrutacyjnego ${langInstruction}.

KONTEKST STANOWISKA:
- Stanowisko: ${position}
- Poziom: ${jobLevel || 'Nie określono'}
- Opis: ${description || 'Brak szczegółowego opisu'}
- Wymagania: ${requirements || 'Brak szczegółowych wymagań'}
- Obowiązki: ${responsibilities || 'Brak szczegółowych obowiązków'}

PARAMETRY TESTU:
- Poziom trudności: ${difficultyMap[difficulty]}
- Liczba pytań: ${numQuestions}
- Język: ${language}

ZASADY GENEROWANIA TESTU:
1. Wygeneruj dokładnie ${numQuestions} pytań rekrutacyjnych
2. Zróżnicuj typy pytań:
   - 40% pytań otwartych (typ: "text") - wymagających opisowej odpowiedzi
   - 40% pytań jednokrotnego wyboru (typ: "choice") - z 4 opcjami odpowiedzi
   - 20% pytań wielokrotnego wyboru (typ: "multiple") - z 4-5 opcjami
3. Dla pytań otwartych (typ: "text"):
   - Dodaj pole "correctAnswer" z przykładową/wzorcową odpowiedzią
   - Ta odpowiedź będzie służyła rekruterowi jako punkt odniesienia przy ocenie
   - Powinna być konkretna, merytoryczna i pokazywać oczekiwany poziom wiedzy
4. Dla pytań z opcjami (choice/multiple):
   - Dodaj pole "options" z tablicą możliwych odpowiedzi
   - Dodaj pole "correctAnswer" ze wskazaniem poprawnej odpowiedzi
5. Pytania powinny być:
   - Konkretne i związane ze stanowiskiem ${position}
   - Dostosowane do poziomu ${difficulty}
   - Zróżnicowane (techniczne, behawioralne, sytuacyjne, kompetencyjne)
6. Stwórz odpowiedni tytuł testu

WAŻNE: Zwróć odpowiedź WYŁĄCZNIE w formacie JSON:
{
  "title": "Tytuł testu",
  "questions": [
    {
      "question": "Treść pytania otwartego",
      "type": "text",
      "correctAnswer": "Przykładowa wzorcowa odpowiedź dla rekrutera"
    },
    {
      "question": "Treść pytania jednokrotnego wyboru",
      "type": "choice",
      "options": ["Opcja A", "Opcja B", "Opcja C", "Opcja D"],
      "correctAnswer": "Opcja A"
    },
    {
      "question": "Treść pytania wielokrotnego wyboru",
      "type": "multiple",
      "options": ["Opcja 1", "Opcja 2", "Opcja 3", "Opcja 4", "Opcja 5"],
      "correctAnswer": ["Opcja 1", "Opcja 3"]
    }
  ]
}
`;
}

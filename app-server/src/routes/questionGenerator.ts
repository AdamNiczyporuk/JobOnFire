import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureCandidate } from '../auth/ensureCandidate';
import { prisma } from '../db';

export const router = Router();

interface QuestionGeneratorRequest {
  mode: 'application' | 'custom';
  // For application mode
  applicationId?: number;
  // For custom mode
  position?: string;
  jobLevel?: string;
  jobDescription?: string;
  requirements?: string;
  responsibilities?: string;
  count?: number;
}

interface GeneratedQuestions {
  questions: string[];
}

/**
 * POST /question-generator - Generate interview questions using AI
 * Requires authentication and candidate profile
 * 
 * Two modes:
 * 1. application mode - generates questions based on user's application
 * 2. custom mode - generates questions based on provided job parameters
 */
router.post('/', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const data: QuestionGeneratorRequest = req.body;

    // Validate mode
    if (!data.mode || !['application', 'custom'].includes(data.mode)) {
      res.status(400).json({ 
        message: 'Nieprawidłowy tryb. Dostępne tryby: "application" lub "custom"' 
      });
      return;
    }

    let prompt: string;
    const userId = req.user?.id;

    if (data.mode === 'application') {
      // Application mode - get data from user's application
      if (!data.applicationId) {
        res.status(400).json({ 
          message: 'Brakuje ID aplikacji dla trybu "application"' 
        });
        return;
      }

      // First, get candidate profile ID from user ID
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId: userId }
      });

      if (!candidateProfile) {
        res.status(404).json({ 
          message: 'Nie znaleziono profilu kandydata' 
        });
        return;
      }

      // Fetch application with job offer details
      const application = await prisma.applicationForJobOffer.findFirst({
        where: {
          id: data.applicationId,
          candidateProfileId: candidateProfile.id,
        },
        include: {
          jobOffer: {
            include: {
              employerProfile: {
                select: {
                  companyName: true,
                }
              }
            }
          }
        }
      });

      if (!application) {
        res.status(404).json({ 
          message: 'Nie znaleziono aplikacji lub nie masz do niej dostępu' 
        });
        return;
      }

      const jobOffer = application.jobOffer;
      prompt = buildQuestionsPromptFromApplication(
        jobOffer.name,
        jobOffer.jobLevel ? JSON.stringify(jobOffer.jobLevel) : null,
        jobOffer.description,
        jobOffer.requirements,
        jobOffer.responsibilities,
        jobOffer.whatWeOffer,
        jobOffer.employerProfile?.companyName,
        data.count || 10
      );

    } else {
      // Custom mode - use provided parameters
      if (!data.position) {
        res.status(400).json({ 
          message: 'Brakuje nazwy stanowiska dla trybu "custom"' 
        });
        return;
      }

      prompt = buildQuestionsPromptFromCustom(
        data.position,
        data.jobLevel,
        data.jobDescription,
        data.requirements,
        data.responsibilities,
        data.count || 10
      );
    }

    // Call AI service
    const generatedQuestions = await generateQuestionsWithAI(prompt);

    res.status(200).json({
      message: 'Pytania wygenerowane pomyślnie',
      questions: generatedQuestions.questions,
      count: generatedQuestions.questions.length
    });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      message: 'Błąd podczas generowania pytań',
      error: error.message 
    });
  }
});

/**
 * Build prompt for AI based on application data
 */
function buildQuestionsPromptFromApplication(
  jobName: string,
  jobLevel?: string | null,
  description?: string | null,
  requirements?: any,
  responsibilities?: any,
  whatWeOffer?: any,
  companyName?: string | null,
  count: number = 10
): string {
  // Parse JSON fields if they exist
  const reqList = requirements ? (Array.isArray(requirements) ? requirements : JSON.parse(requirements)) : [];
  const respList = responsibilities ? (Array.isArray(responsibilities) ? responsibilities : JSON.parse(responsibilities)) : [];
  const offerList = whatWeOffer ? (Array.isArray(whatWeOffer) ? whatWeOffer : JSON.parse(whatWeOffer)) : [];

  const requirementsText = Array.isArray(reqList) && reqList.length > 0 
    ? reqList.map((r: any) => `- ${typeof r === 'string' ? r : r.text || r.requirement || JSON.stringify(r)}`).join('\n')
    : 'Brak szczegółowych wymagań';

  const responsibilitiesText = Array.isArray(respList) && respList.length > 0
    ? respList.map((r: any) => `- ${typeof r === 'string' ? r : r.text || r.responsibility || JSON.stringify(r)}`).join('\n')
    : 'Brak szczegółowych obowiązków';

  const offerText = Array.isArray(offerList) && offerList.length > 0
    ? offerList.map((o: any) => `- ${typeof o === 'string' ? o : o.text || o.offer || JSON.stringify(o)}`).join('\n')
    : 'Brak szczegółów';

  return `
Jesteś ekspertem HR specjalizującym się w rekrutacji IT. Twoim zadaniem jest wygenerowanie ${count} profesjonalnych pytań rekrutacyjnych na rozmowę kwalifikacyjną.

KONTEKST OFERTY PRACY:
- Stanowisko: ${jobName}
- Poziom: ${jobLevel || 'Nie określono'}
- Firma: ${companyName || 'Nie określono'}
- Opis stanowiska: ${description || 'Brak opisu'}

WYMAGANIA:
${requirementsText}

OBOWIĄZKI:
${responsibilitiesText}

CO OFERUJEMY:
${offerText}

ZASADY GENEROWANIA PYTAŃ:
1. Wygeneruj dokładnie ${count} pytań rekrutacyjnych w języku polskim
2. Pytania powinny być zróżnicowane:
   - 30% pytań behawioralnych (np. "Opisz sytuację, w której...")
   - 40% pytań technicznych dopasowanych do wymagań stanowiska
   - 20% pytań dotyczących doświadczenia i projektów
   - 10% pytań dotyczących motywacji i dopasowania kulturowego
3. Pytania powinny być konkretne i nawiązywać do wymagań i obowiązków z opisu stanowiska
4. Unikaj pytań zbyt ogólnych lub standardowych
5. Pytania powinny być odpowiednie do poziomu stanowiska (${jobLevel || 'nie określono'})

WAŻNE: Zwróć odpowiedź WYŁĄCZNIE w formacie JSON, bez żadnych dodatkowych znaczników markdown:
{
  "questions": [
    "Pytanie 1",
    "Pytanie 2",
    ...
  ]
}
`;
}

/**
 * Build prompt for AI based on custom parameters
 */
function buildQuestionsPromptFromCustom(
  position: string,
  jobLevel?: string,
  description?: string,
  requirements?: string,
  responsibilities?: string,
  count: number = 10
): string {
  return `
Jesteś ekspertem HR specjalizującym się w rekrutacji IT. Twoim zadaniem jest wygenerowanie ${count} profesjonalnych pytań rekrutacyjnych na rozmowę kwalifikacyjną.

KONTEKST STANOWISKA:
- Stanowisko: ${position}
- Poziom: ${jobLevel || 'Nie określono'}
- Opis: ${description || 'Brak szczegółowego opisu'}
- Wymagania: ${requirements || 'Brak szczegółowych wymagań'}
- Obowiązki: ${responsibilities || 'Brak szczegółowych obowiązków'}

ZASADY GENEROWANIA PYTAŃ:
1. Wygeneruj dokładnie ${count} pytań rekrutacyjnych w języku polskim
2. Pytania powinny być zróżnicowane:
   - 30% pytań behawioralnych (np. "Opisz sytuację, w której...")
   - 40% pytań technicznych dopasowanych do stanowiska
   - 20% pytań dotyczących doświadczenia i projektów
   - 10% pytań dotyczących motywacji i współpracy w zespole
3. Pytania powinny być konkretne i nawiązywać do stanowiska ${position}
4. Dostosuj poziom trudności pytań do poziomu: ${jobLevel || 'uniwersalny'}
5. Jeśli brakuje szczegółów, wygeneruj uniwersalne pytania dla stanowiska ${position}

WAŻNE: Zwróć odpowiedź WYŁĄCZNIE w formacie JSON, bez żadnych dodatkowych znaczników markdown:
{
  "questions": [
    "Pytanie 1",
    "Pytanie 2",
    ...
  ]
}
`;
}

/**
 * Call AI service to generate interview questions
 */
async function generateQuestionsWithAI(prompt: string): Promise<GeneratedQuestions> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key not configured. Set OPENAI_API_KEY in environment variables.');
  }

  // Dynamically import ESM-only OpenAI SDK under CommonJS
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'Jesteś ekspertem HR specjalizującym się w rekrutacji IT. Zawsze odpowiadasz wyłącznie w formacie JSON, bez żadnych dodatkowych znaczników markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // Wyższa temperatura dla bardziej kreatywnych pytań
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const outputText = response.choices[0]?.message?.content;
    if (!outputText) {
      throw new Error('No response from AI service');
    }

    // Parse JSON response
    const parsed = JSON.parse(outputText);
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format from AI');
    }

    return {
      questions: parsed.questions
    };

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('Przekroczono limit API OpenAI. Skontaktuj się z administratorem.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Nieprawidłowy klucz API OpenAI.');
    }
    
    throw new Error(`Błąd API OpenAI: ${error.message}`);
  }
}

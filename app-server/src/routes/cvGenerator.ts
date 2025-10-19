import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureCandidate } from '../auth/ensureCandidate';
import { prisma } from '../db';

export const router = Router();

interface CVGeneratorRequest {
  fullName: string;
  position: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
  email?: string;
  phoneNumber?: string;
  place?: string;
  profileLinks?: Array<{ name: string; url: string }>;
  jobOffer?: {
    jobName?: string;
    jobLevel?: string;
    jobDescription?: string;
    salary?: string;
    requirements?: string;
    responsibilities?: string;
    whatWeOffer?: string;
    companyName?: string;
  };
}

interface GeneratedCV {
  fullName?: string;
  position?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{
    position?: string;
    company?: string;
    period?: string;
    description?: string | string[];
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    field?: string;
    period?: string;
  }>;
  contacts?: {
    email?: string;
    phone?: string;
    location?: string;
    socials?: Array<{ label?: string; url?: string }> | string[];
  };
  interests?: string[];
}

/**
 * POST /cv-generator - Generate CV using AI
 * Requires authentication and candidate profile
 */
router.post('/', ensureAuthenticated, ensureCandidate, async (req: Request, res: Response): Promise<void> => {
  try {
    const cvData: CVGeneratorRequest = req.body;

    // Validate required fields
    if (!cvData.fullName || !cvData.position) {
      res.status(400).json({ 
        message: 'Brakuje wymaganych danych: imię/nazwisko i stanowisko' 
      });
      return;
    }

    // Pobierz dane użytkownika i profilu z bazy danych
    const userId = req.user?.id;
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { 
            candidateProfile: {
              include: {
                profileLinks: true
              }
            }
          }
        });

        if (user) {
          // Jeśli brak email w request, użyj z bazy
          if (!cvData.email && user.email) {
            cvData.email = user.email;
          }
          
          // Jeśli brak telefonu w request, użyj z profilu
          if (!cvData.phoneNumber && user.candidateProfile?.phoneNumber) {
            cvData.phoneNumber = user.candidateProfile.phoneNumber.toString();
          }

          // Jeśli brak miejsca w request, użyj z profilu
          if (!cvData.place && user.candidateProfile?.place) {
            cvData.place = user.candidateProfile.place;
          }

          // Pobierz linki do profili społecznościowych
          if (!cvData.profileLinks && user.candidateProfile?.profileLinks) {
            cvData.profileLinks = user.candidateProfile.profileLinks.map(link => ({
              name: link.name,
              url: link.url
            }));
          }
        }
      } catch (dbError) {
        console.warn('Could not fetch user data from database:', dbError);
        // Kontynuuj mimo błędu - dane kontaktowe są opcjonalne
      }
    }

    // Build prompt for AI
    const prompt = buildCVPrompt(cvData);

    // Call AI service (will be implemented with actual AI provider)
    const generatedCV = await generateCVWithAI(prompt);

    res.status(200).json({
      message: 'CV wygenerowane pomyślnie',
      cv: generatedCV
    });
  } catch (error: any) {
    console.error('Error generating CV:', error);
    res.status(500).json({ 
      message: 'Błąd podczas generowania CV',
      error: error.message 
    });
  }
});

/**
 * Build prompt for AI to generate CV
 */
function buildCVPrompt(cvData: CVGeneratorRequest): string {
  const offer = cvData.jobOffer || {};
  const offerBlock = `
JOB OFFER CONTEXT (use to tailor the CV to this specific role):
- Company: ${offer.companyName || 'N/A'}
- Title: ${offer.jobName || 'N/A'}
- Level: ${offer.jobLevel || 'N/A'}
- Salary: ${offer.salary || 'N/A'}
- Description:\n${offer.jobDescription || 'N/A'}
- Requirements (bullets or lines):\n${offer.requirements || 'N/A'}
- Responsibilities (bullets or lines):\n${offer.responsibilities || 'N/A'}
- What we offer:\n${offer.whatWeOffer || 'N/A'}
`;

  const socialLinksBlock = cvData.profileLinks && cvData.profileLinks.length > 0
    ? `- Social Media Links:\n${cvData.profileLinks.map(link => `  * ${link.name}: ${link.url}`).join('\n')}`
    : '- Social Media Links: None provided';

  return `
Generate a professional, job-tailored, and slightly more detailed CV in JSON format using the candidate data below and the job offer context. Write ALL content in Polish (pl-PL).

CANDIDATE INPUT:
- Full Name: ${cvData.fullName}
- Target Position: ${cvData.position}
- Email: ${cvData.email || 'N/A'}
- Phone: ${cvData.phoneNumber || 'N/A'}
- Location: ${cvData.place || 'N/A'}
${socialLinksBlock}
- Summary:\n${cvData.summary || 'N/A'}
- Skills (comma-separated):\n${cvData.skills || 'N/A'}
- Experience (free text):\n${cvData.experience || 'N/A'}
- Education (free text):\n${cvData.education || 'N/A'}
${offerBlock}

Tailoring and generation rules (language: Polish):
- Select and emphasize ONLY those skills and experiences that are relevant to the job offer requirements and responsibilities.
- Reorder and rewrite the professional summary to highlight the candidate's fit for this specific role and company. Make the summary 4–6 sentences.
- For each experience item, provide 3–5 concise, achievement-oriented bullet points aligned with the offer's keywords; you may include them as an array in the description field.
- Use the provided email, phone, and location if available. If email is missing, generate a professional one based on the name. If phone is missing, use a Polish format placeholder (+48 XXX XXX XXX).
- IMPORTANT: Use ONLY the provided social media links. DO NOT invent or generate fake LinkedIn, GitHub, or other social media URLs. If no links are provided, leave the socials array empty or omit it.
- You may invent plausible INTERESTS only (5–7 professional interests). Do NOT invent employers, dates, degrees, or social media links.
- Add a few relevant skills even if not listed by the candidate, if they fit the job offer.
- Ensure sections present in the JSON: contacts, summary, skills, experience, education, interests.

Return ONLY valid JSON with the following structure (no markdown, no extra text):
{
  "fullName": "string",
  "position": "string",
  "contacts": {
    "email": "string",
    "phone": "string",
    "location": "string",
    "socials": [ { "label": "string", "url": "string" } ] // Use ONLY provided links, or leave empty
  },
  "summary": "string (tailored professional summary, 4–6 sentences)",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "position": "string",
      "company": "string",
      "period": "string",
      "description": "string OR string[] (3–5 relevant bullet points)"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "field": "string",
      "period": "string"
    }
  ],
  "interests": ["interest1", "interest2", "interest3", "interest4", "interest5"]
}
`;
}

/**
 * Call AI service to generate CV
 */
async function generateCVWithAI(prompt: string): Promise<GeneratedCV> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key not configured. Set OPENAI_API_KEY in environment variables.');
  }

  // Dynamically import ESM-only OpenAI SDK under CommonJS
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    // Użyj poprawnego API - chat.completions.create
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional CV generator. You always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' } // Wymusza odpowiedź w JSON
    });

    const outputText = response.choices[0]?.message?.content;
    if (!outputText) {
      throw new Error('No content received from OpenAI API');
    }

    // Parse the JSON response from AI
    let parsedCV: GeneratedCV;
    try {
      parsedCV = JSON.parse(outputText);
    } catch (parseError) {
      // Spróbuj wyciągnąć JSON z odpowiedzi
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedCV = JSON.parse(jsonMatch[0]);
      } else {
        console.error('Failed to parse AI response:', outputText);
        throw new Error('Invalid JSON response from AI');
      }
    }

    return parsedCV;
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`Failed to generate CV: ${error.message}`);
  }
}

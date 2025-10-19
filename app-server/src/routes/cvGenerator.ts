import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../auth/auth_middleware';
import { ensureCandidate } from '../auth/ensureCandidate';

export const router = Router();

interface CVGeneratorRequest {
  fullName: string;
  position: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
}

interface GeneratedCV {
  content: string;
  title?: string;
  formatting?: any;
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
  return `
Generate a professional CV in JSON format based on the following information:

Full Name: ${cvData.fullName}
Position: ${cvData.position}
Summary: ${cvData.summary || 'N/A'}
Skills: ${cvData.skills || 'N/A'}
Experience: ${cvData.experience || 'N/A'}
Education: ${cvData.education || 'N/A'}

Return ONLY valid JSON with the following structure (no markdown, no extra text):
{
  "fullName": "string",
  "position": "string",
  "summary": "string (professional summary)",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "position": "string",
      "company": "string",
      "period": "string",
      "description": "string"
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
  "contact": {
    "email": "string (if available)",
    "phone": "string (if available)"
  }
}

Make the CV professional, well-formatted, and suitable for job applications. Improve the grammar and structure where needed.
`;
}

/**
 * Call AI service to generate CV
 * TODO: Implement with actual AI provider (OpenAI, Anthropic, etc.)
 */
async function generateCVWithAI(prompt: string): Promise<GeneratedCV> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key not configured. Set OPENAI_API_KEY in environment variables.');
  }

  // Dynamically import ESM-only OpenAI SDK under CommonJS
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-5';

  try {
    const response = await client.responses.create({
      model,
      input: prompt,
      temperature: 0.7,
      max_output_tokens: 2000
    });

    const outputText: string | undefined = (response as any).output_text;
    if (!outputText) {
      throw new Error('No content received from OpenAI responses API');
    }

    // Parse the JSON response from AI
    let parsedCV: GeneratedCV;
    try {
      parsedCV = JSON.parse(outputText);
    } catch (parseError) {
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedCV = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    return parsedCV;
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`Failed to generate CV: ${error.message}`);
  }
}

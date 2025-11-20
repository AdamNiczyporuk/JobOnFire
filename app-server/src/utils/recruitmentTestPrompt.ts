export function buildTestPrompt(
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
  } as const;

  const langInstruction = language === 'pl' ? 'w języku polskim' : 'in English';

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

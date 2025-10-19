import Joi from 'joi';

// Walidacja dla doświadczenia zawodowego
const experienceSchema = Joi.object({
  company: Joi.string().required().messages({
    'string.empty': 'Nazwa firmy jest wymagana',
    'any.required': 'Nazwa firmy jest wymagana'
  }),
  position: Joi.string().required().messages({
    'string.empty': 'Stanowisko jest wymagane',
    'any.required': 'Stanowisko jest wymagane'
  }),
  startDate: Joi.string().required().messages({
    'string.empty': 'Data rozpoczęcia jest wymagana',
    'any.required': 'Data rozpoczęcia jest wymagana'
  }),
  endDate: Joi.string().allow('', null).messages({
    'string.base': 'Data zakończenia musi być tekstem'
  }),
  isCurrent: Joi.boolean().default(false),
  description: Joi.string().allow('', null).messages({
    'string.base': 'Opis musi być tekstem'
  }),
  location: Joi.string().allow('', null).messages({
    'string.base': 'Lokalizacja musi być tekstem'
  })
});

// Walidacja dla umiejętności
const skillSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nazwa umiejętności jest wymagana',
    'any.required': 'Nazwa umiejętności jest wymagana'
  }),
  level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').required().messages({
    'any.only': 'Poziom musi być jednym z: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
    'any.required': 'Poziom umiejętności jest wymagany'
  })
});

// Walidacja dla wykształcenia
const educationSchema = Joi.object({
  institution: Joi.string().required().messages({
    'string.empty': 'Nazwa instytucji jest wymagana',
    'any.required': 'Nazwa instytucji jest wymagana'
  }),
  degree: Joi.string().required().messages({
    'string.empty': 'Stopień/kierunek jest wymagany',
    'any.required': 'Stopień/kierunek jest wymagany'
  }),
  fieldOfStudy: Joi.string().allow('', null).messages({
    'string.base': 'Kierunek studiów musi być tekstem'
  }),
  startDate: Joi.string().required().messages({
    'string.empty': 'Data rozpoczęcia jest wymagana',
    'any.required': 'Data rozpoczęcia jest wymagana'
  }),
  endDate: Joi.string().allow('', null).messages({
    'string.base': 'Data zakończenia musi być tekstem'
  }),
  isCurrent: Joi.boolean().default(false),
  description: Joi.string().allow('', null).messages({
    'string.base': 'Opis musi być tekstem'
  }),
  location: Joi.string().allow('', null).messages({
    'string.base': 'Lokalizacja musi być tekstem'
  })
});

// Walidacja dla profilu kandydata
export const candidateProfileValidation = Joi.object({
  name: Joi.string().min(2).max(50).allow('', null).messages({
    'string.min': 'Imię musi mieć co najmniej 2 znaki',
    'string.max': 'Imię może mieć maksymalnie 50 znaków'
  }),
  lastName: Joi.string().min(2).max(50).allow('', null).messages({
    'string.min': 'Nazwisko musi mieć co najmniej 2 znaki',
    'string.max': 'Nazwisko może mieć maksymalnie 50 znaków'
  }),
  description: Joi.string().max(2000).allow('', null).messages({
    'string.max': 'Opis może mieć maksymalnie 2000 znaków'
  }),
  birthday: Joi.date().iso().allow(null).messages({
    'date.format': 'Data urodzenia musi być w formacie ISO (YYYY-MM-DD)'
  }),
  experience: Joi.array().items(experienceSchema).allow(null).messages({
    'array.base': 'Doświadczenie musi być tablicą'
  }),
  phoneNumber: Joi.number().integer().min(100000000).max(999999999).allow(null).messages({
    'number.base': 'Numer telefonu musi być liczbą',
    'number.integer': 'Numer telefonu musi być liczbą całkowitą',
    'number.min': 'Numer telefonu musi mieć co najmniej 9 cyfr',
    'number.max': 'Numer telefonu może mieć maksymalnie 9 cyfr'
  }),
  skills: Joi.array().items(skillSchema).allow(null).messages({
    'array.base': 'Umiejętności muszą być tablicą'
  }),
  place: Joi.string().max(100).allow('', null).messages({
    'string.max': 'Miejsce może mieć maksymalnie 100 znaków'
  }),
  education: Joi.array().items(educationSchema).allow(null).messages({
    'array.base': 'Wykształcenie musi być tablicą'
  }),
  profileLinks: Joi.array().items(
    Joi.object({
      id: Joi.number().optional(),
      name: Joi.string().required().messages({
        'string.empty': 'Nazwa linku jest wymagana',
      }),
      url: Joi.string().uri().required().messages({
        'string.uri': 'URL musi być poprawnym adresem',
        'string.empty': 'URL jest wymagany'
      })
    })
  ).allow(null).messages({
    'array.base': 'Linki muszą być tablicą'
  })
});

// Walidacja dla aktualizacji profilu kandydata (wszystkie pola opcjonalne)
export const candidateProfileUpdateValidation = candidateProfileValidation.fork(
  ['name', 'lastName', 'description', 'birthday', 'experience', 'phoneNumber', 'skills', 'place', 'education', 'profileLinks'],
  (schema) => schema.optional()
);

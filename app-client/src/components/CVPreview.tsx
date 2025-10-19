"use client";
import React from "react";

type ExperienceItem = {
  position?: string;
  company?: string;
  period?: string;
  description?: string | string[];
};

type EducationItem = {
  degree?: string;
  institution?: string;
  field?: string;
  period?: string;
};

type ContactsData = {
  email?: string;
  phone?: string;
  location?: string;
  socials?: Array<{ label?: string; url?: string }>;
};

type CVData = {
  fullName?: string;
  position?: string;
  summary?: string;
  skills?: string[] | string;
  experience?: Array<ExperienceItem> | string;
  education?: Array<EducationItem> | string;
  contacts?: ContactsData;
  interests?: string[];
};

function normalizeSkills(skills: CVData["skills"]): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((s) => String(s)).filter(Boolean);
  // comma separated string
  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeExperience(exp: CVData["experience"]): ExperienceItem[] {
  if (!exp) return [];
  if (Array.isArray(exp)) return exp as ExperienceItem[];
  // free text -> single block
  return [
    {
      position: undefined,
      company: undefined,
      period: undefined,
      description: String(exp),
    },
  ];
}

function normalizeEducation(ed: CVData["education"]): EducationItem[] {
  if (!ed) return [];
  if (Array.isArray(ed)) return ed as EducationItem[];
  // free text -> single block
  return [
    {
      degree: undefined,
      institution: undefined,
      field: undefined,
      period: undefined,
    },
  ];
}

function renderDescription(desc: string | string[] | undefined): React.ReactNode {
  if (!desc) return null;
  if (Array.isArray(desc)) {
    return (
      <ul className="list-disc list-inside text-sm leading-snug mt-0.5 space-y-0 print:text-xs print:leading-tight print:mt-0.5 print:space-y-0">
        {desc.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm whitespace-pre-line leading-snug mt-0.5 print:text-xs print:leading-tight print:mt-0.5">{desc}</p>;
}

export default function CVPreview({ cv }: { cv: CVData }) {
  const fullName = cv.fullName || "Imię i nazwisko";
  const position = cv.position || "Stanowisko";
  const summary = cv.summary || "";
  const skills = normalizeSkills(cv.skills);
  const experience = normalizeExperience(cv.experience);
  const education = normalizeEducation(cv.education);
  const contacts = cv.contacts;
  const interests = cv.interests || [];

  return (
    <div id="cv-print" className="mx-auto max-w-3xl bg-white text-gray-900 p-6 md:p-8 rounded-xl shadow print:shadow-none print:p-6 print:rounded-none print:text-sm" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
      {/* Header */}
      <header className="border-b pb-2 mb-3 print:pb-2 print:mb-2.5" style={{ borderColor: '#e5e7eb' }}>
        <h1 className="text-2xl md:text-3xl font-bold print:text-xl">{fullName}</h1>
        <p className="text-gray-600 mt-0.5 text-sm print:text-xs print:mt-0.5" style={{ color: '#4b5563' }}>{position}</p>
        
        {/* Contact Information */}
        {contacts && (
          <div className="mt-1.5 text-sm text-gray-600 space-y-0 print:text-xs print:mt-1" style={{ color: '#4b5563' }}>
            {contacts.email && (
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a href={`mailto:${contacts.email}`} className="text-blue-600 hover:underline" style={{ color: '#2563eb' }}>
                  {contacts.email}
                </a>
              </p>
            )}
            {contacts.phone && (
              <p>
                <span className="font-medium">Telefon:</span> {contacts.phone}
              </p>
            )}
            {contacts.location && (
              <p>
                <span className="font-medium">Lokalizacja:</span> {contacts.location}
              </p>
            )}
            {contacts.socials && contacts.socials.length > 0 && (
              <div className="mt-0.5">
                <span className="font-medium">Dodatkowe linki:</span>
                <div className="flex flex-wrap gap-1.5 mt-0.5 print:gap-1">
                  {contacts.socials.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs break-all print:text-[10px]"
                      style={{ color: '#2563eb' }}
                    >
                      {social.url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-3 print:mb-2.5">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-1 print:text-xs print:mb-0.5" style={{ color: '#374151' }}>Podsumowanie</h2>
          <p className="leading-snug whitespace-pre-line text-sm print:text-xs print:leading-tight">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-3 print:mb-2.5">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-1 print:text-xs print:mb-0.5" style={{ color: '#374151' }}>Umiejętności</h2>
          <div className="flex flex-wrap gap-1.5 print:gap-1">
            {skills.map((s, i) => (
              <span key={`${s}-${i}`} className="chip">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-3 print:mb-2.5">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-1 print:text-xs print:mb-0.5" style={{ color: '#374151' }}>Doświadczenie</h2>
          <div className="space-y-2 print:space-y-1.5">
            {experience.map((item, idx) => (
              <div key={idx} className="">
                {(item.position || item.company) && (
                  <p className="font-medium text-sm print:text-xs">
                    {item.position}
                    {item.company ? <span className="text-gray-500" style={{ color: '#6b7280' }}> @ {item.company}</span> : null}
                  </p>
                )}
                {item.period && <p className="text-xs text-gray-500 print:text-[10px]" style={{ color: '#6b7280' }}>{item.period}</p>}
                {renderDescription(item.description)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-3 print:mb-2.5">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-1 print:text-xs print:mb-0.5" style={{ color: '#374151' }}>Wykształcenie</h2>
          <div className="space-y-1.5 print:space-y-1">
            {education.map((item, idx) => (
              <div key={idx}>
                {(item.degree || item.institution) && (
                  <p className="font-medium text-sm print:text-xs">
                    {item.degree}
                    {item.institution ? <span className="text-gray-500" style={{ color: '#6b7280' }}> — {item.institution}</span> : null}
                  </p>
                )}
                {(item.field || item.period) && (
                  <p className="text-xs text-gray-500 print:text-[10px]" style={{ color: '#6b7280' }}>
                    {item.field}
                    {item.period ? (item.field ? ` • ${item.period}` : item.period) : null}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-1 print:text-xs print:mb-0.5" style={{ color: '#374151' }}>Zainteresowania</h2>
          <div className="flex flex-wrap gap-1.5 print:gap-1">
            {interests.map((interest, i) => (
              <span key={`${interest}-${i}`} className="chip">
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

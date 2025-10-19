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
      <ul className="list-disc list-inside text-sm leading-relaxed mt-1 space-y-1">
        {desc.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm whitespace-pre-line leading-relaxed mt-1">{desc}</p>;
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
    <div id="cv-print" className="mx-auto max-w-3xl bg-white text-gray-900 p-6 md:p-10 rounded-xl shadow print:shadow-none print:p-0">
      {/* Header */}
      <header className="border-b pb-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
        <p className="text-gray-600 mt-1">{position}</p>
        
        {/* Contact Information */}
        {contacts && (
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            {contacts.email && (
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a href={`mailto:${contacts.email}`} className="text-blue-600 hover:underline">
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
              <div className="flex flex-wrap gap-3 mt-2">
                {contacts.socials.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    {social.label || social.url}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-2">Podsumowanie</h2>
          <p className="leading-relaxed whitespace-pre-line">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-2">Umiejętności</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={`${s}-${i}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-2">Doświadczenie</h2>
          <div className="space-y-4">
            {experience.map((item, idx) => (
              <div key={idx} className="">
                {(item.position || item.company) && (
                  <p className="font-medium">
                    {item.position}
                    {item.company ? <span className="text-gray-500"> @ {item.company}</span> : null}
                  </p>
                )}
                {item.period && <p className="text-xs text-gray-500">{item.period}</p>}
                {renderDescription(item.description)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-2">Wykształcenie</h2>
          <div className="space-y-3">
            {education.map((item, idx) => (
              <div key={idx}>
                {(item.degree || item.institution) && (
                  <p className="font-medium">
                    {item.degree}
                    {item.institution ? <span className="text-gray-500"> — {item.institution}</span> : null}
                  </p>
                )}
                {(item.field || item.period) && (
                  <p className="text-xs text-gray-500">
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
          <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-2">Zainteresowania</h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, i) => (
              <span key={`${interest}-${i}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

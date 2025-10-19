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
      <ul style={{
        listStyleType: 'disc',
        listStylePosition: 'inside',
        marginTop: '3px',
        marginBottom: '0'
      }}>
        {desc.map((item, i) => (
          <li key={i} style={{
            fontSize: '9px',
            lineHeight: '1.5',
            marginBottom: '2px'
          }}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p style={{
    fontSize: '9px',
    whiteSpace: 'pre-line',
    lineHeight: '1.5',
    marginTop: '2px',
    marginBottom: '0'
  }}>{desc}</p>;
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
    <div 
      id="cv-print" 
      className="mx-auto max-w-3xl bg-white text-gray-900 rounded-xl shadow print:shadow-none print:rounded-none" 
      style={{ 
        backgroundColor: '#ffffff', 
        color: '#111827',
        padding: '40px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <header className="border-b" style={{ 
        borderColor: '#e5e7eb',
        paddingBottom: '10px',
        marginBottom: '12px'
      }}>
        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: 700,
          marginBottom: '4px',
          color: '#111827'
        }}>{fullName}</h1>
        <p style={{ 
          marginTop: '3px',
          fontSize: '13px',
          color: '#4b5563',
          marginBottom: '8px'
        }}>{position}</p>
        
        {/* Contact Information */}
        {contacts && (
          <div style={{ marginTop: '4px' }}>
            {contacts.email && (
              <p style={{ 
                fontSize: '9px',
                color: '#4b5563',
                marginBottom: '2px',
                lineHeight: '1.4'
              }}>
                <span style={{ fontWeight: 700 }}>Email:</span>{" "}
                <a href={`mailto:${contacts.email}`} className="hover:underline" style={{ color: '#4b5563' }}>
                  {contacts.email}
                </a>
              </p>
            )}
            {contacts.phone && (
              <p style={{ 
                fontSize: '9px',
                color: '#4b5563',
                marginBottom: '2px',
                lineHeight: '1.4'
              }}>
                <span style={{ fontWeight: 700 }}>Telefon:</span> {contacts.phone}
              </p>
            )}
            {contacts.location && (
              <p style={{ 
                fontSize: '9px',
                color: '#4b5563',
                marginBottom: '2px',
                lineHeight: '1.4'
              }}>
                <span style={{ fontWeight: 700 }}>Lokalizacja:</span> {contacts.location}
              </p>
            )}
            {contacts.socials && contacts.socials.length > 0 && (
              <div style={{ marginTop: '2px' }}>
                <span style={{ fontWeight: 700, fontSize: '9px', color: '#4b5563' }}>Dodatkowe linki:</span>
                <div style={{ marginTop: '2px' }}>
                  {contacts.socials.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ 
                        color: '#4b5563',
                        fontSize: '9px',
                        display: 'block',
                        marginBottom: '2px',
                        lineHeight: '1.4'
                      }}
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
        <section style={{ marginBottom: '12px' }}>
          <h2 style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#374151',
            textTransform: 'uppercase',
            marginBottom: '5px',
            letterSpacing: '0.5px'
          }}>Podsumowanie</h2>
          <p style={{
            fontSize: '10px',
            lineHeight: '1.5',
            color: '#111827',
            whiteSpace: 'pre-line'
          }}>{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section style={{ marginBottom: '12px' }}>
          <h2 style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#374151',
            textTransform: 'uppercase',
            marginBottom: '5px',
            letterSpacing: '0.5px'
          }}>Umiejętności</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {skills.map((s, i) => (
              <span key={`${s}-${i}`} style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                paddingLeft: '10px',
                paddingRight: '10px',
                paddingTop: '5px',
                paddingBottom: '5px',
                fontSize: '9px',
                color: '#111827',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={{ marginBottom: '12px' }}>
          <h2 style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#374151',
            textTransform: 'uppercase',
            marginBottom: '5px',
            letterSpacing: '0.5px'
          }}>Doświadczenie</h2>
          <div>
            {experience.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                {(item.position || item.company) && (
                  <p style={{
                    fontWeight: 700,
                    fontSize: '10px',
                    marginBottom: '2px',
                    color: '#111827',
                    lineHeight: '1.4'
                  }}>
                    {item.position}
                    {item.company ? <span style={{ color: '#6b7280', fontWeight: 400 }}> @ {item.company}</span> : null}
                  </p>
                )}
                {item.period && (
                  <p style={{
                    fontSize: '9px',
                    color: '#6b7280',
                    marginBottom: '3px',
                    marginTop: '1px',
                    lineHeight: '1.4'
                  }}>{item.period}</p>
                )}
                {renderDescription(item.description)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section style={{ marginBottom: '12px' }}>
          <h2 style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#374151',
            textTransform: 'uppercase',
            marginBottom: '5px',
            letterSpacing: '0.5px'
          }}>Wykształcenie</h2>
          <div>
            {education.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '6px' }}>
                {(item.degree || item.institution) && (
                  <p style={{
                    fontWeight: 700,
                    fontSize: '10px',
                    marginBottom: '2px',
                    color: '#111827',
                    lineHeight: '1.4'
                  }}>
                    {item.degree}
                    {item.institution ? <span style={{ color: '#6b7280', fontWeight: 400 }}> — {item.institution}</span> : null}
                  </p>
                )}
                {(item.field || item.period) && (
                  <p style={{
                    fontSize: '9px',
                    color: '#6b7280',
                    marginTop: '1px',
                    lineHeight: '1.4'
                  }}>
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
          <h2 style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#374151',
            textTransform: 'uppercase',
            marginBottom: '5px',
            letterSpacing: '0.5px'
          }}>Zainteresowania</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {interests.map((interest, i) => (
              <span key={`${interest}-${i}`} style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                paddingLeft: '10px',
                paddingRight: '10px',
                paddingTop: '5px',
                paddingBottom: '5px',
                fontSize: '9px',
                color: '#111827',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

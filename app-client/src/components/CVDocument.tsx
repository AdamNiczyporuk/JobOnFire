import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Rejestracja czcionek z obsługą polskich znaków
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Typy
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

// Style dla PDF
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Roboto',
    fontSize: 10,
    fontWeight: 400,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
    color: '#111827',
  },
  jobTitle: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 8,
    marginTop: 3,
    fontWeight: 400,
  },
  contactInfo: {
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 2,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  contactLabel: {
    fontWeight: 700,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#111827',
    fontWeight: 400,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 9,
    color: '#111827',
    fontWeight: 400,
  },
  experienceItem: {
    marginBottom: 8,
  },
  experienceHeader: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
    color: '#111827',
    lineHeight: 1.4,
  },
  experienceCompany: {
    color: '#6b7280',
    fontWeight: 400,
  },
  experiencePeriod: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
    marginTop: 1,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  experienceDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#111827',
    marginTop: 2,
    fontWeight: 400,
  },
  bulletList: {
    marginTop: 3,
  },
  bulletItem: {
    fontSize: 9,
    marginBottom: 2,
    flexDirection: 'row',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  bullet: {
    width: 10,
    marginRight: 6,
  },
  educationItem: {
    marginBottom: 6,
  },
  educationHeader: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
    color: '#111827',
    lineHeight: 1.4,
  },
  educationDetails: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 1,
    lineHeight: 1.4,
    fontWeight: 400,
  },
});

// Normalizacja danych
function normalizeSkills(skills: CVData["skills"]): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((s) => String(s)).filter(Boolean);
  return String(skills).split(",").map((s) => s.trim()).filter(Boolean);
}

function normalizeExperience(exp: CVData["experience"]): ExperienceItem[] {
  if (!exp) return [];
  if (Array.isArray(exp)) return exp as ExperienceItem[];
  return [{ position: undefined, company: undefined, period: undefined, description: String(exp) }];
}

function normalizeEducation(ed: CVData["education"]): EducationItem[] {
  if (!ed) return [];
  if (Array.isArray(ed)) return ed as EducationItem[];
  return [{ degree: undefined, institution: undefined, field: undefined, period: undefined }];
}

// Komponent PDF
export const CVDocument: React.FC<{ cv: CVData }> = ({ cv }) => {
  const fullName = cv.fullName || "Imię i nazwisko";
  const position = cv.position || "Stanowisko";
  const summary = cv.summary || "";
  const skills = normalizeSkills(cv.skills);
  const experience = normalizeExperience(cv.experience);
  const education = normalizeEducation(cv.education);
  const contacts = cv.contacts;
  const interests = cv.interests || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.jobTitle}>{position}</Text>
          
          {/* Contact Information */}
          {contacts && (
            <View style={{ marginTop: 4 }}>
              {contacts.email && (
                <Text style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email: </Text>
                  {contacts.email}
                </Text>
              )}
              {contacts.phone && (
                <Text style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Telefon: </Text>
                  {contacts.phone}
                </Text>
              )}
              {contacts.location && (
                <Text style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Lokalizacja: </Text>
                  {contacts.location}
                </Text>
              )}
              {contacts.socials && contacts.socials.length > 0 && (
                <View style={{ marginTop: 2 }}>
                  <Text style={styles.contactLabel}>Dodatkowe linki:</Text>
                  {contacts.socials.map((social, idx) => (
                    <Text key={idx} style={styles.contactInfo}>
                      {social.url}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Podsumowanie</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Umiejętności</Text>
            <View style={styles.chipContainer}>
              {skills.map((skill, i) => (
                <Text key={`skill-${i}`} style={styles.chip}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doświadczenie</Text>
            {experience.map((item, idx) => (
              <View key={idx} style={styles.experienceItem}>
                {(item.position || item.company) && (
                  <Text style={styles.experienceHeader}>
                    {item.position}
                    {item.company && (
                      <Text style={styles.experienceCompany}> @ {item.company}</Text>
                    )}
                  </Text>
                )}
                {item.period && (
                  <Text style={styles.experiencePeriod}>{item.period}</Text>
                )}
                {item.description && (
                  <View>
                    {Array.isArray(item.description) ? (
                      <View style={styles.bulletList}>
                        {item.description.map((desc, i) => (
                          <View key={i} style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.experienceDescription}>{desc}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.experienceDescription}>{item.description}</Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wykształcenie</Text>
            {education.map((item, idx) => (
              <View key={idx} style={styles.educationItem}>
                {(item.degree || item.institution) && (
                  <Text style={styles.educationHeader}>
                    {item.degree}
                    {item.institution && (
                      <Text style={styles.experienceCompany}> — {item.institution}</Text>
                    )}
                  </Text>
                )}
                {(item.field || item.period) && (
                  <Text style={styles.educationDetails}>
                    {item.field}
                    {item.period && (item.field ? ` • ${item.period}` : item.period)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zainteresowania</Text>
            <View style={styles.chipContainer}>
              {interests.map((interest, i) => (
                <Text key={`interest-${i}`} style={styles.chip}>
                  {interest}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { candidateService } from "@/services/candidateService";
import { CandidateDetailedProfile } from "@/types/candidate";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Briefcase,
  Award,
  GraduationCap,
  ExternalLink,
  FileText,
  User
} from "lucide-react";

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = parseInt(params.id as string);
  
  const [candidate, setCandidate] = useState<CandidateDetailedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (candidateId) {
      fetchCandidateDetails();
    }
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getCandidateProfile(candidateId);
      setCandidate(response);
    } catch (err) {
      setError('Nie udało się pobrać szczegółów kandydata');
      console.error('Error fetching candidate details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const formatExperience = (experience: any) => {
    if (!experience) return [];
    if (typeof experience === 'string') {
      try {
        return JSON.parse(experience);
      } catch {
        return [];
      }
    }
    return Array.isArray(experience) ? experience : [];
  };

  const formatSkills = (skills: any) => {
    if (!skills) return [];
    if (typeof skills === 'string') {
      try {
        return JSON.parse(skills);
      } catch {
        return [];
      }
    }
    return Array.isArray(skills) ? skills : [];
  };

  const formatEducation = (education: any) => {
    if (!education) return [];
    if (typeof education === 'string') {
      try {
        return JSON.parse(education);
      } catch {
        return [];
      }
    }
    return Array.isArray(education) ? education : [];
  };

  const getSkillLevelLabel = (level: string) => {
    const levels = {
      'BEGINNER': 'Początkujący',
      'INTERMEDIATE': 'Średniozaawansowany',
      'ADVANCED': 'Zaawansowany',
      'EXPERT': 'Ekspert'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'CANCELED': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'PENDING': 'Oczekująca',
      'ACCEPTED': 'Zaakceptowana',
      'REJECTED': 'Odrzucona',
      'CANCELED': 'Anulowana'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <main className="flex-1 w-full">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Ładowanie profilu kandydata...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <main className="flex-1 w-full">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchCandidateDetails}>Spróbuj ponownie</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const experienceData = formatExperience(candidate.experience);
  const skillsData = formatSkills(candidate.skills);
  const educationData = formatEducation(candidate.education);

  return (
    <div className="flex flex-col h-full items-center">
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/employer/candidates"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Powrót do listy kandydatów
            </Link>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {candidate.name && candidate.lastName
                    ? `${candidate.name} ${candidate.lastName}`
                    : candidate.name || candidate.lastName || 'Kandydat'}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  {candidate.user?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{candidate.user.email}</span>
                    </div>
                  )}
                  {candidate.phoneNumber && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{candidate.phoneNumber}</span>
                    </div>
                  )}
                  {candidate.place && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{candidate.place}</span>
                    </div>
                  )}
                  {candidate.birthday && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(candidate.birthday)}</span>
                    </div>
                  )}
                </div>
                {candidate.description && (
                  <p className="text-muted-foreground">{candidate.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Główna zawartość */}
            <div className="lg:col-span-2 space-y-8">
              {/* Doświadczenie zawodowe */}
              {experienceData.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Doświadczenie zawodowe
                  </h2>
                  <div className="space-y-4">
                    {experienceData.map((exp: any, index: number) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-primary font-medium">{exp.company}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Obecnie'}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wykształcenie */}
              {educationData.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Wykształcenie
                  </h2>
                  <div className="space-y-4">
                    {educationData.map((edu: any, index: number) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-primary font-medium">{edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                        )}
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Obecnie'}
                          {edu.location && ` • ${edu.location}`}
                        </p>
                        {edu.description && (
                          <p className="text-sm text-muted-foreground">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aplikacje */}
              {candidate.applications && candidate.applications.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Historia aplikacji</h2>
                  <div className="space-y-3">
                    {candidate.applications.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">{app.jobOffer.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {app.jobOffer.employerProfile?.companyName}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Umiejętności */}
              {skillsData.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Umiejętności
                  </h2>
                  <div className="space-y-3">
                    {skillsData.map((skill: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {getSkillLevelLabel(skill.level)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CV */}
              {candidate.candidateCVs && candidate.candidateCVs.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    CV
                  </h2>
                  <div className="space-y-2">
                    {candidate.candidateCVs.map((cv: any) => (
                      <div key={cv.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{cv.name || 'CV'}</span>
                        {cv.cvUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={cv.cvUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linki */}
              {candidate.profileLinks && candidate.profileLinks.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-lg font-semibold mb-4">Linki</h2>
                  <div className="space-y-2">
                    {candidate.profileLinks.map((link: any) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
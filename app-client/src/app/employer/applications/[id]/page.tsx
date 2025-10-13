"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getEmployerApplicationDetail, 
  respondToApplication, 
  updateApplicationStatus, 
  scheduleMeeting,
  deleteMeeting 
} from "@/services/applicationService";
import { 
  EmployerApplicationDetail, 
  ApplicationResponseRequest, 
  MeetingCreateRequest,
  ApplicationStatusUpdateRequest 
} from "@/types/application";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Video, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  UserCheck,
  Send,
  Trash2
} from "lucide-react";

export default function EmployerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = parseInt(params.id as string);
  
  const [application, setApplication] = useState<EmployerApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for forms
  const [responseText, setResponseText] = useState('');
  const [isRespondingMode, setIsRespondingMode] = useState(false);
  const [isMeetingMode, setIsMeetingMode] = useState(false);
  
  // Meeting form state
  const [meetingForm, setMeetingForm] = useState<MeetingCreateRequest>({
    dateTime: '',
    type: 'ONLINE',
    contributors: '',
    onlineMeetingUrl: '',
    message: ''
  });

  useEffect(() => {
    if (applicationId && !isNaN(applicationId)) {
      fetchApplicationDetail();
    }
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployerApplicationDetail(applicationId);
      setApplication(data);
      if (data.response?.response) {
        setResponseText(data.response.response);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania szczegółów aplikacji:', err);
      setError('Nie udało się pobrać szczegółów aplikacji.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    
    try {
      await respondToApplication(applicationId, { response: responseText });
      await fetchApplicationDetail();
      setIsRespondingMode(false);
      alert('Odpowiedź została wysłana pomyślnie!');
    } catch (err) {
      console.error('Błąd podczas wysyłania odpowiedzi:', err);
      alert('Błąd podczas wysyłania odpowiedzi');
    }
  };

  const handleStatusUpdate = async (status: ApplicationStatusUpdateRequest['status']) => {
    if (!confirm(`Czy na pewno chcesz zmienić status na: ${getStatusText(status)}?`)) return;
    
    try {
      await updateApplicationStatus(applicationId, { status });
      await fetchApplicationDetail();
      alert('Status aplikacji został zaktualizowany');
    } catch (err) {
      console.error('Błąd podczas aktualizacji statusu:', err);
      alert('Błąd podczas aktualizacji statusu');
    }
  };

  const handleScheduleMeeting = async () => {
    if (!meetingForm.dateTime) {
      alert('Proszę wybrać datę i godzinę spotkania');
      return;
    }

    try {
      await scheduleMeeting(applicationId, meetingForm);
      await fetchApplicationDetail();
      setIsMeetingMode(false);
      setMeetingForm({
        dateTime: '',
        type: 'ONLINE',
        contributors: '',
        onlineMeetingUrl: '',
        message: ''
      });
      alert('Spotkanie zostało zaplanowane pomyślnie!');
    } catch (err) {
      console.error('Błąd podczas planowania spotkania:', err);
      alert('Błąd podczas planowania spotkania');
    }
  };

  const handleDeleteMeeting = async (meetingId: number) => {
    if (!confirm('Czy na pewno chcesz usunąć to spotkanie?')) return;
    
    try {
      await deleteMeeting(meetingId);
      await fetchApplicationDetail();
      alert('Spotkanie zostało usunięte');
    } catch (err) {
      console.error('Błąd podczas usuwania spotkania:', err);
      alert('Błąd podczas usuwania spotkania');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'ACCEPTED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CANCELED': return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Oczekuje';
      case 'ACCEPTED': return 'Zaakceptowana';
      case 'REJECTED': return 'Odrzucona';
      case 'CANCELED': return 'Anulowana';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSkills = (skills: any): string[] => {
    if (!skills) return [];
    
    // Jeśli to string, spróbuj sparsować JSON
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        if (Array.isArray(parsed)) {
          return parsed.map(skill => {
            // Jeśli skill to obiekt, wyciągnij 'name' lub użyj toString()
            if (typeof skill === 'object' && skill !== null) {
              return skill.name || skill.title || skill.skill || JSON.stringify(skill);
            }
            return String(skill);
          }).slice(0, 5);
        }
        return [];
      } catch {
        return skills.split(',').map(s => s.trim()).slice(0, 5);
      }
    }
    
    // Jeśli to array, mapuj każdy element na string
    if (Array.isArray(skills)) {
      return skills.map(skill => {
        if (typeof skill === 'object' && skill !== null) {
          return skill.name || skill.title || skill.skill || JSON.stringify(skill);
        }
        return String(skill);
      }).slice(0, 5);
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie szczegółów aplikacji...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error || 'Aplikacja nie została znaleziona'}</p>
          <Button onClick={() => router.push('/employer/applications')}>
            Powrót do aplikacji
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/employer/applications')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Powrót
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Szczegóły aplikacji</h1>
            <p className="text-muted-foreground">
              Aplikacja #{application.id} na stanowisko: {String(application.jobOffer.name || 'Brak nazwy')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Przegląd aplikacji</h2>
                  <p className="text-sm text-muted-foreground">
                    Wysłana: {formatDate(application.createDate)}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusBadgeClass(application.status)}`}>
                  {getStatusIcon(application.status)}
                  {getStatusText(application.status)}
                </div>
              </div>

              {/* Candidate Message */}
              {application.message && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Wiadomość od kandydata
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{String(application.message || '')}</p>
                  </div>
                </div>
              )}

              {/* Recruitment Questions */}
              {application.answers.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Odpowiedzi na pytania rekrutacyjne</h3>
                  <div className="space-y-4">
                    {application.answers.map((answer, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <p className="font-medium text-sm text-gray-600 mb-2">
                          {String(answer.question.question || '')}
                        </p>
                        <p className="text-gray-800">{String(answer.answer || 'Brak odpowiedzi')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Employer Response Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Twoja odpowiedź
                  </h3>
                  {!isRespondingMode && (
                    <Button
                      size="sm"
                      onClick={() => setIsRespondingMode(true)}
                      variant={application.response ? "outline" : "default"}
                    >
                      {application.response ? 'Edytuj odpowiedź' : 'Odpowiedz'}
                    </Button>
                  )}
                </div>

                {isRespondingMode ? (
                  <div className="space-y-4">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Napisz odpowiedź do kandydata..."
                      className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitResponse} size="sm">
                        Wyślij odpowiedź
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsRespondingMode(false);
                          setResponseText(application.response?.response || '');
                        }}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      {String(application.response?.response || 'Nie wysłano jeszcze odpowiedzi')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Meetings Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Spotkania
                </h2>
                <Button
                  size="sm"
                  onClick={() => setIsMeetingMode(true)}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Zaplanuj spotkanie
                </Button>
              </div>

              {isMeetingMode && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-4">Nowe spotkanie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Data i godzina</label>
                      <input
                        type="datetime-local"
                        value={meetingForm.dateTime}
                        onChange={(e) => setMeetingForm({...meetingForm, dateTime: e.target.value})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Typ spotkania</label>
                      <select
                        value={meetingForm.type}
                        onChange={(e) => setMeetingForm({...meetingForm, type: e.target.value as 'ONLINE' | 'OFFLINE'})}
                        className="w-full p-2 border rounded"
                      >
                        <option value="ONLINE">Online</option>
                        <option value="OFFLINE">Stacjonarnie</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Uczestnicy</label>
                      <input
                        type="text"
                        value={meetingForm.contributors}
                        onChange={(e) => setMeetingForm({...meetingForm, contributors: e.target.value})}
                        placeholder="np. Jan Kowalski, Anna Nowak"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    {meetingForm.type === 'ONLINE' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Link do spotkania</label>
                        <input
                          type="url"
                          value={meetingForm.onlineMeetingUrl}
                          onChange={(e) => setMeetingForm({...meetingForm, onlineMeetingUrl: e.target.value})}
                          placeholder="https://..."
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Notatka</label>
                      <textarea
                        value={meetingForm.message}
                        onChange={(e) => setMeetingForm({...meetingForm, message: e.target.value})}
                        placeholder="Dodatkowe informacje o spotkaniu..."
                        className="w-full p-2 border rounded h-20 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleScheduleMeeting} size="sm">
                      Zaplanuj spotkanie
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsMeetingMode(false)}
                    >
                      Anuluj
                    </Button>
                  </div>
                </div>
              )}

              {/* Existing Meetings */}
              <div className="space-y-4">
                {application.meetings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nie zaplanowano jeszcze żadnych spotkań
                  </p>
                ) : (
                  application.meetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                              Spotkanie {meeting.type === 'ONLINE' ? 'online' : 'stacjonarne'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(meeting.dateTime)}
                            </span>
                          </div>
                          {meeting.contributors && (
                            <p className="text-sm text-gray-600 mb-1">
                              Uczestnicy: {String(meeting.contributors)}
                            </p>
                          )}
                          {meeting.onlineMeetingUrl && (
                            <p className="text-sm mb-1">
                              <a 
                                href={String(meeting.onlineMeetingUrl)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Link do spotkania
                              </a>
                            </p>
                          )}
                          {meeting.message && (
                            <p className="text-sm text-gray-600">{String(meeting.message)}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Candidate Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Kandydat
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg">
                    {application.candidateProfile.name || ''} {application.candidateProfile.lastName || ''}
                  </h4>
                  {application.candidateProfile.place && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {String(application.candidateProfile.place)}
                    </p>
                  )}
                  {application.candidateProfile.phoneNumber && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {String(application.candidateProfile.phoneNumber)}
                    </p>
                  )}
                </div>

                {application.candidateProfile.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Opis</p>
                    <p className="text-sm text-gray-600">{String(application.candidateProfile.description)}</p>
                  </div>
                )}

                {/* Skills */}
                {formatSkills(application.candidateProfile.skills).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Umiejętności</p>
                    <div className="flex flex-wrap gap-1">
                      {formatSkills(application.candidateProfile.skills).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Link href={`/employer/candidates/${application.candidateProfile.id}`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Profil kandydata
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd CV
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            {application.status === 'PENDING' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4">Akcje</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleStatusUpdate('ACCEPTED')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Zaakceptuj aplikację
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('REJECTED')}
                    variant="destructive"
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Odrzuć aplikację
                  </Button>
                </div>
              </div>
            )}

            {/* Job Offer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Oferta pracy</h3>
              <div>
                <h4 className="font-medium">{application.jobOffer.name}</h4>
                <Link href={`/employer/job-offers/${application.jobOffer.id}`}>
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    Zobacz szczegóły oferty
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
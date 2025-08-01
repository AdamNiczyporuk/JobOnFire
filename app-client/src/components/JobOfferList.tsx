'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { JobOffer } from '@/types/jobOffer';

interface JobOfferListProps {
  jobOffers: JobOffer[];
  onEdit: (jobOffer: JobOffer) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onView: (jobOffer: JobOffer) => void;
  isLoading?: boolean;
}

export default function JobOfferList({ 
  jobOffers, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onView,
  isLoading = false 
}: JobOfferListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Ładowanie ofert...</div>
      </div>
    );
  }

  if (jobOffers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">Brak ofert pracy</div>
        <div className="text-sm text-gray-400">
          Kliknij "Utwórz nową ofertę", aby dodać pierwszą ofertę pracy.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobOffers.map((jobOffer) => (
        <div 
          key={jobOffer.id} 
          className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            !jobOffer.isActive 
              ? 'border-gray-400 bg-gray-50' 
              : isExpired(jobOffer.expireDate)
              ? 'border-red-400'
              : 'border-green-400'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {jobOffer.name}
                </h3>
                <div className="flex gap-2">
                  {/* Status badge */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    !jobOffer.isActive 
                      ? 'bg-gray-200 text-gray-700'
                      : isExpired(jobOffer.expireDate)
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {!jobOffer.isActive 
                      ? 'Nieaktywna'
                      : isExpired(jobOffer.expireDate)
                      ? 'Wygasła'
                      : 'Aktywna'
                    }
                  </span>
                  
                  {/* Applications count */}
                  {jobOffer._count && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {jobOffer._count.applications} aplikacji
                    </span>
                  )}
                </div>
              </div>

              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Typ umowy:</span> {jobOffer.contractType || 'Nie określono'}
                </div>
                <div>
                  <span className="font-medium">Wynagrodzenie:</span> {jobOffer.salary || 'Nie określono'}
                </div>
                <div>
                  <span className="font-medium">Wymiar pracy:</span> {jobOffer.workload || 'Nie określono'}
                </div>
              </div>

              {/* Job level and working mode */}
              <div className="mb-4">
                {jobOffer.jobLevel && jobOffer.jobLevel.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Poziom: </span>
                    <div className="inline-flex flex-wrap gap-1">
                      {jobOffer.jobLevel.map((level, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {jobOffer.workingMode && jobOffer.workingMode.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Tryb pracy: </span>
                    <div className="inline-flex flex-wrap gap-1">
                      {jobOffer.workingMode.map((mode, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                        >
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {jobOffer.tags && jobOffer.tags.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">Tagi: </span>
                  <div className="inline-flex flex-wrap gap-1">
                    {jobOffer.tags.slice(0, 5).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {jobOffer.tags.length > 5 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        +{jobOffer.tags.length - 5} więcej
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Utworzono:</span> {formatDate(jobOffer.createDate)}
                </div>
                <div>
                  <span className="font-medium">Wygasa:</span> 
                  <span className={isExpired(jobOffer.expireDate) ? 'text-red-600 font-medium' : ''}>
                    {formatDate(jobOffer.expireDate)}
                  </span>
                </div>
              </div>

              {/* Location */}
              {jobOffer.lokalization && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Lokalizacja:</span> 
                  {[
                    jobOffer.lokalization.city,
                    jobOffer.lokalization.state
                  ].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <Button
                onClick={() => onView(jobOffer)}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Zobacz
              </Button>
              
              <Button
                onClick={() => onEdit(jobOffer)}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Edytuj
              </Button>
              
              <Button
                onClick={() => onToggleStatus(jobOffer.id)}
                variant="outline"
                size="sm"
                className={jobOffer.isActive 
                  ? "text-orange-600 border-orange-600 hover:bg-orange-50"
                  : "text-green-600 border-green-600 hover:bg-green-50"
                }
              >
                {jobOffer.isActive ? 'Dezaktywuj' : 'Aktywuj'}
              </Button>
              
              <Button
                onClick={() => onDelete(jobOffer.id)}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Usuń
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

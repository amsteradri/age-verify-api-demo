'use client';

import React from 'react';
import { VerificationResult, FieldVerificationStatus } from '@/types';

interface VerificationResultsProps {
  result: VerificationResult;
  onReset: () => void;
}

const VerificationResults: React.FC<VerificationResultsProps> = ({ result, onReset }) => {
  // Mapeo de campos para mostrar en la UI
  const fieldLabels: Record<string, string> = {
    idDocument: 'Documento de Identidad',
    name: 'Nombre Completo',
    givenName: 'Nombre',
    familyName: 'Apellido',
    birthdate: 'Fecha de Nacimiento',
    email: 'Email',
    gender: 'Género',
    address: 'Dirección',
    streetName: 'Nombre de Calle',
    streetNumber: 'Número de Calle', 
    postalCode: 'Código Postal',
    region: 'Región',
    locality: 'Localidad',
    country: 'País',
    houseNumberExtension: 'Extensión del Número',
    nameKanaHankaku: 'Nombre (Kana Hankaku)',
    nameKanaZenkaku: 'Nombre (Kana Zenkaku)',
    middleNames: 'Nombres del Medio',
    familyNameAtBirth: 'Apellido de Nacimiento'
  };

  // Crear array de status de campos verificados
  const getVerificationStatuses = (): FieldVerificationStatus[] => {
    const statuses: FieldVerificationStatus[] = [];
    
    // Mapear resultados de la respuesta a estados de verificación
    const fieldMappings: Record<string, string> = {
      idDocument: 'idDocumentMatch',
      name: 'nameMatch', 
      givenName: 'givenNameMatch',
      familyName: 'familyNameMatch',
      birthdate: 'birthdateMatch',
      email: 'emailMatch',
      gender: 'genderMatch',
      address: 'addressMatch',
      streetName: 'streetNameMatch',
      streetNumber: 'streetNumberMatch',
      postalCode: 'postalCodeMatch',
      region: 'regionMatch',
      locality: 'localityMatch',
      country: 'countryMatch',
      houseNumberExtension: 'houseNumberExtensionMatch',
      nameKanaHankaku: 'nameKanaHankakuMatch',
      nameKanaZenkaku: 'nameKanaZenkakuMatch',
      middleNames: 'middleNamesMatch',
      familyNameAtBirth: 'familyNameAtBirthMatch'
    };

    Object.entries(fieldMappings).forEach(([field, matchField]) => {
      const matchValue = result[matchField as keyof VerificationResult];
      if (matchValue !== undefined) {
        const scoreField = matchField.replace('Match', 'MatchScore');
        const score = result[scoreField as keyof VerificationResult] as number | undefined;
        
        let icon = '❓';
        let color = 'text-gray-600';
        
        if (matchValue === 'true') {
          icon = '✅';
          color = 'text-green-600';
        } else if (matchValue === 'false') {
          icon = '❌';
          color = 'text-red-600';
        } else if (matchValue === 'not_available') {
          icon = '⚠️';
          color = 'text-yellow-600';
        }

        statuses.push({
          field,
          label: fieldLabels[field] || field,
          status: matchValue as any,
          score,
          icon,
          color
        });
      }
    });

    return statuses.sort((a, b) => {
      // Ordenar: primero verified, luego failed, luego unavailable
      const order = { 'true': 0, 'false': 1, 'not_available': 2 };
      return order[a.status] - order[b.status];
    });
  };

  const verificationStatuses = getVerificationStatuses();

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className={`telefonica-card p-6 ${
        result.isVerified 
          ? 'verification-card verified' 
          : result.verifiedFields.length > 0
          ? 'verification-card unavailable'
          : 'verification-card failed'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              {result.isVerified ? '✅' : result.verifiedFields.length > 0 ? '⚠️' : '❌'}
              <span className="ml-2">
                {result.isVerified ? 'Verificación Exitosa' : 
                 result.verifiedFields.length > 0 ? 'Verificación Parcial' : 
                 'Verificación Fallida'}
              </span>
            </h2>
            <p className="text-lg mb-4">{result.message}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <span className="font-semibold text-green-600">✅ Verificados:</span>
                <span className="ml-2">{result.verifiedFields.length}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-red-600">❌ Fallaron:</span>
                <span className="ml-2">{result.failedFields.length}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-yellow-600">⚠️ No disponibles:</span>
                <span className="ml-2">{result.unavailableFields.length}</span>
              </div>
            </div>

            {result.overallScore > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Puntuación General:</span>
                  <span className="text-xl font-bold">{result.overallScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      result.overallScore >= 80 ? 'score-bar-high' :
                      result.overallScore >= 60 ? 'score-bar-medium' : 'score-bar-low'
                    }`}
                    style={{ width: `${result.overallScore}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalles por Campo */}
      {verificationStatuses.length > 0 && (
        <div className="telefonica-card p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Detalles de Verificación
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verificationStatuses.map((status) => (
              <div
                key={status.field}
                className={`p-4 rounded-lg border-l-4 ${
                  status.status === 'true' ? 'field-verified' :
                  status.status === 'false' ? 'field-failed' :
                  'field-unavailable'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{status.label}</h4>
                  <span className="text-xl">{status.icon}</span>
                </div>
                
                <div className="text-sm">
                  <span className={`font-semibold ${status.color}`}>
                    {status.status === 'true' ? 'Verificado' :
                     status.status === 'false' ? 'No coincide' :
                     'No disponible'}
                  </span>
                  
                  {status.score !== undefined && status.status === 'false' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Similitud:</span>
                        <span className="font-bold">{status.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            status.score >= 70 ? 'score-bar-medium' : 'score-bar-low'
                          }`}
                          style={{ width: `${status.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información del Sandbox */}
      {result._sandbox && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 card-shadow">
          <div className="flex items-center">
            <div className="text-blue-400 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Información del Sandbox</h4>
              <p className="text-blue-700 text-sm mt-1">{result._sandbox}</p>
            </div>
          </div>
        </div>
      )}

      {/* Botón para nueva verificación */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, var(--telefonica-blue) 0%, var(--telefonica-blue-dark) 100%)' 
          }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Nueva Verificación
        </button>
      </div>
    </div>
  );
};

export default VerificationResults;
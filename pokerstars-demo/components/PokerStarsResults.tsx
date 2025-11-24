'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Users, Star, Shield, Award, TrendingUp } from 'lucide-react';
import { PokerStarsVerificationResult, MatchResult } from '@/types';

interface PokerStarsResultsProps {
  result: PokerStarsVerificationResult;
  onReset: () => void;
}

export default function PokerStarsResults({ result, onReset }: PokerStarsResultsProps) {
  const getStatusIcon = (canPlay: boolean) => {
    return canPlay ? (
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
    ) : (
      <XCircle className="w-16 h-16 text-red-600 mx-auto" />
    );
  };

  const getStatusColor = (canPlay: boolean) => {
    return canPlay ? 'green' : 'red';
  };

  const getFieldIcon = (status: MatchResult) => {
    switch (status) {
      case 'true':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'false':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'not_available':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getFieldColor = (status: MatchResult) => {
    switch (status) {
      case 'true': return 'border-green-200 bg-green-50';
      case 'false': return 'border-red-200 bg-red-50';
      case 'not_available': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const fieldLabels: Record<string, string> = {
    idDocumentMatch: 'Documento de Identidad',
    nameMatch: 'Nombre Completo',
    givenNameMatch: 'Nombre',
    familyNameMatch: 'Apellidos',
    birthdateMatch: 'Fecha de Nacimiento',
    addressMatch: 'Dirección',
    emailMatch: 'Email',
    genderMatch: 'Género',
    postalCodeMatch: 'Código Postal',
    countryMatch: 'País'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Resultado Principal */}
      <div className={`telefonica-card p-8 text-center border-l-4 ${
        result.canPlay ? 'border-l-green-500' : 'border-l-red-500'
      }`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {getStatusIcon(result.canPlay)}
        </motion.div>
        
        <h2 className={`text-3xl font-bold mt-4 mb-2 text-${getStatusColor(result.canPlay)}-700`}>
          {result.canPlay ? '🎉 ¡Registro Aprobado!' : '❌ Registro No Aprobado'}
        </h2>
        
        <p className="text-xl text-gray-700 mb-6">
          {result.overallMessage}
        </p>

        {/* Badges de Estado */}
        <div className="flex justify-center gap-4 mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            result.kycVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <Shield className="w-4 h-4 mr-2" />
            KYC {result.kycVerified ? 'Verificado' : 'No Verificado'}
          </div>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            result.ageVerified ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
          }`}>
            <Users className="w-4 h-4 mr-2" />
            Edad {result.ageVerified ? 'Verificada (+18)' : 'No Verificada'}
          </div>

          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Puntuación: {result.kycScore}%
          </div>
        </div>

        {/* Recomendaciones */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Recomendaciones:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {result.recommendations.map((rec, index) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}

        {result.canPlay && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="font-semibold text-green-800">¡Bienvenido a PokerStars!</span>
            </div>
            <p className="text-sm text-green-700">
              Tu cuenta ha sido verificada exitosamente. Ya puedes empezar a jugar poker online de forma legal y segura.
            </p>
          </div>
        )}
      </div>

      {/* Detalles de Verificación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Resultados KYC */}
        <div className="telefonica-card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            Verificación de Identidad (KYC)
          </h3>
          
          <div className="space-y-3">
            {Object.entries(fieldLabels).map(([field, label]) => {
              const value = result.kycResult[field as keyof typeof result.kycResult] as MatchResult;
              if (!value) return null;
              
              return (
                <div key={field} className={`flex items-center justify-between p-3 rounded-lg border ${getFieldColor(value)}`}>
                  <span className="font-medium text-gray-800">{label}</span>
                  <div className="flex items-center gap-2">
                    {getFieldIcon(value)}
                    <span className="text-sm font-medium">
                      {value === 'true' ? 'Verificado' : 
                       value === 'false' ? 'No coincide' : 'No disponible'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Campos Categorizados */}
          <div className="mt-6 space-y-3">
            {result.verifiedFields.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-1">✅ Campos Verificados:</h5>
                <p className="text-sm text-green-700">{result.verifiedFields.join(', ')}</p>
              </div>
            )}
            
            {result.failedFields.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <h5 className="font-semibold text-red-800 mb-1">❌ Campos No Verificados:</h5>
                <p className="text-sm text-red-700">{result.failedFields.join(', ')}</p>
              </div>
            )}
            
            {result.unavailableFields.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h5 className="font-semibold text-yellow-800 mb-1">⚠️ Campos No Disponibles:</h5>
                <p className="text-sm text-yellow-700">{result.unavailableFields.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Resultados de Edad */}
        <div className="telefonica-card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-purple-600" />
            Verificación de Edad
          </h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              result.ageVerified ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Mayoría de Edad (18+)</span>
                {result.ageVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <p className={`text-sm ${result.ageVerified ? 'text-green-700' : 'text-red-700'}`}>
                {result.ageVerified ? 
                  'Edad verificada: Usuario mayor de 18 años' : 
                  'No se pudo verificar que el usuario sea mayor de 18 años'
                }
              </p>
            </div>

            {result.ageResult.identityMatchScore && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-800">Puntuación de Identidad</span>
                  <span className="text-xl font-bold text-blue-600">
                    {result.ageResult.identityMatchScore}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${result.ageResult.identityMatchScore}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-2">📊 Detalles Técnicos</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Estado de verificación:</strong> {result.ageResult.verifiedStatus ? 'Verificado' : 'No verificado'}</p>
                <p><strong>Control de edad:</strong> {result.ageResult.ageCheck}</p>
                {result.ageResult.contentLock && (
                  <p><strong>Bloqueo de contenido:</strong> {result.ageResult.contentLock}</p>
                )}
                {result.ageResult.parentalControl && (
                  <p><strong>Control parental:</strong> {result.ageResult.parentalControl}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onReset}
          className="telefonica-button-secondary px-8 py-3"
        >
          Nueva Verificación
        </button>
        
        {result.canPlay && (
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Empezar a Jugar
          </button>
        )}
      </div>

      {/* Información de Sandbox */}
      {result.kycResult._sandbox && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <h4 className="font-semibold text-blue-800 mb-2">🔧 Información del Sandbox</h4>
          <p className="text-sm text-blue-700">{result.kycResult._sandbox}</p>
        </div>
      )}
    </motion.div>
  );
}
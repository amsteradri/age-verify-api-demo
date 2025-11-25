'use client';

import React from 'react';
import { PokerStarsVerificationResult } from '@/types';

interface PokerStarsResultsProps {
  result: PokerStarsVerificationResult;
  onReset: () => void;
}

export default function PokerStarsResults({ result, onReset }: PokerStarsResultsProps) {
  const { kycResult, ageResult, canPlay } = result;
  
  // Determinar el estado visual general
  const getStatusColor = () => {
    if (canPlay) {
      return {
        bg: 'from-green-900/50 via-green-800/50 to-emerald-900/50',
        border: 'border-green-500/50',
        accent: 'text-green-400',
        icon: 'text-green-400'
      };
    } else {
      return {
        bg: 'from-red-900/50 via-red-800/50 to-red-900/50',
        border: 'border-red-500/50',
        accent: 'text-red-400',
        icon: 'text-red-400'
      };
    }
  };

  const statusColors = getStatusColor();

  const formatMatch = (match: any) => {
    if (typeof match === 'boolean') {
      return match ? '✅ VERIFICADO' : '❌ NO VERIFICADO';
    }
    if (match === 'true') return '✅ VERIFICADO';
    if (match === 'false') return '❌ NO VERIFICADO';
    if (match === 'not_available') return '⚠️ NO DISPONIBLE';
    return 'N/A';
  };

  return (
    <div className={`bg-gradient-to-br ${statusColors.bg} backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${statusColors.border}`}>
      {/* Header de resultados */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 ${canPlay ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-red-600 to-red-700'} rounded-full mb-6 shadow-2xl border-4 ${canPlay ? 'border-green-400' : 'border-red-400'}`}>
          {canPlay ? (
            <svg className="w-10 h-10 text-green-100" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-red-100" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>
          {canPlay ? '🎉 ¡BIENVENIDO A POKERSTARS!' : '❌ REGISTRO NO AUTORIZADO'}
        </h2>
        
        <div className={`inline-flex items-center px-8 py-4 rounded-full text-xl font-bold shadow-lg mb-6 ${canPlay ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border border-green-500' : 'bg-gradient-to-r from-red-600 to-red-700 text-white border border-red-500'}`}>
          <svg className="w-6 h-6 mr-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
          </svg>
          {canPlay ? 'CUENTA ACTIVADA' : 'VERIFICACIÓN FALLIDA'}
          <svg className="w-6 h-6 ml-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
          </svg>
        </div>
        
        <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
          {result.overallMessage}
        </p>
      </div>

      {/* Resultados detallados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Verificación KYC */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/50">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 ${result.kycVerified ? 'bg-green-600' : 'bg-red-600'} rounded-full flex items-center justify-center mr-4`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Verificación KYC</h3>
              <p className="text-gray-400">Validación de identidad</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {kycResult ? (
              <>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Nombre:</span>
                  <span className={`font-bold ${kycResult.givenNameMatch === 'true' ? 'text-green-400' : kycResult.givenNameMatch === 'false' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {formatMatch(kycResult.givenNameMatch)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Apellidos:</span>
                  <span className={`font-bold ${kycResult.familyNameMatch === 'true' ? 'text-green-400' : kycResult.familyNameMatch === 'false' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {formatMatch(kycResult.familyNameMatch)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Código postal:</span>
                  <span className={`font-bold ${kycResult.postalCodeMatch === 'true' ? 'text-green-400' : kycResult.postalCodeMatch === 'false' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {formatMatch(kycResult.postalCodeMatch)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Fecha de nacimiento:</span>
                  <span className={`font-bold ${kycResult.birthdateMatch === 'true' ? 'text-green-400' : kycResult.birthdateMatch === 'false' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {formatMatch(kycResult.birthdateMatch)}
                  </span>
                </div>
                <div className="bg-gray-700/20 rounded-lg p-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Puntuación KYC:</span>
                    <span className="text-white font-bold text-lg">{result.kycScore}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${result.kycScore}%` }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <span className="text-red-400 font-semibold">❌ Error en verificación KYC</span>
              </div>
            )}
          </div>
        </div>

        {/* Verificación de Edad */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600/50">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 ${result.ageVerified ? 'bg-green-600' : 'bg-red-600'} rounded-full flex items-center justify-center mr-4`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Control de Edad</h3>
              <p className="text-gray-400">Verificación +18 años</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {ageResult ? (
              <>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Mayor de 18 años:</span>
                  <span className={`font-bold ${ageResult.ageCheck === 'true' ? 'text-green-400' : ageResult.ageCheck === 'false' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {ageResult.ageCheck === 'true' ? '✅ CONFIRMADO' : ageResult.ageCheck === 'false' ? '❌ NO VERIFICADO' : '⚠️ NO DISPONIBLE'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300 font-medium">Estado de verificación:</span>
                  <span className={`font-bold ${ageResult.verifiedStatus ? 'text-green-400' : 'text-red-400'}`}>
                    {ageResult.verifiedStatus ? '✅ VERIFICADO' : '❌ NO VERIFICADO'}
                  </span>
                </div>
                {ageResult.identityMatchScore && (
                  <div className="bg-gray-700/20 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Coincidencia identidad:</span>
                      <span className="text-white font-bold text-lg">{ageResult.identityMatchScore}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${ageResult.identityMatchScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {ageResult.contentLock && (
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300 font-medium">Control de contenido:</span>
                    <span className={`font-bold ${ageResult.contentLock === 'true' ? 'text-green-400' : 'text-red-400'}`}>
                      {formatMatch(ageResult.contentLock)}
                    </span>
                  </div>
                )}
                {ageResult.parentalControl && (
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300 font-medium">Control parental:</span>
                    <span className={`font-bold ${ageResult.parentalControl === 'true' ? 'text-green-400' : 'text-red-400'}`}>
                      {formatMatch(ageResult.parentalControl)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-4">
                <span className="text-red-400 font-semibold">❌ Error en verificación de edad</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensajes de estado y acciones */}
      <div className="text-center">
        {canPlay ? (
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-2xl p-6 border border-green-500/30 mb-6">
            <div className="text-green-100 text-lg space-y-2">
              <p className="font-bold text-xl">🎉 ¡Registro completado con éxito!</p>
              <p>Su cuenta de PokerStars España está lista. Puede comenzar a jugar inmediatamente.</p>
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center text-green-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-semibold">Acceso a todas las mesas</span>
                </div>
                <div className="flex items-center text-green-300">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span className="text-sm font-semibold">Torneos disponibles</span>
                </div>
                <div className="flex items-center text-green-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <span className="text-sm font-semibold">Bonos de bienvenida</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 rounded-2xl p-6 border border-red-500/30 mb-6">
            <div className="text-red-100 text-lg space-y-2">
              <p className="font-bold text-xl">❌ Verificación incompleta</p>
              <p>No se pudo completar la verificación de identidad o edad.</p>
              <p className="text-sm text-red-200">
                Asegúrese de que los datos introducidos coinciden exactamente con los de su operador móvil.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={onReset}
            className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-8 py-3 rounded-full hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-bold text-lg shadow-lg border border-gray-600"
          >
            🔄 NUEVO REGISTRO
          </button>
          
          {canPlay && (
            <button
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 font-bold text-lg shadow-lg border border-red-500"
              onClick={() => window.open('https://pokerstars.es', '_blank')}
            >
              🎰 IR A POKERSTARS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
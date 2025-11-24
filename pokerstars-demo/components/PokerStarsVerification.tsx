'use client';

import React, { useState } from 'react';
import { PokerStarsVerificationRequest, PokerStarsVerificationResult } from '@/types';
import KycForm from '@/components/KycForm';
import PokerStarsResults from '@/components/PokerStarsResults';

export default function PokerStarsVerification() {
  const [verificationResult, setVerificationResult] = useState<PokerStarsVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyPlayer = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Convertir los datos del formulario al formato de PokerStars
      const pokerstarsData: PokerStarsVerificationRequest = {
        phoneNumber: formData.phoneNumber,
        idDocument: formData.idDocument,
        givenName: formData.givenName,
        familyName: formData.familyName,
        birthdate: formData.birthdate,
        email: formData.email,
        gender: formData.gender,
        address: formData.address,
        postalCode: formData.postalCode,
        country: formData.country,
        ageThreshold: 18 // Poker requiere mayoría de edad
      };

      const response = await fetch('/api/kyc-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pokerstarsData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la verificación');
      }

      setVerificationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header PokerStars */}
        <div className="text-center mb-12">
          <div className="float-animation mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
              </svg>
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-5xl font-bold text-white mb-2">
              PokerStars España
            </h1>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
              <span className="text-lg font-semibold text-white/90 mr-2">Powered by</span>
              <span className="text-xl font-bold text-white mr-2">Open Gateway</span>
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">Telefónica</span>
            </div>
            {/* Demo Tag */}
            <div className="mb-4">
              <div className="inline-flex items-center bg-orange-500/20 border border-orange-400/30 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-orange-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-orange-100">
                  🎯 DEMO TÉCNICA - Entorno de desarrollo con datos simulados
                </span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Registro de Jugador - Verificación Completa
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            Regístrate en PokerStars con verificación de identidad y edad instantánea. Utilizamos la tecnología KYC y Age Verification de Telefónica Open Gateway para verificar tu identidad y mayoría de edad de manera segura.
          </p>
          <div className="mt-6 flex justify-center space-x-8 text-sm text-white/70">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verificación KYC
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verificación de Edad
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a5 5 0 0110 0z" clipRule="evenodd" />
              </svg>
              100% Seguro
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Registro Instantáneo
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-8">
          {!verificationResult && !isLoading && (
            <KycForm 
              onSubmit={handleVerifyPlayer} 
              isLoading={isLoading}
            />
          )}

          {isLoading && (
            <div className="telefonica-card p-8 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                🎰 Verificando tu elegibilidad para jugar...
              </h3>
              <p className="text-gray-600 mb-3">
                Realizando verificación de identidad (KYC) y edad con Open Gateway de Telefónica
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✅ Verificando identidad y datos personales</p>
                <p>🎂 Confirmando mayoría de edad (18+ años)</p>
                <p>🔒 Validando elegibilidad para juego online</p>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 card-shadow">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-800">
                    Error en la verificación
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}

          {verificationResult && (
            <PokerStarsResults 
              result={verificationResult}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/60">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-6 text-xs">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a5 5 0 0110 0z" clipRule="evenodd" />
                </svg>
                Tecnología KYC + Edad
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Regulación Juego
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Open Gateway
              </div>
            </div>
          </div>
          <p className="text-sm mb-2">
            PokerStars España utiliza la tecnología KYC y Age Verification de Telefónica Open Gateway 
            para garantizar la máxima seguridad y cumplimiento normativo en el registro de jugadores.
          </p>
          <p className="text-xs">
            Demo tecnológica - Los datos se procesan de forma segura y no se almacenan • 
            Cumplimiento DGOJ, GDPR y normativas de juego online
          </p>
        </div>
      </div>
    </div>
  );
}
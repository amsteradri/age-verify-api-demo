'use client';

import React, { useState } from 'react';
import { PokerStarsVerificationRequest, PokerStarsVerificationResult } from '@/types';
import PokerStarsForm from '@/components/PokerStarsForm';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header PokerStars */}
        <div className="text-center mb-12">
          <div className="float-animation mb-8">
            <img 
              src="/images/pokerstars-logo.png" 
              alt="PokerStars España" 
              className="w-32 h-32 mx-auto mb-6 drop-shadow-2xl"
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-8">
            REGISTRO DE JUGADOR
          </h2>
          <div className="inline-flex items-center bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-600">
            <span className="text-sm text-gray-300 mr-2">Powered by</span>
            <span className="text-sm font-bold text-white">Open Gateway</span>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-8">
          {!verificationResult && !isLoading && (
            <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-black/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-700/50">
              <PokerStarsForm 
                onSubmit={handleVerifyPlayer} 
                isLoading={isLoading}
              />
            </div>
          )}

          {isLoading && (
            <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-black/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-700/50 text-center">
              <div className="loading-spinner mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Verificando elegibilidad...
              </h3>
              <p className="text-gray-300 mb-6">
                Verificando identidad y edad con tecnología Open Gateway
              </p>
              <div className="bg-gray-800/30 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 h-full rounded-full animate-pulse shadow-lg"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-br from-red-900/50 via-red-800/50 to-red-900/50 backdrop-blur-lg rounded-3xl border border-red-600/50 p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Error en la verificación
                  </h3>
                  <p className="text-red-200 text-lg">{error}</p>
                </div>
              </div>
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 font-bold text-lg shadow-lg"
                >
                  🎯 INTENTAR DE NUEVO
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

        {/* Footer PokerStars */}
        <div className="text-center mt-16">
          <div className="text-gray-400 text-sm">
            <div className="inline-flex items-center mb-4">
              <span className="text-xs">Powered by</span>
              <span className="text-white font-semibold ml-1">Open Gateway</span>
            </div>
            <p className="text-xs">
              © 2024 PokerStars España - Demo técnica • +18 años
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { CustomerFormData, VerificationResult } from '@/types';
import KycForm from '@/components/KycForm';
import VerificationResults from '@/components/VerificationResults';

export default function Home() {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyCustomer = async (customerData: CustomerFormData) => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/kyc-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="float-animation mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Know Your Customer
          </h1>
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
            <span className="text-xl font-semibold text-white/90 mr-2">Open Gateway</span>
            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">API</span>
          </div>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Verifica la identidad de tus clientes de forma segura y confiable utilizando 
            la infraestructura de red de Telefónica
          </p>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-8">
          {!verificationResult && !isLoading && (
            <KycForm 
              onSubmit={handleVerifyCustomer} 
              isLoading={isLoading}
            />
          )}

          {isLoading && (
            <div className="telefonica-card p-8 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Verificando identidad...
              </h3>
              <p className="text-gray-600">
                Procesando los datos con la red de Telefónica
              </p>
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full animate-pulse"></div>
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
            <VerificationResults 
              result={verificationResult}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/60">
          <p className="text-sm">
            Esta demo utiliza la API de KYC de Telefónica para verificar la identidad de los clientes.
          </p>
          <p className="text-xs mt-2">
            Los datos se procesan de forma segura y no se almacenan.
          </p>
        </div>
      </div>
    </div>
  );
}
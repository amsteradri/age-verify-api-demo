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
        {/* Header Bancario */}
        <div className="text-center mb-12">
          <div className="float-animation mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
          </div>
          <div className="mb-6">
            <h1 className="text-5xl font-bold text-white mb-2">
              SecureBank Digital
            </h1>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
              <span className="text-lg font-semibold text-white/90 mr-2">Powered by</span>
              <span className="text-xl font-bold text-white mr-2">Open Gateway</span>
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">Telefónica</span>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Apertura de Cuenta Digital
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Abre tu cuenta bancaria de forma 100% digital y segura. Utilizamos la tecnología KYC 
            de Telefónica Open Gateway para verificar tu identidad de manera instantánea
          </p>
          <div className="mt-6 flex justify-center space-x-8 text-sm text-white/70">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verificación Instantánea
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
              Sin Papeles
            </div>
          </div>
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
                🔐 Verificando tu identidad...
              </h3>
              <p className="text-gray-600 mb-3">
                Conectando con Open Gateway de Telefónica para validar tus datos
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Este proceso es instantáneo y cumple con todas las normativas bancarias
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
          <div className="mb-4">
            <div className="inline-flex items-center space-x-6 text-xs">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a5 5 0 0110 0z" clipRule="evenodd" />
                </svg>
                Tecnología KYC
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Regulación Bancaria
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
            SecureBank Digital utiliza la tecnología KYC de Telefónica Open Gateway 
            para garantizar la máxima seguridad en la apertura de cuentas.
          </p>
          <p className="text-xs">
            Demo tecnológica - Los datos se procesan de forma segura y no se almacenan • 
            Cumplimiento GDPR y normativas bancarias
          </p>
        </div>
      </div>
    </div>
  );
}
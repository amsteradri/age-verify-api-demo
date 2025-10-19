'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AgeVerificationResponse } from '../types';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  withdrawAmount: number;
  isVerifying: boolean;
  setIsVerifying: (verifying: boolean) => void;
}

export default function AgeVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  withdrawAmount,
  isVerifying,
  setIsVerifying
}: AgeVerificationModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('+34639106848');
  const [verificationResult, setVerificationResult] = useState<AgeVerificationResponse | null>(null);
  const [step, setStep] = useState<'input' | 'verifying' | 'result'>('input');
  const [isClient, setIsClient] = useState(false);

  // Arreglar error de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleVerification = async () => {
    if (!phoneNumber) {
      toast.error('Por favor, introduce tu número de teléfono');
      return;
    }

    // Validar formato del teléfono
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Formato de teléfono inválido. Usa formato internacional (+34639106848)');
      return;
    }

    setIsVerifying(true);
    setStep('verifying');

    try {
      const response = await fetch('/api/verify-age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          amount: withdrawAmount
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la verificación');
      }

      setVerificationResult(data);
      setStep('result');

      if (data.canWithdraw && data.ageCheck === 'true') {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }

    } catch (error) {
      console.error('Error en verificación:', error);
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
      setStep('input');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep('input');
    setVerificationResult(null);
    setPhoneNumber('+34639106848');
    onClose();
  };

  const getVerificationIcon = () => {
    if (!verificationResult) return null;
    
    switch (verificationResult.ageCheck) {
      case 'true':
        return <CheckCircle className="w-10 h-10 text-green-600" />;
      case 'false':
        return <AlertCircle className="w-10 h-10 text-red-600" />;
      default:
        return <AlertCircle className="w-10 h-10 text-orange-600" />;
    }
  };

  const getVerificationMessage = () => {
    if (!verificationResult) return '';
    
    switch (verificationResult.ageCheck) {
      case 'true':
        return `¡Verificación exitosa! Eres mayor de 18 años. Retiro de €${isClient ? withdrawAmount.toLocaleString() : withdrawAmount} aprobado.`;
      case 'false':
        return 'Lo sentimos, debes ser mayor de 18 años para retirar ganancias del casino.';
      default:
        return 'No se pudo verificar tu edad. Inténtalo de nuevo más tarde.';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="telefonica-card p-6 max-w-md w-full border-l-4 border-l-blue-600"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Verificación de Edad</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={isVerifying}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido según el paso */}
            {step === 'input' && (
              <div>
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                  <p className="text-orange-800 text-sm">
                    <strong>Información:</strong> Para retirar €{isClient ? withdrawAmount.toLocaleString() : withdrawAmount}, 
                    debe verificarse que eres mayor de 18 años.
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+34639106848"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Formato internacional requerido (ej: +34639106848)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm">Proceso de verificación</h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Verificación segura con Open Gateway</li>
                    <li>• Proceso privado y confidencial</li>
                    <li>• Verificación de mayoría de edad (+18)</li>
                    <li>• Cumplimiento normativo</li>
                  </ul>
                </div>

                <button
                  onClick={handleVerification}
                  disabled={!phoneNumber || isVerifying}
                  className="telefonica-button-primary w-full flex items-center justify-center gap-2 text-sm"
                >
                  <Shield size={16} />
                  Verificar edad
                </button>
              </div>
            )}

            {step === 'verifying' && (
              <div className="text-center py-6">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Verificando edad...
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Conectando con Open Gateway</p>
                  <p>Número: {phoneNumber.substring(0, 6)}***</p>
                  <p>Procesando solicitud...</p>
                </div>
              </div>
            )}

            {step === 'result' && verificationResult && (
              <div className="text-center py-6">
                <div className="mb-3">
                  {getVerificationIcon()}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {verificationResult.ageCheck === 'true' ? 'Verificación Exitosa' : 'Verificación Fallida'}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {getVerificationMessage()}
                </p>

                {/* Detalles técnicos */}
                <div className="bg-gray-50 rounded-md p-3 mb-4 text-left">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm">Información de verificación:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Resultado: {verificationResult.ageCheck === 'true' ? 'Mayor de edad' : 'Menor de edad'}</p>
                    {verificationResult.verifiedStatus !== undefined && (
                      <p>• Documento oficial: {verificationResult.verifiedStatus ? 'Verificado' : 'No verificado'}</p>
                    )}
                    {verificationResult.identityMatchScore !== undefined && (
                      <p>• Confianza: {verificationResult.identityMatchScore}%</p>
                    )}
                  </div>
                </div>

                {verificationResult.ageCheck === 'true' ? (
                  <div className="text-green-600 font-medium text-sm">
                    ✓ Retiro autorizado
                  </div>
                ) : (
                  <button
                    onClick={handleClose}
                    className="telefonica-button-primary w-full text-sm"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
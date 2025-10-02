'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AgeVerificationResponse } from '../types';
import toast from 'react-hot-toast';

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
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'false':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Verificación de Edad</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isVerifying}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido según el paso */}
            {step === 'input' && (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>¡Importante!</strong> Para retirar €{isClient ? withdrawAmount.toLocaleString() : withdrawAmount}, 
                    necesitas verificar que eres mayor de 18 años usando tu número de teléfono.
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">¿Cómo funciona?</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Verificamos tu edad con Telefónica Open Gateway</li>
                    <li>• Proceso seguro y privado</li>
                    <li>• Solo verificamos que eres mayor de 18 años</li>
                    <li>• Cumple con regulaciones de juego responsable</li>
                  </ul>
                </div>

                <button
                  onClick={handleVerification}
                  disabled={!phoneNumber || isVerifying}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Verificar Edad y Retirar
                </button>
              </div>
            )}

            {step === 'verifying' && (
              <div className="text-center py-8">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Verificando tu edad...
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🔐 Conectando con Telefónica Open Gateway...</p>
                  <p>📱 Verificando número: {phoneNumber}</p>
                  <p>⏳ Esto puede tomar unos segundos...</p>
                </div>
              </div>
            )}

            {step === 'result' && verificationResult && (
              <div className="text-center py-8">
                {getVerificationIcon()}
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-4">
                  {verificationResult.ageCheck === 'true' ? '¡Verificación Exitosa!' : 'Verificación Fallida'}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {getVerificationMessage()}
                </p>

                {/* Detalles técnicos */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-gray-700 mb-2">Detalles de Verificación:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Estado: {verificationResult.ageCheck}</p>
                    {verificationResult.verifiedStatus !== undefined && (
                      <p>• Documento verificado: {verificationResult.verifiedStatus ? 'Sí' : 'No'}</p>
                    )}
                    {verificationResult.identityMatchScore !== undefined && (
                      <p>• Puntuación de identidad: {verificationResult.identityMatchScore}/100</p>
                    )}
                  </div>
                </div>

                {verificationResult.ageCheck === 'true' ? (
                  <div className="text-green-600 font-semibold">
                    ✅ Transferencia iniciada...
                  </div>
                ) : (
                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
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
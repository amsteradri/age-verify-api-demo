'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Gem, Wallet, Shield, Crown } from 'lucide-react';
import Image from 'next/image';
import { GameState } from '../types';
import AgeVerificationModal from './AgeVerificationModal';
import toast from 'react-hot-toast';

// Configuración de la tragaperras
const SLOT_SYMBOLS = [
  { symbol: '🍒', name: 'Cereza', value: 100 },
  { symbol: '🍋', name: 'Limón', value: 150 },
  { symbol: '🍊', name: 'Naranja', value: 200 },
  { symbol: '🍇', name: 'Uva', value: 300 },
  { symbol: '🔔', name: 'Campana', value: 500 },
  { symbol: '⭐', name: 'Estrella', value: 750 },
  { symbol: '💎', name: 'Diamante', value: 1000 },
  { symbol: '👑', name: 'Corona', value: 2000 },
  { symbol: '💰', name: 'Jackpot', value: 1000000 }
];

// Constantes del juego
const WINNING_SYMBOL = SLOT_SYMBOLS[8]; // Símbolo ganador garantizado (💰)
const JACKPOT_AMOUNT = 1000000; // Premio del jackpot
const INITIAL_BALANCE = 1000; // Saldo inicial del jugador
const SPIN_COST = 50; // Costo por giro
const SPIN_DURATION = 3000; // Duración de la animación de giro (ms)

/**
 * Componente principal de la tragaperras Open Gateway
 * Maneja el juego, las animaciones y la verificación de edad
 */
export default function SlotMachine() {
  // Estado principal del juego
  const [gameState, setGameState] = useState<GameState>({
    balance: INITIAL_BALANCE,
    isSpinning: false,
    hasWon: false,
    winAmount: 0,
    canWithdraw: false,
    isAgeVerified: false,
  });

  // Estados de la interfaz
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [winningSymbols, setWinningSymbols] = useState<typeof SLOT_SYMBOLS | null>(null);
  const [reelSymbols, setReelSymbols] = useState<string[]>(['💎', '⭐', '🔔', '👑', '🍇']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  /**
   * Hook para verificar que estamos en el cliente (hidratación de Next.js)
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Función principal para girar los rodillos
   * Maneja el giro, descuento del saldo, animaciones y resultado garantizado
   */
  const spin = useCallback(() => {
    // Validaciones antes de girar
    if (gameState.isSpinning || gameState.hasWon || gameState.balance < SPIN_COST) return;

    // Iniciar giro y descontar saldo
    setIsSpinning(true);
    setGameState(prev => ({ 
      ...prev, 
      isSpinning: true,
      balance: prev.balance - SPIN_COST
    }));
    setWinningSymbols(null);

    // Animación de giro
    setTimeout(() => {
      // Mostrar símbolos ganadores (jackpot garantizado)
      const finalSymbols = Array(5).fill(WINNING_SYMBOL.symbol);
      setReelSymbols(finalSymbols);
      
      // Completar giro y actualizar estado
      setTimeout(() => {
        setIsSpinning(false);
        setGameState(prev => ({
          ...prev,
          isSpinning: false,
          hasWon: true,
          winAmount: JACKPOT_AMOUNT,
          canWithdraw: true,
          balance: prev.balance + JACKPOT_AMOUNT
        }));
        
        setWinningSymbols(SLOT_SYMBOLS);
        
        // Mostrar notificación de victoria
        toast.success(`¡Premio ganado! Has obtenido €${JACKPOT_AMOUNT.toLocaleString()}`, {
          duration: 4000,
          icon: '�',
        });
      }, 1000);
    }, SPIN_DURATION);
  }, [gameState.isSpinning, gameState.hasWon, gameState.balance]);

  /**
   * Maneja el intento de retiro de ganancias
   * Abre el modal de verificación de edad
   */
  const handleWithdraw = useCallback(() => {
    if (!gameState.canWithdraw) return;
    setShowVerificationModal(true);
  }, [gameState.canWithdraw]);

  /**
   * Maneja el resultado exitoso de la verificación de edad
   * Procesa el retiro exitoso
   */
  const handleVerificationSuccess = useCallback(() => {
    setShowVerificationModal(false);
    setGameState(prev => ({ ...prev, isAgeVerified: true }));
    toast.success(`Retiro procesado: €${gameState.winAmount.toLocaleString()} transferido exitosamente`, {
      duration: 3000,
      icon: '✓',
    });
  }, [gameState.winAmount]);

  /**
   * Genera un símbolo aleatorio para las animaciones de giro
   */
  const getRandomSymbol = useCallback(() => {
    return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].symbol;
  }, []);

  // Renderizado condicional para hidratación de Next.js
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Banner Open Gateway */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white border-b border-gray-200 shadow-md"
      >
        <div className="w-full px-6 py-6">
          <Image 
            src="/images/opengateway.jpg" 
            alt="Telefónica Open Gateway" 
            width={1200} 
            height={200} 
            className="w-full h-32 object-cover"
          />
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Header Corporativo Telefónica */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6 w-full max-w-4xl"
        >
        <div className="telefonica-card p-6 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Age Verification Demo</h1>
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
          </div>
          <p className="text-base text-gray-600 mb-3">Demo de verificación de edad - API Open Gateway</p>
          <div className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 text-sm rounded-md border border-orange-200">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Entorno de pruebas - Datos simulados
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-6xl mx-auto">
        {/* MÁQUINA PRINCIPAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="telefonica-card p-6 mb-6 w-full max-w-4xl mx-auto"
        >
          {/* TRAGAPERRAS */}
          <div className="text-center mb-6">
            <div className="telefonica-card border-2 border-blue-600 p-6 w-full max-w-3xl mx-auto">
              {/* Panel superior */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Simulador de Casino</h3>
                <div className="text-blue-600 font-semibold text-sm mb-1">Premio disponible</div>
                <div className="text-gray-800 font-bold text-lg">€{JACKPOT_AMOUNT.toLocaleString()}</div>
              </div>

              {/* PANTALLA DE RODILLOS */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative">
                <div className="flex gap-3 justify-center">
                  {reelSymbols.map((symbol, reelIndex) => (
                    <div key={reelIndex} className="text-center">
                      {/* RODILLO INDIVIDUAL */}
                      <div className="w-16 h-24 bg-white rounded-lg border border-gray-300 overflow-hidden relative shadow-sm">
                        {/* SÍMBOLOS PRINCIPALES */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={isSpinning ? {
                            y: [-200, 200, -200],
                            opacity: [1, 0.3, 1],
                            rotate: [0, 180, 360],
                          } : winningSymbols ? {
                            scale: [1, 1.2, 1.1, 1],
                            y: [0, -5, 0],
                          } : {}}
                          transition={{
                            duration: isSpinning ? 0.15 : 1.2,
                            repeat: isSpinning ? Infinity : (winningSymbols ? 3 : 0),
                            delay: reelIndex * 0.2,
                            ease: isSpinning ? "linear" : "easeInOut"
                          }}
                        >
                          <div className="text-3xl select-none">
                            {symbol}
                          </div>
                        </motion.div>

                        {/* EFECTO DE GIRO */}
                        {isSpinning && (
                          <motion.div
                            className="absolute inset-0 flex flex-col items-center justify-center text-2xl opacity-20"
                            animate={{
                              y: [-400, 400],
                            }}
                            transition={{
                              duration: 0.08,
                              repeat: Infinity,
                              ease: "linear",
                              delay: reelIndex * 0.05
                            }}
                          >
                            {Array.from({ length: 10 }, (_, i) => (
                              <div key={i} className="my-4">
                                {getRandomSymbol()}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* LÍNEA DE PAGO */}
                <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent transform -translate-y-1/2 opacity-60"></div>
              </div>

              {/* Panel inferior */}
              <div className="mt-4 text-center">
                <div className="text-gray-600 text-sm font-medium">Línea de juego activa</div>
              </div>
            </div>
          </div>

          {/* CONTROLES */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* BOTÓN SPIN */}
            <motion.button
              onClick={spin}
              disabled={gameState.isSpinning || gameState.hasWon || gameState.balance < SPIN_COST}
              whileHover={(gameState.isSpinning || gameState.hasWon || gameState.balance < SPIN_COST) ? {} : { scale: 1.02 }}
              whileTap={(gameState.isSpinning || gameState.hasWon || gameState.balance < SPIN_COST) ? {} : { scale: 0.98 }}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 min-h-[60px] ${
                gameState.isSpinning
                  ? 'bg-orange-100 text-orange-600 cursor-not-allowed border border-orange-200'
                  : gameState.hasWon
                  ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-200'
                  : gameState.balance < SPIN_COST
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'telefonica-button-primary hover:shadow-md'
              }`}
            >
              {gameState.isSpinning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap size={18} />
                  </motion.div>
                  Girando...
                </>
              ) : gameState.hasWon ? (
                <>
                  <Trophy size={18} />
                  ¡Premio ganado!
                </>
              ) : gameState.balance < SPIN_COST ? (
                <>
                  <Wallet size={18} />
                  Saldo insuficiente
                </>
              ) : (
                <>
                  <Gem size={18} />
                  Iniciar juego (€{SPIN_COST})
                </>
              )}
            </motion.button>

            {/* BOTÓN DE RETIRO */}
            {gameState.canWithdraw && (
              <motion.button
                onClick={handleWithdraw}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 px-6 bg-green-600 text-white font-semibold text-sm rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg min-h-[60px] flex items-center justify-center gap-3"
              >
                <Crown size={18} />
                <span>Retirar €{gameState.winAmount.toLocaleString()}</span>
              </motion.button>
            )}
          </motion.div>

          {/* INFORMACIÓN DE SALDO */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="telefonica-card p-4 border-l-4 border-l-blue-600">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Wallet className="text-blue-600" size={16} />
                  <span className="font-medium text-gray-700">Saldo: €{gameState.balance.toLocaleString()}</span>
                </div>
                {gameState.hasWon && (
                  <div className="flex items-center gap-2">
                    <Trophy className="text-green-600" size={16} />
                    <span className="font-medium text-green-600">Premio: €{gameState.winAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Shield className="text-blue-600" size={16} />
                  <span className="font-medium text-gray-700">
                    Estado: {gameState.isAgeVerified ? 
                      <span className="text-green-600">Verificado</span> : 
                      <span className="text-orange-600">Pendiente</span>
                    }
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de verificación de edad */}
      <AgeVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={handleVerificationSuccess}
        withdrawAmount={gameState.winAmount}
        isVerifying={isVerifying}
        setIsVerifying={setIsVerifying}
      />
      </div>
    </div>
  );
}
'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Gem, Wallet, Shield, Crown } from 'lucide-react';
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
        toast.success(`¡JACKPOT ÉPICO! ¡Has ganado €${JACKPOT_AMOUNT.toLocaleString()}!`, {
          duration: 8000,
          icon: '🎰',
          style: {
            background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '18px',
            padding: '16px'
          }
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
    toast.success(`¡Felicidades! Has retirado €${gameState.winAmount.toLocaleString()} exitosamente.`, {
      duration: 6000,
      icon: '💰',
      style: {
        background: 'linear-gradient(45deg, #10b981, #34d399)',
        color: 'white',
        fontWeight: 'bold'
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Header Principal */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 w-full max-w-4xl"
      >
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-2xl shadow-2xl border border-cyan-400">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="text-cyan-300" size={32} />
            <h1 className="text-3xl md:text-4xl font-black tracking-wide">OPEN GATEWAY SLOTS</h1>
            <Shield className="text-cyan-300" size={32} />
          </div>
          <p className="text-lg text-cyan-100 mb-2">TRAGAPERRAS OPEN GATEWAY - JACKPOT €{JACKPOT_AMOUNT.toLocaleString()}</p>
          <p className="text-sm text-yellow-300 font-semibold bg-red-600/20 px-4 py-2 rounded-lg border border-red-400">
            📋 Demo de la API Age Verify Open Gateway - Nada es real
          </p>
        </div>
      </motion.div>

      <div className="w-full max-w-6xl mx-auto">
        {/* MÁQUINA PRINCIPAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl shadow-2xl p-6 mb-8 border-4 border-cyan-500"
        >
          {/* TRAGAPERRAS */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-blue-800 via-cyan-700 to-blue-900 rounded-3xl shadow-2xl p-8 border-6 border-blue-600 w-full max-w-4xl mx-auto">
              {/* Panel superior */}
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-white mb-3">OPEN GATEWAY SLOTS</h3>
                <div className="text-cyan-400 font-bold text-xl mb-2">JACKPOT GARANTIZADO</div>
                <div className="text-yellow-400 font-black text-2xl">€{JACKPOT_AMOUNT.toLocaleString()}</div>
              </div>

              {/* PANTALLA DE RODILLOS */}
              <div className="bg-black rounded-2xl p-6 shadow-inner border-4 border-cyan-500 relative">
                <div className="flex gap-4 justify-center">
                  {reelSymbols.map((symbol, reelIndex) => (
                    <div key={reelIndex} className="text-center">
                      {/* RODILLO INDIVIDUAL */}
                      <div className="w-24 h-36 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-xl border-3 border-cyan-400 overflow-hidden relative shadow-xl">
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
                          <div className="text-5xl select-none">
                            {symbol}
                          </div>
                        </motion.div>

                        {/* EFECTO DE GIRO */}
                        {isSpinning && (
                          <motion.div
                            className="absolute inset-0 flex flex-col items-center justify-center text-4xl opacity-20"
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
                <div className="absolute left-6 right-6 top-1/2 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -translate-y-1/2 rounded-full opacity-70"></div>
              </div>

              {/* Panel inferior */}
              <div className="mt-6 text-center">
                <div className="text-white text-lg font-bold">LÍNEA DE PAGO ACTIVA</div>
              </div>
            </div>
          </div>

          {/* CONTROLES */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* BOTÓN SPIN */}
            <motion.button
              onClick={spin}
              disabled={gameState.isSpinning || gameState.hasWon || gameState.balance < SPIN_COST}
              whileHover={(gameState.isSpinning || gameState.hasWon || gameState.balance < SPIN_COST) ? {} : { scale: 1.05 }}
              whileTap={(gameState.isSpinning || gameState.hasWon || gameState.balance < SPIN_COST) ? {} : { scale: 0.95 }}
              className={`flex-1 py-6 px-10 rounded-2xl font-bold text-xl md:text-2xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 min-h-[80px] ${
                gameState.isSpinning
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white animate-pulse cursor-not-allowed'
                  : gameState.hasWon
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-not-allowed'
                  : gameState.balance < SPIN_COST
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transform hover:shadow-cyan-500/50'
              }`}
            >
              {gameState.isSpinning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap size={24} />
                  </motion.div>
                  GIRANDO...
                </>
              ) : gameState.hasWon ? (
                <>
                  <Trophy className="text-yellow-300" size={24} />
                  ¡JACKPOT GANADO!
                </>
              ) : gameState.balance < SPIN_COST ? (
                <>
                  <Wallet size={24} />
                  SALDO INSUFICIENTE
                </>
              ) : (
                <>
                  <Gem size={24} />
                  GIRAR RODILLOS (€{SPIN_COST})
                </>
              )}
            </motion.button>

            {/* BOTÓN DE RETIRO */}
            {gameState.canWithdraw && (
              <motion.button
                onClick={handleWithdraw}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-6 px-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-xl rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg shadow-green-500/50 min-h-[80px] flex items-center justify-center"
              >
                <Crown size={24} />
                <span className="ml-2">RETIRAR €{gameState.winAmount.toLocaleString()}</span>
              </motion.button>
            )}
          </motion.div>

          {/* INFORMACIÓN DE SALDO */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-2xl p-6 border-2 border-purple-500">
              <div className="flex flex-wrap justify-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Wallet className="text-green-400" size={20} />
                  <span className="font-bold">Saldo: €{gameState.balance.toLocaleString()}</span>
                </div>
                {gameState.hasWon && (
                  <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={20} />
                    <span className="font-bold text-yellow-400">Premio: €{gameState.winAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Shield className="text-cyan-400" size={20} />
                  <span className="font-bold">Estado: {gameState.isAgeVerified ? 'Verificado' : 'Pendiente'}</span>
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
  );
}
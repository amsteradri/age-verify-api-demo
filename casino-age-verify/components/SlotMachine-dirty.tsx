'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Gem, Wallet, Shield, Crown, Coins } from 'lucide-react';
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
   * Maneja el resultado de la verificación de edad
   * Procesa el retiro exitoso o muestra error
   */
  const handleAgeVerificationComplete = useCallback((success: boolean) => {
    setShowVerificationModal(false);
    
    if (success) {
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
    } else {
      toast.error("Verificación de edad fallida. No se puede procesar el retiro.", {
        duration: 4000,
        icon: '❌'
      });
    }
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
      {/* Efectos de fondo elegantes */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-indigo-800/30 to-blue-900/50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(1,155,239,0.1)_0%,transparent_70%)]"></div>

      {/* Header Principal */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 w-full max-w-4xl relative z-10"
      >
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-2xl shadow-2xl border border-cyan-400">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="text-cyan-300" size={32} />
            <h1 className="text-3xl md:text-4xl font-black tracking-wide">OPEN GATEWAY SLOTS</h1>
            <Shield className="text-cyan-300" size={32} />
          </div>
          <p className="text-lg text-cyan-100">TRAGAPERRAS OPEN GATEWAY - JACKPOT €{JACKPOT_AMOUNT.toLocaleString()}</p>
        </div>
      </motion.div>

        {/* Panel de información */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-blue-400/30 max-w-4xl w-full"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Wallet className="text-blue-400" size={24} />
                <span className="text-white font-semibold">Saldo:</span>
                <span className="text-blue-400 font-black text-xl">
                  €{isClient ? gameState.balance.toLocaleString() : gameState.balance}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="text-cyan-400" size={24} />
                <span className="text-white font-semibold">Costo por giro:</span>
                <span className="text-cyan-400 font-black">€50</span>
              </div>
            </div>
            
            {gameState.hasWon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-blue-400/20 px-4 py-2 rounded-full border border-blue-400"
              >
                <Trophy className="text-blue-400" size={20} />
                <span className="text-blue-400 font-black">
                  ¡Ganaste €{isClient ? gameState.winAmount.toLocaleString() : gameState.winAmount}!
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* TRAGAPERRAS PRINCIPAL - GRANDE Y CENTRADA */}
        <div className="w-full max-w-7xl mx-auto">
          {/* Máquina Tragaperras Gigante */}
          <motion.div 
            className="w-full flex justify-center mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="bg-gradient-to-br from-blue-800 via-cyan-700 to-blue-900 rounded-3xl shadow-2xl p-8 border-6 border-blue-600 w-full max-w-4xl">
              
              {/* Panel superior */}
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-white mb-3">OPEN GATEWAY SLOTS</h3>
                <div className="text-cyan-400 font-bold text-xl mb-2">JACKPOT GARANTIZADO</div>
                <div className="text-yellow-400 font-black text-2xl">€1,000,000</div>
              </div>
              
              {/* PANTALLA PRINCIPAL DE LOS RODILLOS */}
              <div className="bg-black rounded-2xl p-6 shadow-inner border-4 border-cyan-500 relative">
                <div className="flex gap-4 justify-center">
                  {/* 5 RODILLOS GIGANTES */}
                  {reelSymbols.map((symbol, reelIndex) => (
                    <div key={reelIndex} className="relative">
                      {/* RODILLO INDIVIDUAL */}
                      <div className="w-24 h-36 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-xl border-3 border-cyan-400 overflow-hidden relative shadow-xl">
                        {/* Contenedor del símbolo principal */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className="text-5xl select-none"
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
                            {symbol}
                          </motion.div>
                        </div>
                        
                        {/* EFECTOS DE GIRO ESPECTACULARES */}
                        {isSpinning && (
                          <>
                            {/* Símbolos que pasan durante el giro */}
                            <motion.div
                              className="absolute inset-0 flex flex-col items-center justify-center text-4xl opacity-20"
                              animate={{
                                y: [400, -400],
                              }}
                              transition={{
                                duration: 0.08,
                                repeat: Infinity,
                                delay: reelIndex * 0.03,
                                ease: "linear"
                              }}
                            >
                              <div>🍒</div>
                              <div>🍋</div>
                              <div>⭐</div>
                              <div>💎</div>
                              <div>👑</div>
                              <div>💰</div>
                              <div>🔔</div>
                              <div>🍊</div>
                              <div>🍇</div>
                            </motion.div>
                            
                            {/* Efecto de desenfoque y velocidad */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30"></div>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                              animate={{
                                x: [-200, 200],
                              }}
                              transition={{
                                duration: 0.3,
                                repeat: Infinity,
                                delay: reelIndex * 0.1,
                              }}
                            />
                          </>
                        )}
                        
                        {/* EFECTOS DE VICTORIA ÉPICOS */}
                        {winningSymbols && symbol === '💰' && (
                          <>
                            {/* Brillo dorado espectacular */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-yellow-400/60 via-orange-400/40 to-red-400/60"
                              animate={{
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: reelIndex * 0.1,
                              }}
                            />
                            
                            {/* Borde pulsante */}
                            <motion.div
                              className="absolute inset-0 border-8 border-yellow-400 rounded-3xl"
                              animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: [0.95, 1.05, 0.95],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                              }}
                            />
                            
                            {/* Partículas de celebración */}
                            <div className="absolute inset-0 overflow-hidden">
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                  style={{
                                    left: `${20 + i * 10}%`,
                                    top: `${20 + i * 10}%`,
                                  }}
                                  animate={{
                                    y: [-20, -100],
                                    x: [0, Math.random() * 40 - 20],
                                    opacity: [1, 0],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2 + reelIndex * 0.1,
                                  }}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      

                    </div>
                  ))}
                </div>
                
                {/* LÍNEAS DE PAGO VISIBLES */}
                <div className="absolute left-6 right-6 top-1/2 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -translate-y-1/2 rounded-full opacity-70"></div>
              </div>
              
              {/* Panel inferior simplificado */}
              <div className="mt-6 text-center">
                <div className="text-white text-lg font-bold">LÍNEA DE PAGO ACTIVA</div>
              </div>
            </div>
          </motion.div>

          {/* CONTROLES CENTRALIZADOS */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            {/* BOTÓN DE SPIN PRINCIPAL - GIGANTE */}
            <motion.button
              onClick={spin}
              disabled={gameState.isSpinning || gameState.hasWon || gameState.balance < 50}
              className={`flex-1 py-6 px-10 rounded-2xl font-bold text-xl md:text-2xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 min-h-[80px] ${
                gameState.isSpinning
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white animate-pulse cursor-not-allowed'
                  : gameState.hasWon
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-not-allowed'
                  : gameState.balance < 50
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transform hover:shadow-cyan-500/50'
              }`}
              whileHover={(gameState.isSpinning || gameState.hasWon || gameState.balance < 50) ? {} : { scale: 1.05 }}
              whileTap={(gameState.isSpinning || gameState.hasWon || gameState.balance < 50) ? {} : { scale: 0.95 }}
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
              ) : gameState.balance < 50 ? (
                <>
                  <Wallet size={24} />
                  SALDO INSUFICIENTE
                </>
              ) : (
                <>
                  <Gem size={24} />
                  GIRAR RODILLOS (€50)
                </>
              )}
            </motion.button>

            {/* BOTÓN DE RETIRO */}
            {gameState.canWithdraw && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleWithdraw}
                className="flex-1 py-6 px-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-xl rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg shadow-green-500/50 min-h-[80px] flex items-center justify-center"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-4">
                  <Crown size={24} />
                  <div>
                    <div>RETIRAR JACKPOT</div>
                    <div className="text-lg opacity-90">€{isClient ? gameState.winAmount.toLocaleString() : gameState.winAmount}</div>
                  </div>
                </span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de verificación de edad */}
      <AgeVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => handleAgeVerificationComplete(true)}
        withdrawAmount={gameState.winAmount}
        isVerifying={false}
        setIsVerifying={() => {}}
      />
    </div>
  );
}
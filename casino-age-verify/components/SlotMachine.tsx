'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Zap, Trophy, DollarSign } from 'lucide-react';
import { GameState, SlotResult } from '../types';
import AgeVerificationModal from './AgeVerificationModal';
import toast from 'react-hot-toast';

const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🎰', '💰'];
const JACKPOT_SYMBOLS = ['💰', '💰', '💰'];
const INITIAL_BALANCE = 1000;

export default function SlotMachine() {
  const [gameState, setGameState] = useState<GameState>({
    balance: INITIAL_BALANCE,
    isSpinning: false,
    hasWon: false,
    winAmount: 0,
    canWithdraw: false,
    isAgeVerified: false,
  });

  const [currentSymbols, setCurrentSymbols] = useState(['🎰', '🎰', '🎰']);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Arreglar error de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generar resultado aleatorio de la máquina tragamonedas
  // ⭐ MODIFICADO: SIEMPRE TOCA EL JACKPOT PARA TESTING
  const generateSlotResult = useCallback((): SlotResult => {
    // 🎰 SIEMPRE JACKPOT DE €1,000,000 PARA TESTING
    return {
      symbols: JACKPOT_SYMBOLS,
      isWinning: true,
      winAmount: 1000000, // €1,000,000 jackpot garantizado!
    };
    
    /* Lógica original comentada para testing:
    // 1% probabilidad de jackpot
    if (Math.random() < 0.01) {
      return {
        symbols: JACKPOT_SYMBOLS,
        isWinning: true,
        winAmount: 1000000, // €1,000,000 jackpot!
      };
    }

    // 5% probabilidad de ganar premio menor
    if (Math.random() < 0.05) {
      const symbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      return {
        symbols: [symbol, symbol, symbol],
        isWinning: true,
        winAmount: Math.floor(Math.random() * 5000) + 500, // €500-€5000
      };
    }

    // Resultado perdedor
    const symbols = Array.from({ length: 3 }, () => 
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
    );

    return {
      symbols,
      isWinning: false,
      winAmount: 0,
    };
    */
  }, []);

  // Función para girar la máquina
  const spin = useCallback(() => {
    if (gameState.isSpinning || gameState.balance < 10) {
      if (gameState.balance < 10) {
        toast.error('¡No tienes suficiente saldo para jugar!');
      }
      return;
    }

    setGameState(prev => ({
      ...prev,
      isSpinning: true,
      balance: prev.balance - 10, // Cuesta €10 por giro
    }));

    // Animación de giro
    const spinInterval = setInterval(() => {
      setCurrentSymbols(
        Array.from({ length: 3 }, () => 
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
        )
      );
    }, 100);

    // Resultado final después de 2 segundos
    setTimeout(() => {
      clearInterval(spinInterval);
      
      const result = generateSlotResult();
      setCurrentSymbols(result.symbols);
      
      setGameState(prev => ({
        ...prev,
        isSpinning: false,
        hasWon: result.isWinning,
        winAmount: result.isWinning ? prev.winAmount + result.winAmount : prev.winAmount,
        canWithdraw: result.isWinning || prev.canWithdraw,
        balance: result.isWinning ? prev.balance + result.winAmount : prev.balance,
      }));

      if (result.isWinning) {
        if (result.winAmount >= 1000000) {
          toast.success(`🎰 ¡MEGA JACKPOT! ¡Ganaste €${isClient ? result.winAmount.toLocaleString() : result.winAmount}! 🎰`, {
            duration: 6000,
            style: {
              background: '#F59E0B',
              color: '#000',
              fontWeight: 'bold',
            },
          });
        } else {
          toast.success(`¡Ganaste €${isClient ? result.winAmount.toLocaleString() : result.winAmount}!`);
        }
      } else {
        toast.error('¡Inténtalo de nuevo!');
      }
    }, 2000);
  }, [gameState.isSpinning, gameState.balance, generateSlotResult]);

  // Función para intentar retirar dinero
  const attemptWithdraw = useCallback(() => {
    if (!gameState.canWithdraw || gameState.winAmount === 0) {
      toast.error('¡No tienes ganancias para retirar!');
      return;
    }
    
    setShowVerificationModal(true);
  }, [gameState.canWithdraw, gameState.winAmount]);

  // Manejar verificación de edad exitosa
  const handleVerificationSuccess = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isAgeVerified: true,
    }));
    
    toast.success(`¡Retiro exitoso! €${isClient ? gameState.winAmount.toLocaleString() : gameState.winAmount} transferidos a tu cuenta.`, {
      duration: 5000,
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: 'bold',
      },
    });
    
    // Reset del juego después del retiro
    setTimeout(() => {
      setGameState({
        balance: INITIAL_BALANCE,
        isSpinning: false,
        hasWon: false,
        winAmount: 0,
        canWithdraw: false,
        isAgeVerified: false,
      });
    }, 3000);
  }, [gameState.winAmount]);

  return (
    <div className="min-h-screen bg-casino-gradient flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header del Casino */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-6xl font-bold text-transparent bg-clip-text bg-gold-gradient mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎰 ROYAL CASINO 🎰
          </motion.h1>
          <p className="text-white text-xl opacity-80">
            🎰 ¡JACKPOT GARANTIZADO DE €1,000,000! 🎰
          </p>
          <p className="text-yellow-300 text-lg mt-2">
            🎆 Demo de Verificación de Edad - ¡Cada giro es ganador! 🎆
          </p>
        </div>

        {/* Máquina Tragamonedas */}
        <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-3xl p-8 shadow-2xl border-4 border-yellow-300">
          {/* Pantalla de balance */}
          <div className="bg-black rounded-lg p-4 mb-6 text-center">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Coins className="text-yellow-400" />
                <span className="text-xl font-bold">
                  Saldo: €{isClient ? gameState.balance.toLocaleString() : gameState.balance}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="text-green-400" />
                <span className="text-xl font-bold">
                  Ganancias: €{isClient ? gameState.winAmount.toLocaleString() : gameState.winAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Pantalla de símbolos */}
          <div className="bg-black rounded-lg p-8 mb-6">
            <div className="flex justify-center gap-4">
              {currentSymbols.map((symbol, index) => (
                <motion.div
                  key={index}
                  className="w-24 h-24 bg-white rounded-lg flex items-center justify-center text-6xl shadow-inner"
                  animate={gameState.isSpinning ? { 
                    rotateY: [0, 360],
                    scale: [1, 0.8, 1]
                  } : {}}
                  transition={{ 
                    duration: 0.5, 
                    repeat: gameState.isSpinning ? Infinity : 0 
                  }}
                >
                  {symbol}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={spin}
              disabled={gameState.isSpinning || gameState.balance < 10}
              className="px-8 py-4 bg-red-gradient text-white font-bold text-xl rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={gameState.isSpinning ? { 
                boxShadow: ['0 0 20px #DC2626', '0 0 40px #DC2626', '0 0 20px #DC2626'] 
              } : {}}
            >
              <Zap className={gameState.isSpinning ? 'animate-spin' : ''} />
              {gameState.isSpinning ? 'GIRANDO...' : 'GIRAR (€10)'}
            </motion.button>

            <motion.button
              onClick={attemptWithdraw}
              disabled={!gameState.canWithdraw || gameState.winAmount === 0}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={{ scale: gameState.canWithdraw ? 1.05 : 1 }}
              whileTap={{ scale: gameState.canWithdraw ? 0.95 : 1 }}
              animate={gameState.canWithdraw && gameState.winAmount > 0 ? { 
                boxShadow: ['0 0 20px #059669', '0 0 30px #059669'] 
              } : {}}
            >
              <DollarSign />
              RETIRAR
            </motion.button>
          </div>

          {/* Mensaje de jackpot */}
          <AnimatePresence>
            {gameState.hasWon && gameState.winAmount >= 1000000 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="mt-6 text-center"
              >
                <div className="bg-gold-gradient text-black font-bold text-3xl p-6 rounded-lg animate-pulse-fast border-4 border-yellow-300 shadow-2xl">
                  � ¡MEGA JACKPOT! 🎰<br/>
                  ¡€{isClient ? gameState.winAmount.toLocaleString() : gameState.winAmount}!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instrucciones */}
          <div className="mt-6 text-center text-sm text-gray-800 bg-white bg-opacity-10 rounded-lg p-4">
            <p className="font-bold text-yellow-900 mb-2">🎰 DEMO DE VERIFICACIÓN DE EDAD 🎰</p>
            <p>• 🎯 <strong>Costo por giro: €10</strong></p>
            <p>• 💰 <strong>¡JACKPOT GARANTIZADO: €1,000,000!</strong></p>
            <p>• 🔒 <strong>Para retirar necesitas verificar tu edad (18+)</strong></p>
            <p>• 📱 <strong>Verificación real con Teléfonica Open Gateway</strong></p>
          </div>
        </div>

        {/* Modal de Verificación de Edad */}
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
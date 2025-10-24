'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Users, CheckCircle, XCircle, AlertCircle, Building2, Shield, FileCheck } from 'lucide-react';
import Image from 'next/image';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { Person, VerificationResult, VerificationSummary } from '@/types';

export default function AgeVerificationSystem() {
  const [people, setPeople] = useState<Person[]>([]);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentVerifying, setCurrentVerifying] = useState<string>('');

  /**
   * Maneja la subida y parseo del archivo CSV
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Por favor selecciona un archivo CSV válido');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          const rawData = result.data as any[];
          
          // Mapear columnas tanto en inglés como en español
          const parsedPeople = rawData.map(row => ({
            name: row.name || row.nombre || '',
            phoneNumber: row.phoneNumber || row.telefono || ''
          })).filter(person => person.name && person.phoneNumber);

          if (parsedPeople.length === 0) {
            toast.error('No se encontraron registros válidos. Asegúrate de que el CSV tenga columnas "name/nombre" y "phoneNumber/telefono"');
            return;
          }

          setPeople(parsedPeople);
          setResults([]);
          setSummary(null);
          
          toast.success(`✅ ${parsedPeople.length} personas cargadas exitosamente`);
          
          if (parsedPeople.length !== rawData.length) {
            toast.error(`⚠️ ${rawData.length - parsedPeople.length} registros omitidos por datos incompletos`);
          }
        } catch (error) {
          console.error('Error parsing CSV:', error);
          toast.error('Error al procesar el archivo CSV');
        }
      },
      error: (error) => {
        console.error('Error reading CSV:', error);
        toast.error('Error al leer el archivo CSV');
      }
    });
  }, []);

  /**
   * Inicia la verificación masiva de edades
   */
  const handleVerifyAll = useCallback(async () => {
    if (people.length === 0) {
      toast.error('Primero carga un archivo CSV con la lista de invitados');
      return;
    }

    setIsVerifying(true);
    setResults([]);
    setSummary(null);

    try {
      toast.loading(`🎭 Verificando edad de ${people.length} personas...`, { 
        duration: 2000 
      });

      const response = await fetch('/api/verify-ages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ people }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la verificación');
      }

      setResults(data.results);
      setSummary(data.summary);

      toast.success(
        `✅ Verificación completada: ${data.summary.canEnter} pueden entrar, ${data.summary.cannotEnter} no pueden entrar`
      );

    } catch (error) {
      console.error('Error en verificación masiva:', error);
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsVerifying(false);
    }
  }, [people]);

  /**
   * Descarga los resultados como CSV
   */
  const downloadResults = useCallback(() => {
    if (results.length === 0) return;

    const csvData = results.map(result => ({
      nombre: result.name,
      telefono: result.phoneNumber,
      email: result.email || '',
      puede_entrar: result.canEnter ? 'SÍ' : 'NO',
      edad_verificada: result.ageCheck === 'true' ? 'SÍ' : 'NO',
      documento_verificado: result.verifiedStatus ? 'SÍ' : 'NO',
      puntuacion_confianza: result.identityMatchScore || '',
      estado: result.status,
      error: result.error || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `verificacion_edad_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">


      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Header Principal */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 w-full max-w-5xl"
        >
          <div className="telefonica-card p-8 shadow-xl border-l-4 border-l-[var(--telefonica-blue)]">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield className="text-[var(--telefonica-blue)]" size={32} />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
                Demo Age Verification - Verificación Masiva de Edades
              </h1>
              <Building2 className="text-[var(--telefonica-blue)]" size={32} />
            </div>
            <p className="text-base text-gray-600 mb-6 font-medium">
              Procesamiento masivo de verificaciones de edad
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-[var(--telefonica-blue)] text-sm font-semibold rounded-lg border border-blue-200">
              <span className="w-2 h-2 bg-[var(--telefonica-blue)] rounded-full mr-2"></span>
              Entorno de Demostración
            </div>
          </div>
        </motion.div>

        {/* Sección principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="telefonica-card p-10 mb-8 w-full max-w-5xl mx-auto shadow-xl"
        >
          {/* Upload CSV */}
          {people.length === 0 && (
            <div className="text-center mb-8">
              <div className="border-3 border-dashed border-blue-300 rounded-xl p-12 bg-blue-50">
                <Upload className="mx-auto h-20 w-20 text-[var(--telefonica-blue)] mb-6" />
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Cargar lista de usuarios
                </h3>
                <p className="text-gray-600 mb-6 text-xl">
                  Seleccione un archivo CSV con las columnas: name/nombre, phoneNumber/telefono, email (opcional)
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="telefonica-button-primary inline-flex items-center cursor-pointer text-xl py-4 px-8"
                >
                  <Upload size={24} className="mr-3" />
                  Seleccionar archivo CSV
                </label>
              </div>
            </div>
          )}

          {/* Lista cargada */}
          {people.length > 0 && results.length === 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Users className="text-[var(--telefonica-blue)]" size={32} />
                  <h3 className="text-3xl font-bold text-gray-800">
                    {people.length} usuarios cargados
                  </h3>
                </div>
                <button
                  onClick={() => setPeople([])}
                  className="text-sm text-gray-500 hover:text-[var(--telefonica-blue)] transition-colors"
                >
                  Limpiar lista
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-6">
                {people.slice(0, 10).map((person, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="font-medium text-black">{person.name}</span>
                    <span className="text-sm text-gray-600">{person.phoneNumber}</span>
                  </div>
                ))}
                {people.length > 10 && (
                  <div className="text-center text-gray-500 text-sm mt-2">
                    ... y {people.length - 10} más
                  </div>
                )}
              </div>

              <button
                onClick={handleVerifyAll}
                disabled={isVerifying}
                className="w-full telefonica-button-primary py-6 px-8 text-xl rounded-xl flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Shield size={24} />
                    </motion.div>
                    Procesando verificaciones...
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} />
                    Iniciar verificación masiva
                  </>
                )}
              </button>
            </div>
          )}

          {/* Resultados */}
          {results.length > 0 && summary && (
            <div>
              {/* Resumen */}
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                  <FileCheck className="text-[var(--telefonica-blue)]" size={32} />
                  Resultados de verificación
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                    <div className="text-sm text-blue-600">Total</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{summary.canEnter}</div>
                    <div className="text-sm text-green-600">Verificados</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{summary.cannotEnter}</div>
                    <div className="text-sm text-red-600">No verificados</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{summary.errors}</div>
                    <div className="text-sm text-orange-600">Errores</div>
                  </div>
                </div>

                <button
                  onClick={downloadResults}
                  className="telefonica-button-secondary mb-6"
                >
                  Descargar resultados CSV
                </button>
              </div>

              {/* Lista detallada */}
              <div className="max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg mb-2 ${
                      result.canEnter 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.canEnter ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <XCircle className="text-red-600" size={20} />
                      )}
                      <div>
                        <div className="font-medium text-black">{result.name}</div>
                        <div className="text-sm text-gray-600">{result.phoneNumber}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${result.canEnter ? 'text-green-600' : 'text-red-600'}`}>
                        {result.canEnter ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
                      </div>
                      {result.identityMatchScore && (
                        <div className="text-sm text-gray-600">
                          Confianza: {result.identityMatchScore}%
                        </div>
                      )}
                      {result.error && (
                        <div className="text-sm text-red-600">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => {
                  setResults([]);
                  setSummary(null);
                  setPeople([]);
                }}
                className="mt-4 w-full py-3 px-4 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                Nueva verificación
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
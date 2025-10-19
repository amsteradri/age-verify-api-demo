'use client';

import React, { useState } from 'react';
import { CustomerFormData } from '@/types';

interface KycFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isLoading: boolean;
}

const KycForm: React.FC<KycFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    phoneNumber: '+34696567000',
    idDocument: '12345678Z',
    givenName: 'Carlos',
    familyName: 'García López',
    birthdate: '1985-03-15',
    email: 'carlos.garcia@email.com',
    gender: 'MALE',
    address: 'Calle Mayor 123, 2º A',
    postalCode: '28013',
    country: 'ES'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit(formData);
    }
  };

  const clearField = (fieldName: keyof CustomerFormData) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: fieldName === 'gender' ? '' : ''
    }));
  };

  // Función para generar datos aleatorios
  const generateRandomData = () => {
    const names = ['Ana', 'Carlos', 'María', 'José', 'Carmen', 'Antonio', 'Isabel', 'Manuel', 'Pilar', 'Francisco'];
    const surnames = ['García López', 'Martínez Silva', 'González Ruiz', 'Rodríguez Moreno', 'López Jiménez', 'Hernández Díaz', 'Pérez Castro', 'Sánchez Romero', 'Ruiz Herrera', 'Vargas Ortega'];
    const addresses = ['Calle Mayor 123', 'Avenida de la Paz 45', 'Plaza España 67', 'Calle Gran Vía 89', 'Paseo de la Castellana 234', 'Calle Alcalá 156', 'Avenida América 78'];
    const postalCodes = ['28013', '08001', '41001', '46001', '50001', '15001', '29001'];
    const countries = ['ES', 'FR', 'IT', 'DE', 'PT'];
    const genders: ('MALE' | 'FEMALE' | 'OTHER')[] = ['MALE', 'FEMALE', 'OTHER'];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    const randomPostalCode = postalCodes[Math.floor(Math.random() * postalCodes.length)];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomGender = genders[Math.floor(Math.random() * genders.length)];

    // Generar fecha de nacimiento aleatoria (entre 18 y 80 años)
    const today = new Date();
    const minAge = 18;
    const maxAge = 80;
    const birthYear = today.getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1; // Usamos 28 para evitar problemas con febrero
    const randomBirthdate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;

    // Generar DNI aleatorio
    const randomNumber = Math.floor(Math.random() * 99999999);
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const randomDNI = `${randomNumber.toString().padStart(8, '0')}${letters[randomNumber % 23]}`;

    setFormData({
      phoneNumber: '+34696567000', // Mantenemos el teléfono fijo para las pruebas
      idDocument: randomDNI,
      givenName: randomName,
      familyName: randomSurname,
      birthdate: randomBirthdate,
      email: `${randomName.toLowerCase()}.${randomSurname.toLowerCase().split(' ')[0]}@email.com`,
      gender: randomGender,
      address: `${randomAddress}, ${Math.floor(Math.random() * 5) + 1}º ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
      postalCode: randomPostalCode,
      country: randomCountry
    });
  };

  // Función para limpiar todos los campos excepto el teléfono
  const clearAllFields = () => {
    setFormData({
      phoneNumber: '+34696567000', // Mantenemos el teléfono
      idDocument: '',
      givenName: '',
      familyName: '',
      birthdate: '',
      email: '',
      gender: '',
      address: '',
      postalCode: '',
      country: ''
    });
  };

  return (
    <div className="telefonica-card p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Información del Cliente
          </h2>
        </div>
        <p className="text-gray-600 leading-relaxed mb-4">
          Ingrese los datos del cliente que desea verificar. Solo el número de teléfono es obligatorio.
          Los demás campos son opcionales y se verificarán únicamente si se proporcionan.
        </p>
        
        {/* Botones de utilidad */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generateRandomData}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            🎲 Generar Datos Aleatorios
          </button>
          
          <button
            type="button"
            onClick={clearAllFields}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            🗑️ Limpiar Todo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Teléfono - Obligatorio */}
        <div>
          <label className="telefonica-label">
            📱 Número de Teléfono *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="Ej: +34612345678 (formato internacional)"
            className="telefonica-input"
          />
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v3a.75.75 0 001.5 0v-3A.75.75 0 009 9z" clipRule="evenodd" />
            </svg>
            Formato internacional requerido (código país + número)
          </p>
        </div>

        {/* Grid de 2 columnas para desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Documento de Identidad */}
          <div>
            <label className="telefonica-label">
              🆔 Documento de Identidad
              <button
                type="button"
                onClick={() => clearField('idDocument')}
                className="clear-button"
              >
                (limpiar)
              </button>
            </label>
            <input
              type="text"
              name="idDocument"
              value={formData.idDocument}
              onChange={handleChange}
              placeholder="Ej: 12345678A, DNI, NIE, Pasaporte..."
              className="telefonica-input"
            />
          </div>

          {/* Género */}
          <div>
            <label className="telefonica-label">
              👤 Género
              <button
                type="button"
                onClick={() => clearField('gender')}
                className="clear-button"
              >
                (limpiar)
              </button>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="telefonica-select"
            >
              <option value="">-- Seleccionar género --</option>
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Femenino</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          {/* Nombre */}
          <div>
            <label className="telefonica-label">
              👨 Nombre
              <button
                type="button"
                onClick={() => clearField('givenName')}
                className="clear-button"
              >
                (limpiar)
              </button>
            </label>
            <input
              type="text"
              name="givenName"
              value={formData.givenName}
              onChange={handleChange}
              placeholder="Ej: Juan, María, Antonio..."
              className="telefonica-input"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="telefonica-label">
              👥 Apellidos
              <button
                type="button"
                onClick={() => clearField('familyName')}
                className="clear-button"
              >
                (limpiar)
              </button>
            </label>
            <input
              type="text"
              name="familyName"
              value={formData.familyName}
              onChange={handleChange}
              placeholder="Ej: García López, Pérez Martínez..."
              className="telefonica-input"
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="telefonica-label">
              📅 Fecha de Nacimiento
              <button
                type="button"
                onClick={() => clearField('birthdate')}
                className="clear-button"
              >
                (limpiar)
              </button>
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="telefonica-input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Email */}
          <div>
            <label className="telefonica-label">
              ✉️ Correo Electrónico
              <button
                type="button"
                onClick={() => clearField('email')}
                className="clear-button"
              >
                (limpiar)
              </button>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: juan.perez@email.com"
              className="telefonica-input"
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="telefonica-label">
            🏠 Dirección Completa
            <button
              type="button"
              onClick={() => clearField('address')}
              className="clear-button"
            >
              (limpiar)
            </button>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Ej: Calle Gran Vía 123, Avenida de la Paz 45..."
            className="telefonica-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código Postal */}
          <div>
            <label className="telefonica-label">
              📮 Código Postal
              <button
                type="button"
                onClick={() => clearField('postalCode')}
                className="clear-button"
              >
                (limpiar)
              </button>
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Ej: 28013, 08001, 41001..."
              className="telefonica-input"
            />
          </div>

          {/* País */}
          <div>
            <label className="telefonica-label">
              🌍 País (Código ISO)
              <button
                type="button"
                onClick={() => clearField('country')}
                className="clear-button"
              >
                (limpiar)
              </button>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Ej: ES, FR, IT, DE..."
              maxLength={2}
              className="telefonica-input"
              style={{ textTransform: 'uppercase' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Código de 2 letras (ISO 3166-1 alpha-2)
            </p>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="telefonica-button"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando identidad...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                🔍 Verificar Identidad con Open Gateway
              </span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v3a.75.75 0 001.5 0v-3A.75.75 0 009 9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">💡 Información importante</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Solo el número de teléfono es obligatorio. Los demás campos son opcionales y se verificarán 
              únicamente si se proporcionan. La verificación se realiza de forma segura a través de la red de Telefónica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycForm;
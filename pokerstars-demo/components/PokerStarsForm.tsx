'use client';

import React, { useState } from 'react';
import { CustomerFormData } from '@/types';

interface PokerStarsFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isLoading: boolean;
}

const PokerStarsForm: React.FC<PokerStarsFormProps> = ({ onSubmit, isLoading }) => {
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

  // Generate random test data
  const generateRandomData = () => {
    const names = ['Ana', 'Carlos', 'María', 'José', 'Carmen', 'Antonio'];
    const surnames = ['García López', 'Martínez Silva', 'González Ruiz', 'Rodríguez Moreno'];
    const addresses = ['Calle Mayor 123', 'Avenida de la Paz 45', 'Plaza España 67'];
    const postalCodes = ['28013', '08001', '41001', '46001'];
    const countries = ['ES', 'FR', 'IT', 'DE'];
    const genders: ('MALE' | 'FEMALE' | 'OTHER')[] = ['MALE', 'FEMALE', 'OTHER'];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    const randomPostalCode = postalCodes[Math.floor(Math.random() * postalCodes.length)];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomGender = genders[Math.floor(Math.random() * genders.length)];

    // Generate random birth date (18-80 years old)
    const today = new Date();
    const birthYear = today.getFullYear() - Math.floor(Math.random() * 62) - 18;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const randomBirthdate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;

    // Generate random DNI
    const randomNumber = Math.floor(Math.random() * 99999999);
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const randomDNI = `${randomNumber.toString().padStart(8, '0')}${letters[randomNumber % 23]}`;

    setFormData({
      phoneNumber: '+34696567000',
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

  // Clear all fields except phone
  const clearAllFields = () => {
    setFormData({
      phoneNumber: '+34696567000',
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
    <div className="space-y-6">
      {/* Utility buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={generateRandomData}
          className="inline-flex items-center px-6 py-3 text-sm font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg border border-yellow-600"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          🎲 GENERATE DATA
        </button>
        
        <button
          type="button"
          onClick={clearAllFields}
          className="inline-flex items-center px-6 py-3 text-sm font-bold text-gray-300 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-900 transition-all duration-300 border border-gray-600"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          🗑️ CLEAR
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phone Number - Required */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-300 mb-2">
            📱 MOBILE PHONE *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="Ex: +34612345678"
            className="pokerstars-input w-full px-4 py-3 text-white placeholder-gray-400 bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
          <p className="text-xs text-gray-400 flex items-center">
            <svg className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v3a.75.75 0 001.5 0v-3A.75.75 0 009 9z" clipRule="evenodd" />
            </svg>
            Verification through your mobile carrier
          </p>
        </div>

        {/* Grid for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ID Document */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              🆔 ID DOCUMENT
              <button
                type="button"
                onClick={() => clearField('idDocument')}
                className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
              >
                (clear)
              </button>
            </label>
            <input
              type="text"
              name="idDocument"
              value={formData.idDocument}
              onChange={handleChange}
              placeholder="DNI, NIE or Passport"
              className="pokerstars-input w-full px-4 py-3 text-white placeholder-gray-400 bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              👤 GENDER
              <button
                type="button"
                onClick={() => clearField('gender')}
                className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
              >
                (clear)
              </button>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="pokerstars-input w-full px-4 py-3 text-white bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            >
              <option value="" className="bg-gray-800">-- Select --</option>
              <option value="MALE" className="bg-gray-800">Male</option>
              <option value="FEMALE" className="bg-gray-800">Female</option>
              <option value="OTHER" className="bg-gray-800">Other</option>
            </select>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              👨 FIRST NAME
              <button
                type="button"
                onClick={() => clearField('givenName')}
                className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
              >
                (clear)
              </button>
            </label>
            <input
              type="text"
              name="givenName"
              value={formData.givenName}
              onChange={handleChange}
              placeholder="Your first name"
              className="pokerstars-input w-full px-4 py-3 text-white placeholder-gray-400 bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              👥 LAST NAME
              <button
                type="button"
                onClick={() => clearField('familyName')}
                className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
              >
                (clear)
              </button>
            </label>
            <input
              type="text"
              name="familyName"
              value={formData.familyName}
              onChange={handleChange}
              placeholder="Your last name"
              className="pokerstars-input w-full px-4 py-3 text-white placeholder-gray-400 bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              📅 BIRTH DATE
              <button
                type="button"
                onClick={() => clearField('birthdate')}
                className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
              >
                (clear)
              </button>
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="pokerstars-input w-full px-4 py-3 text-white bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              ✉️ EMAIL
              <button
                type="button"
                onClick={() => clearField('email')}
                className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
              >
                (clear)
              </button>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="pokerstars-input w-full px-4 py-3 text-white placeholder-gray-400 bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-300 mb-2">
            🏠 ADDRESS
            <button
              type="button"
              onClick={() => clearField('address')}
              className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
            >
              (clear)
            </button>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Complete address"
            className="pokerstars-input w-full px-4 py-3 text-white placeholder-gray-400 bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Postal Code */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              📮 POSTAL CODE
              <button
                type="button"
                onClick={() => clearField('postalCode')}
                className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
              >
                (clear)
              </button>
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="28013, 08001..."
              className="pokerstars-input w-full px-4 py-3 text-white placeholder-gray-400 bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              🌍 COUNTRY (ISO)
              <button
                type="button"
                onClick={() => clearField('country')}
                className="ml-2 text-xs font-medium text-red-400 hover:text-red-300"
              >
                (clear)
              </button>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="ES, FR, IT..."
              maxLength={2}
              className="pokerstars-input w-full px-4 py-3 text-white placeholder-gray-400 bg-gray-800/50 border border-gray-600 rounded-xl backdrop-filter backdrop-blur-lg transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 uppercase"
            />
          </div>
        </div>

        {/* Botón de envío */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-8 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white font-bold text-lg rounded-full hover:from-red-700 hover:via-red-800 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="loading-spinner mr-3"></div>
                🎰 VERIFICANDO ELEGIBILIDAD...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <img src="/images/pokerstars-logo.png" alt="PokerStars" className="w-6 h-6 mr-3" />
                COMENZAR A JUGAR EN POKERSTARS
                <img src="/images/pokerstars-logo.png" alt="PokerStars" className="w-6 h-6 ml-3" />
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Security Information */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30 backdrop-blur-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v3a.75.75 0 001.5 0v-3A.75.75 0 009 9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a5 5 0 0110 0z" clipRule="evenodd" />
              </svg>
              🛡️ 100% SECURE REGISTRATION
            </h4>
            <p className="text-gray-300 leading-relaxed text-sm">
              Your information is protected with advanced cybersecurity technology. 
              Verification is performed instantly through <strong className="text-blue-400">Telefónica Open Gateway</strong> secure network, 
              complying with all data protection regulations and online gaming regulations.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Instant verification</span>
              </div>
              <div className="flex items-center text-blue-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>Regulatory compliance</span>
              </div>
              <div className="flex items-center text-yellow-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span>GDPR protection</span>
              </div>
              <div className="flex items-center text-red-300">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                <span>18+ only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerStarsForm;
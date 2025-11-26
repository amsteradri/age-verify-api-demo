'use client';

import React from 'react';
import { PokerStarsVerificationResult } from '@/types';

interface PokerStarsResultsProps {
  result: PokerStarsVerificationResult;
  onReset: () => void;
}

export default function PokerStarsResults({ result, onReset }: PokerStarsResultsProps) {
  const { kycResult, ageResult, canPlay } = result;

  const formatMatch = (match: any) => {
    if (typeof match === 'boolean') {
      return match ? 'VERIFIED' : 'NOT VERIFIED';
    }
    if (match === 'true') return 'VERIFIED';
    if (match === 'false') return 'NOT VERIFIED';
    if (match === 'not_available') return 'NOT AVAILABLE';
    return 'N/A';
  };

  const getStatusClass = (match: any) => {
    if (match === 'true' || match === true) return 'text-green-600';
    if (match === 'false' || match === false) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {canPlay ? 'REGISTRATION AUTHORIZED' : 'REGISTRATION NOT AUTHORIZED'}
        </h2>
        
        <div className={`inline-flex items-center px-6 py-2 rounded-lg text-lg font-medium ${canPlay ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {canPlay ? 'VERIFICATION SUCCESSFUL' : 'VERIFICATION FAILED'}
        </div>
        
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          {result.overallMessage}
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* KYC Verification */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Verification</h3>
          <p className="text-sm text-gray-600 mb-4">Identity validation</p>
          
          <div className="space-y-3">
            {kycResult ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">First Name:</span>
                  <span className={`font-medium ${getStatusClass(kycResult.givenNameMatch)}`}>
                    {formatMatch(kycResult.givenNameMatch)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Last Name:</span>
                  <span className={`font-medium ${getStatusClass(kycResult.familyNameMatch)}`}>
                    {formatMatch(kycResult.familyNameMatch)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Postal Code:</span>
                  <span className={`font-medium ${getStatusClass(kycResult.postalCodeMatch)}`}>
                    {formatMatch(kycResult.postalCodeMatch)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Birth Date:</span>
                  <span className={`font-medium ${getStatusClass(kycResult.birthdateMatch)}`}>
                    {formatMatch(kycResult.birthdateMatch)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">KYC Score:</span>
                    <span className="text-gray-900 font-bold">{result.kycScore}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <span className="text-red-600 font-medium">KYC verification error</span>
              </div>
            )}
          </div>
        </div>

        {/* Age Verification */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Control</h3>
          <p className="text-sm text-gray-600 mb-4">18+ verification</p>
          
          <div className="space-y-3">
            {ageResult ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Over 18 years:</span>
                  <span className={`font-medium ${getStatusClass(ageResult.ageCheck)}`}>
                    {ageResult.ageCheck === 'true' ? 'CONFIRMED' : ageResult.ageCheck === 'false' ? 'NOT VERIFIED' : 'NOT AVAILABLE'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Verification Status:</span>
                  <span className={`font-medium ${ageResult.verifiedStatus ? 'text-green-600' : 'text-red-600'}`}>
                    {ageResult.verifiedStatus ? 'VERIFIED' : 'NOT VERIFIED'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <span className="text-red-600 font-medium">Age verification error</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Message and Actions */}
      <div className="text-center">
        {canPlay ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-800 font-medium text-lg">Verification completed successfully</p>
            <p className="text-green-700 mt-2">Your account has been verified and you can proceed to play.</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800 font-medium text-lg">Verification incomplete</p>
            <p className="text-red-700 mt-2">Identity or age verification could not be completed.</p>
            <p className="text-red-600 text-sm mt-1">
              Please ensure that the data entered matches exactly with your mobile operator records.
            </p>
          </div>
        )}

        <button
          onClick={onReset}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          New Registration
        </button>
      </div>
    </div>
  );
}
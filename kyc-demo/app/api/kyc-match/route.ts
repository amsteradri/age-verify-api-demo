import { NextRequest, NextResponse } from 'next/server';
import { createCibaKycClient } from '@/lib/ciba';
import { KycMatchRequest, KycMatchResponse, VerificationResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: KycMatchRequest = await request.json();
    
    if (!body.phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    // Validar formato del número de teléfono
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(body.phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use international format (+34696567000)' },
        { status: 400 }
      );
    }

    // Verificar que al menos un campo adicional está presente (además del phoneNumber)
    const fieldsToCheck = Object.keys(body).filter(key => 
      key !== 'phoneNumber' && body[key as keyof KycMatchRequest] !== undefined && body[key as keyof KycMatchRequest] !== ''
    );
    
    if (fieldsToCheck.length === 0) {
      return NextResponse.json(
        { error: 'At least one field besides phoneNumber must be provided for KYC verification' },
        { status: 400 }
      );
    }

    console.log(`🔍 Iniciando verificación KYC para: ${body.phoneNumber}`);
    console.log(`📋 Campos a verificar: ${fieldsToCheck.join(', ')}`);

    // Crear cliente CIBA y ejecutar flujo completo
    const cibaClient = createCibaKycClient();
    const result: KycMatchResponse = await cibaClient.performFullKycVerification(
      body.phoneNumber,
      body
    );

    // Log del resultado para debugging
    console.log('📊 Resultado de verificación KYC:', result);

    // Procesar resultado para interfaz de usuario
    const verificationResult = processKycResult(result, fieldsToCheck);

    return NextResponse.json(verificationResult);

  } catch (error) {
    console.error('💥 Error en verificación KYC:', error);
    
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        statusCode = 401;
        errorMessage = 'Credenciales de API inválidas';
      } else if (error.message.includes('403')) {
        statusCode = 403;
        errorMessage = 'Sin permisos para verificar este número de teléfono o datos requeridos faltantes';
      } else if (error.message.includes('404')) {
        statusCode = 404;
        errorMessage = 'Servicio de verificación KYC no disponible';
      } else if (error.message.includes('422')) {
        statusCode = 422;
        errorMessage = 'Datos de verificación inválidos';
      } else if (error.message.includes('INVALID_PARAM_COMBINATION')) {
        statusCode = 400;
        errorMessage = 'Combinación de parámetros inválida';
      } else if (error.message.includes('ID_DOCUMENT_REQUIRED')) {
        statusCode = 403;
        errorMessage = 'Documento de identidad requerido para esta verificación';
      } else if (error.message.includes('ID_DOCUMENT_MISMATCH')) {
        statusCode = 403;
        errorMessage = 'El documento de identidad no coincide con el número de teléfono';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        isVerified: false,
        overallScore: 0
      },
      { status: statusCode }
    );
  }
}

/**
 * Procesa el resultado de KYC para crear un resultado más amigable para la UI
 */
function processKycResult(result: KycMatchResponse, requestedFields: string[]): VerificationResult {
  const verifiedFields: string[] = [];
  const failedFields: string[] = [];
  const unavailableFields: string[] = [];
  
  let totalScore = 0;
  let scoreCount = 0;
  let trueMatches = 0;
  let totalChecks = 0;

  // Mapear campos de request a campos de response
  const fieldMapping: Record<string, string> = {
    'idDocument': 'idDocumentMatch',
    'name': 'nameMatch',
    'givenName': 'givenNameMatch',
    'familyName': 'familyNameMatch',
    'nameKanaHankaku': 'nameKanaHankakuMatch',
    'nameKanaZenkaku': 'nameKanaZenkakuMatch',
    'middleNames': 'middleNamesMatch',
    'familyNameAtBirth': 'familyNameAtBirthMatch',
    'address': 'addressMatch',
    'streetName': 'streetNameMatch',
    'streetNumber': 'streetNumberMatch',
    'postalCode': 'postalCodeMatch',
    'region': 'regionMatch',
    'locality': 'localityMatch',
    'country': 'countryMatch',
    'houseNumberExtension': 'houseNumberExtensionMatch',
    'birthdate': 'birthdateMatch',
    'email': 'emailMatch',
    'gender': 'genderMatch'
  };

  // Procesar cada campo solicitado
  requestedFields.forEach(field => {
    const matchField = fieldMapping[field];
    if (matchField && result[matchField as keyof KycMatchResponse]) {
      const matchValue = result[matchField as keyof KycMatchResponse] as string;
      totalChecks++;
      
      if (matchValue === 'true') {
        verifiedFields.push(field);
        trueMatches++;
        totalScore += 100;
        scoreCount++;
      } else if (matchValue === 'false') {
        failedFields.push(field);
        // Buscar score asociado si existe
        const scoreField = matchField.replace('Match', 'MatchScore');
        const score = result[scoreField as keyof KycMatchResponse] as number;
        if (score !== undefined) {
          totalScore += score;
          scoreCount++;
        }
      } else if (matchValue === 'not_available') {
        unavailableFields.push(field);
      }
    }
  });

  const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
  const isVerified = trueMatches > 0 && failedFields.length === 0;
  
  let message = '';
  if (isVerified) {
    message = `✅ Verificación exitosa! ${trueMatches} de ${totalChecks} campos verificados correctamente.`;
  } else if (trueMatches > 0) {
    message = `⚠️ Verificación parcial. ${trueMatches} campos verificados, ${failedFields.length} fallaron.`;
  } else {
    message = `❌ Verificación fallida. Ningún campo pudo ser verificado correctamente.`;
  }

  if (unavailableFields.length > 0) {
    message += ` ${unavailableFields.length} campos no disponibles para verificación.`;
  }

  return {
    ...result,
    isVerified,
    overallScore,
    message,
    verifiedFields,
    failedFields,
    unavailableFields
  };
}
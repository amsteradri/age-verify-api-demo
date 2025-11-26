import { NextRequest, NextResponse } from 'next/server';
import { createPokerStarsClient } from '@/lib/ciba';
import { PokerStarsVerificationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const customerData: PokerStarsVerificationRequest = await request.json();
    
    console.log('🎰 ============================================');
    console.log('🎰 POKERSTARS API - SOLICITUD RECIBIDA');
    console.log('🎰 ============================================');
    console.log('📱 Datos del cliente:', {
      phoneNumber: customerData.phoneNumber,
      name: `${customerData.givenName} ${customerData.familyName}`,
      hasIdDocument: !!customerData.idDocument,
      idDocument: customerData.idDocument || 'No proporcionado',
      birthdate: customerData.birthdate,
      email: customerData.email || 'No proporcionado',
      gender: customerData.gender || 'No proporcionado',
      address: customerData.address || 'No proporcionado',
      postalCode: customerData.postalCode || 'No proporcionado',
      country: customerData.country || 'No proporcionado'
    });

    // Validaciones básicas
    if (!customerData.phoneNumber) {
      console.log('❌ ERROR: phoneNumber is required');
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    // Validar formato del número de teléfono
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(customerData.phoneNumber)) {
      console.log('❌ ERROR: Formato de teléfono inválido:', customerData.phoneNumber);
      return NextResponse.json(
        { error: 'Invalid phone number format. Use international format (+34696567000)' },
        { status: 400 }
      );
    }

    if (!customerData.givenName || !customerData.familyName) {
      console.log('❌ ERROR: givenName and familyName are required');
      return NextResponse.json(
        { error: 'givenName and familyName are required' },
        { status: 400 }
      );
    }

    if (!customerData.birthdate) {
      console.log('❌ ERROR: birthdate is required');
      return NextResponse.json(
        { error: 'birthdate is required' },
        { status: 400 }
      );
    }

    console.log('✅ Validaciones básicas pasadas - iniciando proceso de verificación...');

    // Crear cliente y realizar verificación completa
    const client = createPokerStarsClient();
    const result = await client.performFullPokerStarsVerification(customerData);

    console.log('🎉 ============================================');
    console.log('🎉 POKERSTARS API - RESPUESTA COMPLETA');
    console.log('🎉 ============================================');
    console.log('📋 RESULTADO KYC:', {
      kycVerified: result.kycVerified,
      kycScore: result.kycScore,
      verifiedFields: result.verifiedFields,
      failedFields: result.failedFields,
      unavailableFields: result.unavailableFields
    });
    console.log('🎂 RESULTADO VERIFICACIÓN DE EDAD:', {
      ageVerified: result.ageVerified,
      ageCheck: result.ageResult?.ageCheck,
      contentLock: result.ageResult?.contentLock,
      parentalControl: result.ageResult?.parentalControl
    });
    console.log('🎰 RESULTADO FINAL:', {
      canPlay: result.canPlay,
      overallMessage: result.overallMessage,
      recommendations: result.recommendations
    });
    console.log('🔍 DETALLES COMPLETOS KYC:', result.kycResult);
    console.log('🔍 DETALLES COMPLETOS EDAD:', result.ageResult);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ ============================================');
    console.error('❌ POKERSTARS API - ERROR CRÍTICO');
    console.error('❌ ============================================');
    console.error('💥 Error completo:', error);
    console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      console.error('📝 Mensaje de error:', error.message);
      
      if (error.message.includes('401')) {
        statusCode = 401;
        errorMessage = 'Credenciales de API inválidas';
        console.error('🔑 Error de autenticación - revisar CLIENT_ID y CLIENT_SECRET');
      } else if (error.message.includes('403')) {
        statusCode = 403;
        errorMessage = 'Sin permisos para verificar este número de teléfono';
        console.error('🚫 Error de permisos - el número no está autorizado');
      } else if (error.message.includes('404')) {
        statusCode = 404;
        errorMessage = 'Servicio de verificación no disponible';
        console.error('🔍 Servicio no encontrado - endpoint incorrecto');
      } else if (error.message.includes('422')) {
        statusCode = 422;
        errorMessage = 'Datos de verificación inválidos';
        console.error('📋 Datos inválidos - revisar formato de datos enviados');
      } else {
        errorMessage = error.message;
        console.error('❓ Error desconocido:', error.message);
      }
    }

    const errorResponse = { 
      error: errorMessage,
      canPlay: false,
      kycVerified: false,
      ageVerified: false,
      timestamp: new Date().toISOString(),
      statusCode: statusCode
    };
    
    console.error('📤 Respuesta de error que se enviará:', errorResponse);
    
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
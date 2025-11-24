import { NextRequest, NextResponse } from 'next/server';
import { createPokerStarsClient } from '@/lib/ciba';
import { PokerStarsVerificationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const customerData: PokerStarsVerificationRequest = await request.json();
    
    console.log('🎰 Recibida solicitud de verificación PokerStars:', {
      phoneNumber: customerData.phoneNumber,
      name: `${customerData.givenName} ${customerData.familyName}`,
      hasIdDocument: !!customerData.idDocument,
      birthdate: customerData.birthdate
    });

    // Validaciones básicas
    if (!customerData.phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    // Validar formato del número de teléfono
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(customerData.phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use international format (+34696567000)' },
        { status: 400 }
      );
    }

    if (!customerData.givenName || !customerData.familyName) {
      return NextResponse.json(
        { error: 'givenName and familyName are required' },
        { status: 400 }
      );
    }

    if (!customerData.birthdate) {
      return NextResponse.json(
        { error: 'birthdate is required' },
        { status: 400 }
      );
    }

    // Crear cliente y realizar verificación completa
    const client = createPokerStarsClient();
    const result = await client.performFullPokerStarsVerification(customerData);

    console.log('🎉 Verificación PokerStars completada:', {
      kycVerified: result.kycVerified,
      ageVerified: result.ageVerified,
      canPlay: result.canPlay,
      kycScore: result.kycScore
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error en verificación PokerStars:', error);
    
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        statusCode = 401;
        errorMessage = 'Credenciales de API inválidas';
      } else if (error.message.includes('403')) {
        statusCode = 403;
        errorMessage = 'Sin permisos para verificar este número de teléfono';
      } else if (error.message.includes('404')) {
        statusCode = 404;
        errorMessage = 'Servicio de verificación no disponible';
      } else if (error.message.includes('422')) {
        statusCode = 422;
        errorMessage = 'Datos de verificación inválidos';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        canPlay: false,
        kycVerified: false,
        ageVerified: false
      },
      { status: statusCode }
    );
  }
}
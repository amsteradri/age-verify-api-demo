import { NextRequest, NextResponse } from 'next/server';
import { createPokerStarsClient } from '@/src/services/verification';
import { PokerStarsVerificationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const customerData: PokerStarsVerificationRequest = await request.json();
    
    console.log('🎰 PokerStars verification request:', {
      phone: customerData.phoneNumber,
      name: `${customerData.givenName} ${customerData.familyName}`
    });

    // Validaciones básicas
    if (!customerData.phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

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

    // Verificación completa
    const client = createPokerStarsClient();
    const result = await client.performFullPokerStarsVerification(customerData);

    console.log('✅ Verification completed:', {
      canPlay: result.canPlay,
      kycVerified: result.kycVerified,
      ageVerified: result.ageVerified
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Verification error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        statusCode = 401;
        errorMessage = 'Invalid API credentials';
      } else if (error.message.includes('403')) {
        statusCode = 403;
        errorMessage = 'No permission to verify this phone number';
      } else if (error.message.includes('404')) {
        statusCode = 404;
        errorMessage = 'Verification service unavailable';
      } else if (error.message.includes('422')) {
        statusCode = 422;
        errorMessage = 'Invalid verification data';
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
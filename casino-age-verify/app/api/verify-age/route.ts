import { NextRequest, NextResponse } from 'next/server';
import { createCibaClient } from '@/lib/ciba';
import { WithdrawRequest, AgeVerificationResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: WithdrawRequest = await request.json();
    
    if (!body.phoneNumber || !body.amount) {
      return NextResponse.json(
        { error: 'phoneNumber and amount are required' },
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

    console.log(`🎰 Verificando edad para retiro de €${body.amount} - Teléfono: ${body.phoneNumber}`);

    // Crear cliente CIBA y ejecutar flujo completo
    const cibaClient = createCibaClient();
    const result: AgeVerificationResponse = await cibaClient.performFullVerification(
      body.phoneNumber,
      18 // Edad mínima para juegos de casino
    );

    // Log del resultado para debugging
    console.log('📊 Resultado de verificación:', result);

    // Determinar si puede retirar dinero
    const canWithdraw = result.ageCheck === 'true';
    const verificationResult = {
      ...result,
      canWithdraw,
      message: canWithdraw 
        ? `¡Verificación exitosa! Puedes retirar €${body.amount}` 
        : 'No puedes retirar dinero. Verificación de edad falló.',
      withdrawAmount: canWithdraw ? body.amount : 0
    };

    return NextResponse.json(verificationResult);

  } catch (error) {
    console.error('💥 Error en verificación de edad:', error);
    
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
        canWithdraw: false,
        ageCheck: 'not_available'
      },
      { status: statusCode }
    );
  }
}
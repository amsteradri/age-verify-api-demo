import { NextRequest, NextResponse } from 'next/server';
import { createCibaClient } from '@/lib/ciba';
import { AgeVerificationRequest } from '@/types';

/**
 * API para verificación masiva de edades
 * Recibe una lista de personas y verifica cada una
 */
export async function POST(request: NextRequest) {
  try {
    const { people } = await request.json();
    
    if (!people || !Array.isArray(people) || people.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere una lista de personas para verificar' },
        { status: 400 }
      );
    }

    console.log(`🎭 Verificando edad para ${people.length} personas en la discoteca`);

    const client = createCibaClient();
    const results = [];

    // Procesar cada persona
    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      
      if (!person.phoneNumber || !person.name) {
        results.push({
          ...person,
          status: 'error',
          error: 'Datos incompletos (falta teléfono o nombre)',
          canEnter: false
        });
        continue;
      }

      try {
        console.log(`📱 Verificando: ${person.name} - ${person.phoneNumber}`);
        
        // Usar el flujo completo de verificación
        const verificationResult = await client.performFullVerification(
          person.phoneNumber,
          18 // Edad mínima para discoteca
        );

        const canEnter = verificationResult.ageCheck === 'true';
        
        results.push({
          ...person,
          status: 'verified',
          verificationResult,
          canEnter,
          ageCheck: verificationResult.ageCheck,
          verifiedStatus: verificationResult.verifiedStatus,
          identityMatchScore: verificationResult.identityMatchScore
        });

        console.log(`${canEnter ? '✅' : '❌'} ${person.name}: ${canEnter ? 'Puede entrar' : 'No puede entrar'}`);

      } catch (error) {
        console.error(`❌ Error verificando ${person.name}:`, error);
        
        results.push({
          ...person,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido',
          canEnter: false
        });
      }

      // Pequeña pausa entre verificaciones para no sobrecargar la API
      if (i < people.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const summary = {
      total: people.length,
      canEnter: results.filter(r => r.canEnter).length,
      cannotEnter: results.filter(r => !r.canEnter).length,
      errors: results.filter(r => r.status === 'error').length
    };

    console.log('📊 Resumen:', summary);

    return NextResponse.json({
      success: true,
      summary,
      results
    });

  } catch (error) {
    console.error('💥 Error en verificación masiva:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
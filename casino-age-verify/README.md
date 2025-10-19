# 🎰 Royal Casino - Age Verification Demo

Simulación de casino completa con Next.js, React, TypeScript y Tailwind CSS que demuestra la integración con la **API de Age Verification de Telefónica Open Gateway** usando el flujo **CIBA** (Client Initiated Backchannel Authentication).

## 🎯 Concepto

Este proyecto simula un casino online donde:
1. **🎲 Juegas en la máquina tragamonedas** - Puedes ganar premios hasta €50,000
2. **💰 Intentas retirar ganancias** - Necesitas verificar que eres mayor de 18 años
3. **📱 Verificación con teléfono** - Usa la API real de Telefónica Open Gateway
4. **✅ Retiro aprobado** - Si eres mayor de edad, puedes retirar el dinero

## 🚀 Características

### **🎰 Casino Simulation**
- **Máquina tragamonedas animada** con símbolos realistas
- **Sistema de balance** y ganancias
- **Efectos visuales** con Framer Motion
- **Jackpot de €50,000** (1% probabilidad)
- **Premios menores** €500-€5,000 (5% probabilidad)

### **🔐 Age Verification**
- **Flujo CIBA completo**: `bc-authorize` → `token` → `verify`
- **API real** de Telefónica Open Gateway
- **Modal interactivo** con estados de loading y resultado
- **Manejo de errores** específico para cada código HTTP
- **Validación de teléfono** formato internacional

### **💻 Tech Stack**
- **Next.js 14** con App Router
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Lucide React** para iconos
- **React Hot Toast** para notificaciones

## 📁 Estructura del Proyecto

```
casino-age-verify/
├── app/
│   ├── api/
│   │   └── verify-age/
│   │       └── route.ts          # API endpoint para verificación
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal
├── components/
│   ├── SlotMachine.tsx          # Componente principal del casino
│   └── AgeVerificationModal.tsx  # Modal de verificación
├── lib/
│   └── ciba.ts                  # Lógica del flujo CIBA
├── types/
│   └── index.ts                 # Tipos TypeScript
├── .env.local                   # Variables de entorno
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔧 Instalación y Uso

### **Prerequisitos**
- Node.js 18+
- Credenciales de Telefónica Open Gateway

### **1. Instalar dependencias**
```bash
cd casino-age-verify
npm install
```

### **2. Configurar variables de entorno**
En `.env.local`:
```bash
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
NEXT_PUBLIC_API_BASE_URL=https://sandbox.opengateway.telefonica.com/apigateway
```

### **3. Ejecutar en desarrollo**
```bash
npm run dev
```

### **4. Abrir en navegador**
```
http://localhost:3000
```

## 🎮 Cómo Jugar

### **1. Jugar en el Casino**
- Tienes €1,000 de saldo inicial
- Cada giro cuesta €10
- Puedes ganar desde €500 hasta €50,000

### **2. Intentar Retirar**
- Haz clic en "RETIRAR" cuando tengas ganancias
- Se abrirá el modal de verificación de edad

### **3. Verificar Edad**
- Introduce tu número de teléfono (formato: +34696567000)
- El sistema usará el flujo CIBA para verificar tu edad
- Si eres mayor de 18 años, podrás retirar el dinero

## 🔄 Flujo CIBA Implementado

### **Paso 1: bc-authorize**
```typescript
POST /apigateway/bc-authorize
Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)
Body: login_hint=+34696567000&scope=dpv:FraudPreventionAndDetection kyc-age-verification:verify
→ Retorna: auth_req_id
```

### **Paso 2: token**
```typescript
POST /apigateway/token
Authorization: Basic base64(CLIENT_ID:CLIENT_SECRRET)
Body: grant_type=urn:openid:params:grant-type:ciba&auth_req_id=...
→ Retorna: access_token
```

### **Paso 3: verify**
```typescript
POST /apigateway/kyc-age-verification/v0.1/verify
Authorization: Bearer access_token
Body: { ageThreshold: 18, phoneNumber: "+34696567000" }
→ Retorna: { ageCheck: "true"|"false"|"not_available" }
```

## 📊 Componentes Principales

### **SlotMachine.tsx**
- Estado del juego (balance, ganancias, spinning)
- Lógica de la máquina tragamonedas
- Integración con modal de verificación
- Animaciones y efectos visuales

### **AgeVerificationModal.tsx**
- Estados: input → verifying → result
- Validación de formato de teléfono
- Llamada al API endpoint
- Manejo de respuestas y errores

### **route.ts (API)**
- Endpoint `/api/verify-age`
- Inicializa cliente CIBA
- Ejecuta flujo completo de verificación
- Retorna resultado formateado

## 🎨 Diseño y UX

### **Tema Casino**
- **Colores**: Rojo, dorado, verde, negro
- **Tipografía**: Fuentes bold para impacto visual
- **Animaciones**: Spinning, glow effects, pulsos
- **Iconografía**: Símbolos de casino, monedas, trofeos

### **Estados Visuales**
- **Loading**: Spinners y animaciones
- **Success**: Colores verdes y checkmarks
- **Error**: Colores rojos y alertas
- **Jackpot**: Efectos especiales dorados

## ⚠️ Consideraciones

### **Entorno Sandbox**
- Usa credenciales de sandbox de Telefónica
- Solo ciertos números están habilitados
- Respuestas pueden ser simuladas

### **Seguridad**
- Credenciales en variables de entorno server-side
- Validación de inputs
- Manejo seguro de tokens

### **Limitaciones**
- Rate limiting de la API
- Números de teléfono permitidos en sandbox
- Latencia de red en el flujo CIBA

## 🧪 Testing

### **Números de Prueba**
- `+34696567000` - Número habilitado en sandbox
- Otros números pueden no funcionar en sandbox

### **Escenarios de Prueba**
1. **Verificación exitosa** - Mayor de 18 años
2. **Verificación fallida** - Menor de 18 años
3. **Datos no disponibles** - Error en verificación
4. **Errores de API** - Credenciales inválidas, etc.

## 🚢 Deployment

### **Build de Producción**
```bash
npm run build
npm start
```

### **Variables de Entorno**
Asegúrate de configurar en producción:
- `CLIENT_ID`
- `CLIENT_SECRET`
- `NEXT_PUBLIC_API_BASE_URL`

## 📚 Recursos

- [Telefónica Open Gateway](https://opengateway.telefonica.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [CIBA Specification](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html)

## 🎯 Próximas Mejoras

- [ ] Más juegos de casino (ruleta, blackjack)
- [ ] Sistema de usuarios y sesiones
- [ ] Historial de transacciones
- [ ] Integración con métodos de pago reales
- [ ] Modo multijugador
- [ ] Estadísticas de juego

---

**¡Diviértete jugando y aprendiendo sobre verificación de edad con tecnologías reales!** 🎰✨
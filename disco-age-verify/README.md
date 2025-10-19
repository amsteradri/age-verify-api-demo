# 🎭 Demo Discoteca - Verificación Masiva de Edad

Demo de verificación masiva de edad para control de acceso en discotecas usando **Telefónica Open Gateway**.

## 🎯 Funcionalidad

Esta aplicación permite:
- **Subir un CSV** con lista de invitados (nombre, teléfono, email)
- **Verificar masivamente** la edad de todas las personas 
- **Controlar acceso** basado en verificación +18
- **Exportar resultados** en formato CSV

## 📋 Formato del CSV

El archivo CSV debe tener las siguientes columnas:

```csv
name,phoneNumber,email
María García,+34639106848,maria.garcia@example.com
Juan Pérez,+34612345678,juan.perez@example.com
Ana López,+34698765432,ana.lopez@example.com
```

### Columnas requeridas:
- `name`: Nombre completo de la persona
- `phoneNumber`: Número de teléfono en formato internacional (+34...)

### Columnas opcionales:
- `email`: Dirección de correo electrónico

## 🚀 Instalación y Uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env` con:
```
CLIENT_ID = tu-client-id
CLIENT_SECRET = tu-client-secret
NEXT_PUBLIC_API_BASE_URL = https://sandbox.opengateway.telefonica.com/apigateway
```

### 3. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📝 Proceso de Verificación

1. **Subir CSV**: Arrastra o selecciona un archivo CSV con la lista de invitados
2. **Verificar**: Haz clic en "Verificar todas las edades"
3. **Resultados**: Ve quién puede entrar (+18) y quién no
4. **Exportar**: Descarga un CSV con los resultados completos

## 🎨 Características

### ✅ Verificación masiva
- Procesa múltiples personas en una sola operación
- Pausa entre verificaciones para no sobrecargar la API
- Manejo robusto de errores

### 📊 Resultados detallados
- **Estado**: Acceso permitido/denegado
- **Confianza**: Puntuación de verificación
- **Documento**: Si fue verificado con documento oficial
- **Errores**: Detalles de fallos en verificación

### 🎭 Interfaz temática
- Diseño inspirado en discotecas
- Colores púrpura/rosa/fucsia
- Animaciones suaves
- Responsive design

## 🔧 Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **Papa Parse** - Procesamiento CSV
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos

## 🌐 API

### Endpoint: `/api/verify-ages`

**POST** - Verifica una lista de personas

**Demo desarrollada para Telefónica Open Gateway** 🚀

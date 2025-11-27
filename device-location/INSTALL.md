# INSTRUCCIONES DE INSTALACIÓN Y USO

## 📦 Dependencias necesarias

Para que la demo funcione completamente, necesitas instalar las siguientes dependencias:

```bash
npm install express cors
```

O si prefieres instalar todo de una vez:

```bash
npm install dotenv express cors
```

## 🚀 Cómo ejecutar la demo

### Demo Web Visual (Recomendado):
```bash
npm start
```
Luego navega a: http://localhost:3000

### Demo CLI (Terminal):
```bash
npm run demo
```

## 📋 Verificación de archivos

Asegúrate de que tienes todos estos archivos:

```
device-location/
├── .env                    # Credenciales (CLIENT_ID, CLIENT_SECRET)
├── package.json           # Dependencias del proyecto
├── config.js              # Configuración (ubicación, precisión, etc.)
├── demo.js                # Demo de línea de comandos
├── server.js              # Servidor web backend
├── index.html             # Frontend web
├── app.js                 # Lógica del frontend
└── README.md              # Documentación
```

## ⚙️ Personalización rápida

Para cambiar la ubicación de la demo, edita `config.js`:

```javascript
export const DEMO_CONFIG = {
    latitude: 41.3851,              // Cambiar a Barcelona
    longitude: 2.1734,              // Cambiar a Barcelona
    accuracy: 15,                   // Cambiar radio a 15km
    defaultPhoneNumber: '+34696567000',
};
```

## 🔧 Solución de problemas

### Si npm no funciona:
1. Instala Node.js desde: https://nodejs.org/
2. Reinicia tu terminal
3. Ejecuta: `node --version` para verificar

### Si el servidor no inicia:
1. Verifica que tienes el archivo `.env` con las credenciales
2. Verifica que el puerto 3000 esté libre
3. Revisa los logs en la consola

### Si la demo CLI no funciona:
1. Verifica las credenciales en `.env`
2. Usa el número de prueba: +34696567000
3. Verifica tu conexión a internet

## 📞 Números de teléfono para pruebas

En el entorno sandbox usa:
- `+34696567000` (recomendado)
- `+34696567077` (alternativo)

¡La demo está lista para usar! 🎉
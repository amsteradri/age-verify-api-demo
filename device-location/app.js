/**
 * TELEFÓNICA OPEN GATEWAY - DEVICE LOCATION VERIFICATION DEMO
 * 
 * Aplicación web que demuestra la verificación de ubicación de dispositivos
 */

class DeviceLocationDemo {
    constructor() {
        this.map = null;
        this.locationMarker = null;
        this.accuracyCircle = null;
        this.config = null;
        this.currentLocation = 'madrid'; // ubicación por defecto
        
        this.init();
    }

    /**
     * Inicializar la aplicación
     */
    async init() {
        try {
            console.log('🚀 Inicializando Device Location Demo...');
            await this.loadConfiguration();
            await this.waitForLeaflet();
            this.initializeMap();
            this.updateLocationInfo();
            this.setupEventListeners();
            this.setupLocationSelector();
            console.log('✅ Device Location Demo inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando demo:', error);
            this.showError('Error cargando la configuración de la demo');
        }
    }

    /**
     * Configurar el selector de ubicación
     */
    setupLocationSelector() {
        const selector = document.getElementById('locationSelector');
        
        if (!selector) {
            console.warn('⚠️ Selector de ubicación no encontrado');
            return;
        }

        // Agregar event listener para cambios
        selector.addEventListener('change', (e) => {
            this.currentLocation = e.target.value;
            console.log(`📍 Ubicación seleccionada: ${this.currentLocation}`);
            
            if (this.currentLocation === 'custom') {
                this.showCustomLocationInputs();
            } else {
                this.hideCustomLocationInputs();
                this.updateToLocation(this.currentLocation);
            }
        });

        console.log('✅ Selector de ubicación configurado');
    }

    /**
     * Actualizar mapa y configuración a nueva ubicación
     */
    updateToLocation(locationKey) {
        const location = this.config.locations[locationKey];
        
        if (!location) {
            console.error(`❌ Ubicación no encontrada: ${locationKey}`);
            return;
        }

        console.log(`🗺️ Actualizando mapa a ${location.name}...`);

        // Actualizar configuración actual
        this.config.latitude = location.lat;
        this.config.longitude = location.lng;
        this.config.accuracy = location.accuracy || 10;

        // Actualizar mapa
        this.updateMapToLocation(location);
        
        // Actualizar información en la UI
        this.updateLocationInfo();

        console.log(`✅ Mapa actualizado a ${location.name}`);
    }

    /**
     * Actualizar marcador y círculo en el mapa
     */
    updateMapToLocation(location) {
        // Remover elementos existentes
        if (this.locationMarker) {
            this.map.removeLayer(this.locationMarker);
        }
        if (this.accuracyCircle) {
            this.map.removeLayer(this.accuracyCircle);
        }

        // Crear nuevo marcador
        this.locationMarker = L.marker([location.lat, location.lng])
            .addTo(this.map)
            .bindPopup(`
                <div style="text-align: center;">
                    <b>📍 ${location.name}</b><br>
                    <small>${location.description}</small><br><br>
                    <strong>Coordenadas:</strong><br>
                    ${location.lat}, ${location.lng}<br><br>
                    <strong>Radio de verificación:</strong><br>
                    ${location.accuracy} km
                </div>
            `);

        // Crear nuevo círculo de precisión
        this.accuracyCircle = L.circle([location.lat, location.lng], {
            radius: location.accuracy * 1000, // Convertir km a metros
            color: '#019DE0',
            fillColor: '#019DE0',
            fillOpacity: 0.15,
            weight: 3,
            dashArray: '10, 10'
        }).addTo(this.map);

        // Centrar mapa en nueva ubicación
        this.map.setView([location.lat, location.lng], 12);
        
        // Ajustar vista para mostrar el círculo completo
        setTimeout(() => {
            this.map.fitBounds(this.accuracyCircle.getBounds(), { 
                padding: [30, 30] 
            });
        }, 100);
    }

    /**
     * Mostrar inputs para ubicación personalizada
     */
    showCustomLocationInputs() {
        const customInputs = document.getElementById('customLocationInputs');
        if (customInputs) {
            customInputs.classList.remove('d-none');
            console.log('📝 Inputs de ubicación personalizada mostrados');
        }
    }

    /**
     * Ocultar inputs para ubicación personalizada
     */
    hideCustomLocationInputs() {
        const customInputs = document.getElementById('customLocationInputs');
        if (customInputs) {
            customInputs.classList.add('d-none');
            console.log('📝 Inputs de ubicación personalizada ocultados');
        }
    }

    /**
     * Aplicar ubicación personalizada
     */
    applyCustomLocation() {
        const lat = parseFloat(document.getElementById('customLat').value);
        const lng = parseFloat(document.getElementById('customLng').value);
        const accuracy = parseInt(document.getElementById('customAccuracy').value);

        if (isNaN(lat) || isNaN(lng) || isNaN(accuracy)) {
            this.showError('Por favor, introduce valores válidos para la ubicación personalizada');
            return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            this.showError('Coordenadas inválidas. Latitud: -90 a 90, Longitud: -180 a 180');
            return;
        }

        if (accuracy < 2 || accuracy > 200) {
            this.showError('La precisión debe estar entre 2 y 200 km');
            return;
        }

        // Crear ubicación personalizada
        const customLocation = {
            lat: lat,
            lng: lng,
            name: 'Ubicación personalizada',
            description: `Coordenadas: ${lat}, ${lng}`,
            accuracy: accuracy
        };

        // Actualizar configuración
        this.config.latitude = lat;
        this.config.longitude = lng;
        this.config.accuracy = accuracy;

        // Actualizar mapa
        this.updateMapToLocation(customLocation);
        this.updateLocationInfo();

        console.log('✅ Ubicación personalizada aplicada:', customLocation);
    }

    /**
     * Esperar a que Leaflet se cargue completamente
     */
    async waitForLeaflet() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkLeaflet = () => {
                attempts++;
                if (typeof L !== 'undefined' && L.map) {
                    console.log('✅ Leaflet cargado correctamente');
                    resolve();
                } else if (attempts < maxAttempts) {
                    setTimeout(checkLeaflet, 100);
                } else {
                    reject(new Error('Leaflet no se pudo cargar'));
                }
            };
            
            checkLeaflet();
        });
    }

    /**
     * Cargar configuración desde el servidor
     */
    async loadConfiguration() {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error('Error cargando configuración del servidor');
            }
            this.config = await response.json();
            console.log('✅ Configuración cargada:', this.config);
            
            // Actualizar el campo de teléfono con el valor por defecto
            document.getElementById('phoneNumber').value = this.config.defaultPhoneNumber;
            
        } catch (error) {
            console.warn('⚠️ Error cargando configuración del servidor, usando valores por defecto:', error);
            
            // Fallback a configuración por defecto (importar config.js)
            try {
                const configModule = await import('./config.js');
                this.config = configModule.DEMO_CONFIG;
                this.config.latitude = this.config.locations.madrid.lat;
                this.config.longitude = this.config.locations.madrid.lng;
                this.config.accuracy = this.config.locations.madrid.accuracy;
                
                console.log('✅ Configuración local cargada:', this.config);
                
                // Actualizar campo de teléfono
                const phoneInput = document.getElementById('phoneNumber');
                if (phoneInput) {
                    phoneInput.value = this.config.defaultPhoneNumber;
                }
                
            } catch (configError) {
                console.error('❌ Error cargando configuración local:', configError);
                throw new Error('No se pudo cargar ninguna configuración');
            }
        }
    }

    /**
     * Configurar el mapa con Leaflet
     */
    initializeMap() {
        try {
            console.log('🗺️ Inicializando mapa...');
            
            // Verificar que el contenedor del mapa existe
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                throw new Error('Contenedor del mapa no encontrado');
            }

            // Limpiar cualquier mapa existente
            if (this.map) {
                this.map.remove();
            }

            // Crear el mapa centrado en la ubicación configurada
            this.map = L.map('map').setView(
                [this.config.latitude, this.config.longitude], 
                12
            );

            console.log('✅ Mapa base creado');

            // Añadir tiles de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors | Powered by Telefónica Open Gateway',
                maxZoom: 18
            }).addTo(this.map);

            console.log('✅ Tiles de OpenStreetMap añadidas');

            // Configurar ubicación inicial
            const initialLocation = this.config.locations[this.currentLocation];
            this.updateMapToLocation(initialLocation);
            
            console.log('✅ Mapa inicializado completamente');
            
        } catch (error) {
            console.error('❌ Error inicializando mapa:', error);
            // Mostrar error en el contenedor del mapa
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                mapContainer.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center h-100 text-muted">
                        <div class="text-center">
                            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                            <p>Error cargando el mapa</p>
                            <small>${error.message}</small>
                        </div>
                    </div>
                `;
            }
        }
    }

    /**
     * Actualizar información de ubicación en la UI
     */
    updateLocationInfo() {
        try {
            const currentLocationData = this.config.locations[this.currentLocation] || {
                name: 'Ubicación personalizada',
                description: 'Coordenadas personalizadas'
            };
            
            const locationNameEl = document.getElementById('location-name');
            const locationCoordsEl = document.getElementById('location-coords');
            const accuracyValueEl = document.getElementById('accuracy-value');
            
            if (locationNameEl) {
                locationNameEl.textContent = currentLocationData.name;
            }
            if (locationCoordsEl) {
                locationCoordsEl.textContent = `${this.config.latitude}, ${this.config.longitude}`;
            }
            if (accuracyValueEl) {
                accuracyValueEl.textContent = this.config.accuracy;
            }
            
            console.log('✅ Información de ubicación actualizada');
        } catch (error) {
            console.error('❌ Error actualizando información de ubicación:', error);
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Form de verificación
        const form = document.getElementById('locationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.verifyLocation();
            });
        }

        // Botón de aplicar ubicación personalizada
        const applyCustomBtn = document.getElementById('applyCustomLocation');
        if (applyCustomBtn) {
            applyCustomBtn.addEventListener('click', () => {
                this.applyCustomLocation();
            });
        }
        
        console.log('✅ Event listeners configurados');
    }

    /**
     * Realizar verificación de ubicación
     */
    async verifyLocation() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        if (!this.isValidPhoneNumber(phoneNumber)) {
            this.showError('Formato de teléfono inválido. Use formato internacional (+34696567000)');
            return;
        }

        try {
            this.showLoading(true);
            this.hideResult();

            console.log('🔄 Iniciando verificación de ubicación...');

            // Paso 1: Autorización CIBA
            console.log('1️⃣ Realizando autorización CIBA...');
            const authReqId = await this.performCIBAAuthorization(phoneNumber);
            
            // Paso 2: Obtener token
            console.log('2️⃣ Obteniendo token OAuth2...');
            const accessToken = await this.getAccessToken(authReqId);
            
            // Paso 3: Verificar ubicación
            console.log('3️⃣ Verificando ubicación del dispositivo...');
            const result = await this.verifyDeviceLocation(accessToken, phoneNumber);
            
            // Mostrar resultado
            this.showResult(result);
            console.log('✅ Verificación completada');
            
        } catch (error) {
            console.error('❌ Error en verificación:', error);
            this.showError(error.message || 'Error durante la verificación');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Paso 1: Autorización CIBA
     */
    async performCIBAAuthorization(phoneNumber) {
        const response = await fetch('/api/bc-authorize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error en autorización CIBA');
        }

        const data = await response.json();
        return data.auth_req_id;
    }

    /**
     * Paso 2: Obtener token OAuth2
     */
    async getAccessToken(authReqId) {
        const response = await fetch('/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                auth_req_id: authReqId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error obteniendo token');
        }

        const data = await response.json();
        return data.access_token;
    }

    /**
     * Paso 3: Verificar ubicación del dispositivo
     */
    async verifyDeviceLocation(accessToken, phoneNumber) {
        const response = await fetch('/api/verify-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accessToken: accessToken,
                phoneNumber: phoneNumber,
                latitude: this.config.latitude,
                longitude: this.config.longitude,
                accuracy: this.config.accuracy
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error en verificación de ubicación');
        }

        return await response.json();
    }

    /**
     * Validar formato de número de teléfono
     */
    isValidPhoneNumber(phone) {
        return /^\+\d{10,15}$/.test(phone);
    }

    /**
     * Mostrar/ocultar estado de carga
     */
    showLoading(show) {
        const loadingElement = document.getElementById('loadingState');
        const submitBtn = document.getElementById('verifyBtn');
        
        if (show) {
            loadingElement.classList.remove('d-none');
            submitBtn.disabled = true;
        } else {
            loadingElement.classList.add('d-none');
            submitBtn.disabled = false;
        }
    }

    /**
     * Mostrar resultado de verificación
     */
    showResult(result) {
        const resultCard = document.getElementById('resultCard');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultDescription = document.getElementById('resultDescription');
        const apiResponse = document.getElementById('apiResponse');

        // Determinar tipo de resultado
        const isSuccess = result.verificationResult === true;
        const isError = result.error === true;
        
        // Configurar estilos de la card
        resultCard.className = `card result-card ${isSuccess ? 'success' : 'error'}`;
        
        // Configurar icono y contenido
        if (isError) {
            resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle text-warning" style="font-size: 2.5rem;"></i>';
            resultTitle.textContent = 'Error en la verificación';
            resultDescription.textContent = result.message || 'Se produjo un error durante la verificación';
        } else if (isSuccess) {
            resultIcon.innerHTML = '<i class="fas fa-check-circle text-success" style="font-size: 2.5rem;"></i>';
            resultTitle.textContent = '✅ UBICACIÓN VERIFICADA';
            resultDescription.textContent = 'El dispositivo está dentro del área especificada';
        } else {
            resultIcon.innerHTML = '<i class="fas fa-times-circle text-danger" style="font-size: 2.5rem;"></i>';
            resultTitle.textContent = '❌ UBICACIÓN NO VERIFICADA';
            resultDescription.textContent = 'El dispositivo NO está en la ubicación esperada';
        }
        
        // Mostrar respuesta técnica
        apiResponse.textContent = JSON.stringify(result, null, 2);
        
        // Mostrar card
        resultCard.classList.remove('d-none');
        
        // Scroll hacia el resultado
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Ocultar resultado
     */
    hideResult() {
        document.getElementById('resultCard').classList.add('d-none');
    }

    /**
     * Mostrar error
     */
    showError(message) {
        const result = {
            error: true,
            message: message,
            verificationResult: false
        };
        this.showResult(result);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando demo...');
    new DeviceLocationDemo();
});
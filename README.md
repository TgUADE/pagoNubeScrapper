# 🛡️ Scrapper PagoNube con Bypass Avanzado de reCAPTCHA (100% GRATUITO)

Este proyecto implementa un scrapper avanzado para PagoNube con técnicas sofisticadas de bypass de reCAPTCHA y anti-detección de bots usando **únicamente métodos gratuitos**.

## 🚀 Características Principales

### 🔓 Técnicas de Bypass de reCAPTCHA Implementadas (TODAS GRATUITAS)

1. **Plugin Stealth de Puppeteer-Extra**
   - Evasión automática de detección de automatización
   - Ocultación de propiedades de WebDriver

2. **User Agents Aleatorios**
   - Generación de User Agents realistas y aleatorios
   - Rotación automática para evitar detección

3. **Viewport Aleatorio**
   - Dimensiones de pantalla variables para simular diferentes dispositivos
   - Configuración dinámica en cada ejecución

4. **Configuración Anti-Detección Avanzada**
   - Eliminación de propiedades `webdriver`
   - Sobrescritura de `navigator.plugins`
   - Configuración de `navigator.languages`
   - Simulación de propiedades de Chrome
   - Configuración de permisos realistas

5. **Simulación de Comportamiento Humano**
   - Movimientos de mouse en curva
   - Delays variables entre teclas
   - Hover antes de clicks
   - Eventos de mouse aleatorios
   - Actividad de scroll simulada

6. **Interceptación Inteligente de Recursos**
   - Bloqueo de imágenes, CSS y fuentes para mejor rendimiento
   - Permitir recursos relacionados con reCAPTCHA

7. **Headers HTTP Realistas**
   - Configuración de headers que simulan navegadores reales
   - Accept-Language, Accept-Encoding, Sec-Fetch-* headers

8. **Detección y Evasión Automática de reCAPTCHA (GRATUITA)**
   - Detección de múltiples tipos de reCAPTCHA
   - Técnicas de timing bypass
   - Manipulación JavaScript del DOM
   - Simulación de interacciones humanas
   - Click automático en checkboxes v2

9. **Eliminación de Rastros de Automatización**
   - Limpieza de propiedades CDC (Chrome DevTools)
   - Sobrescritura de funciones toString
   - Eliminación de variables de automatización

10. **Verificación Continua de reCAPTCHA**
    - Verificación en cada paso del flujo
    - Evasión automática cuando se detecta

## 📦 Dependencias (TODAS GRATUITAS)

```json
{
  "puppeteer-extra": "^3.3.6",
  "puppeteer-extra-plugin-stealth": "^2.11.2",
  "random-useragent": "^0.5.0",
  "user-agents": "^1.1.326"
}
```

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
USER_EMAIL=tu_email@ejemplo.com
USER_PASSWORD=tu_password
TOKEN_CODE=tu_codigo_2fa_secret
PORT=3000
```

### Variables de Entorno Opcionales

```env
DEBUG_MODE=true
NODE_ENV=production
```

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con tus credenciales

# Ejecutar
npm start
```

## 🐳 Docker

El proyecto incluye configuración optimizada para Docker con todas las dependencias necesarias para Puppeteer:

```bash
# Construir imagen
docker build -t scrapper-pago-nube .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env scrapper-pago-nube
```

## 📡 API

### POST /token

Inicia el proceso de scrapping y retorna el token de autorización.

**Respuesta exitosa:**
```json
{
  "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Respuesta de error:**
```json
{
  "error": "No se pudo obtener el token después de 3 intentos"
}
```

## 🛡️ Técnicas Anti-Detección Detalladas (GRATUITAS)

### 1. Configuración del Browser
- Argumentos optimizados para evasión
- Deshabilitación de características que revelan automatización
- Configuración de flags de Chrome para máxima compatibilidad

### 2. Manipulación del Navigator
```javascript
// Eliminación de propiedades de WebDriver
Object.defineProperty(navigator, 'webdriver', {
  get: () => undefined,
});

// Configuración de plugins realistas
Object.defineProperty(navigator, 'plugins', {
  get: () => [1, 2, 3, 4, 5],
});
```

### 3. Simulación de Comportamiento Humano
- Movimientos de mouse en curva con variaciones aleatorias
- Delays variables entre pulsaciones de teclas
- Hover antes de clicks para simular interacción real
- Actividad de scroll para simular lectura

### 4. Gestión de reCAPTCHA (MÉTODOS GRATUITOS)
- Detección automática de diferentes tipos de reCAPTCHA
- Técnicas de timing para bypass
- Manipulación del DOM para ocultar/evadir
- Simulación de interacciones humanas
- Click automático en checkboxes cuando es posible

## 🔍 Técnicas Específicas de Bypass de reCAPTCHA

### ✅ Técnica 1: Resolución Automática por Timing
- Espera inteligente para que reCAPTCHA se resuelva solo
- Simulación de tiempo de actividad del usuario

### ✅ Técnica 2: Interacciones Humanas
- Movimientos de mouse aleatorios
- Simulación de actividad natural del usuario

### ✅ Técnica 3: Click en Checkbox v2
- Detección automática de checkboxes de reCAPTCHA
- Click con delays humanos realistas

### ✅ Técnica 4: Manipulación JavaScript
- Inyección de código para manipular widgets
- Ocultación de elementos de reCAPTCHA

### ✅ Técnica 5: Actividad de Scroll
- Simulación de lectura y navegación
- Scroll suave para parecer humano

### ✅ Técnica 6: Verificación Inteligente
- Detección de visibilidad real de elementos
- Verificación de estado después de técnicas

### ✅ Técnica 7: Bypass por Performance
- Manipulación de timing del navegador
- Simulación de sesión larga de usuario

## 🔍 Logs y Debugging

El sistema incluye logging detallado para monitorear:
- Detección de reCAPTCHA
- Configuración del browser
- Simulación de comportamiento humano
- Captura de tokens
- Errores y reintentos
- Técnicas de evasión aplicadas

## ⚠️ Consideraciones Legales

Este código es para fines educativos y de investigación. Asegúrate de:
- Cumplir con los términos de servicio del sitio web
- Respetar las políticas de rate limiting
- Usar responsablemente las técnicas de evasión

## 💡 Ventajas de las Técnicas Gratuitas

- ✅ **Sin costos adicionales**: No requiere servicios pagados
- ✅ **Más sigiloso**: No depende de servicios externos
- ✅ **Mayor control**: Técnicas personalizables
- ✅ **Sin límites**: No hay restricciones de uso
- ✅ **Más rápido**: No hay latencia de servicios externos

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

ISC License - ver archivo LICENSE para detalles.

## 🔗 Referencias

- [Puppeteer Extra](https://github.com/berstend/puppeteer-extra)
- [Puppeteer Stealth Plugin](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
- [Stack Overflow: Bypassing CAPTCHAs](https://stackoverflow.com/questions/55803984/bypassing-captchas-with-headless-chrome-using-puppeteer) 
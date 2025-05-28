// index.js
"use strict";
require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer");
const { authenticator } = require("otplib");

const { USER_EMAIL, USER_PASSWORD, TOKEN_CODE, PORT = 3000 } = process.env;

if (!USER_EMAIL || !USER_PASSWORD || !TOKEN_CODE) {
  console.error("❌ Faltan USER_EMAIL, USER_PASSWORD o TOKEN_CODE en .env");
  process.exit(1);
}

console.log("🔐 === VERIFICACIÓN DE CREDENCIALES ===");
console.log(`📧 Email configurado: ${USER_EMAIL}`);
console.log(`🔑 Password configurado: ${USER_PASSWORD ? `${USER_PASSWORD.substring(0, 3)}***` : 'NO CONFIGURADO'}`);
console.log(`🎫 Token code configurado: ${TOKEN_CODE ? `${TOKEN_CODE.substring(0, 8)}***` : 'NO CONFIGURADO'}`);
console.log("🔐 === FIN VERIFICACIÓN DE CREDENCIALES ===");

// Genera el código TOTP
function generateToken() {
  try {
    console.log("🔐 Generando código TOTP...");
    const token = authenticator.generate(TOKEN_CODE);
    console.log(`✅ Código TOTP generado: ${token}`);
    return token;
  } catch (err) {
    console.error("❌ Error generando TOTP:", err);
    throw err;
  }
}

// Hace todo el flujo de login y captura el header
async function fetchAuthToken() {
  console.log("🚀 Iniciando proceso de autenticación...");
  
  // Configuración del browser - usar headless: false para debug
  const browserOptions = {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled', // Importante para evitar detección
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images', // Acelerar carga
      '--disable-javascript-harmony-shipping',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-field-trial-config',
      '--disable-back-forward-cache',
      '--disable-ipc-flooding-protection'
    ],
    headless: process.env.DEBUG_MODE !== 'true', // Si DEBUG_MODE=true, mostrar browser
    slowMo: process.env.DEBUG_MODE === 'true' ? 100 : 50, // Siempre un poco de delay para parecer humano
    defaultViewport: {
      width: 1366,
      height: 768
    }
  };
  
  const browser = await puppeteer.launch(browserOptions);
  console.log("🌐 Browser lanzado exitosamente");

  try {
    const page = await browser.newPage();
    console.log("📄 Nueva página creada");
    
    // Configuraciones anti-detección de bots
    console.log("🤖 Configurando anti-detección de bots...");
    
    // Establecer user agent realista
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Establecer viewport
    await page.setViewport({ width: 1366, height: 768 });
    
    // Ocultar que es un navegador automatizado
    await page.evaluateOnNewDocument(() => {
      // Eliminar la propiedad webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Sobrescribir la propiedad plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Sobrescribir la propiedad languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-ES', 'es', 'en'],
      });
      
      // Agregar propiedades de Chrome
      window.chrome = {
        runtime: {},
      };
      
      // Sobrescribir permisos
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: 'granted' }) :
          originalQuery(parameters)
      );
    });
    
    // Establecer headers adicionales
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    });
    
    console.log("✅ Configuración anti-detección completada");
    
    let authHeader = null;

    // Interceptamos la request de orders y otras requests de API
    page.on("request", (req) => {
      const url = req.url();
      
      // Buscar requests que puedan contener el token de autorización
      if (url.includes("/stores/orders") || 
          url.includes("/api/") || 
          url.includes("/admin/") ||
          url.includes("envionube")) {
        console.log(`🎯 Request detectada: ${url.substring(0, 80)}...`);
        
        const authHeaderValue = req.headers().authorization;
        if (authHeaderValue && !authHeader) {
          authHeader = authHeaderValue;
          console.log(`✅ Header Authorization capturado: ${authHeader.substring(0, 20)}...`);
        } else if (!authHeaderValue) {
          console.log("⚠️ Request sin header Authorization");
        }
      }
    });

    // 1) Login
    console.log("🔑 PASO 1: Navegando a página de login...");
    await page.goto("https://www.tiendanube.com/login", {
      waitUntil: "networkidle2",
    });
    console.log("✅ Página de login cargada");

    // Mostrar contenido de la página de login
    console.log("📄 === CONTENIDO PÁGINA DE LOGIN ===");
    const loginPageTitle = await page.title();
    console.log(`📋 Título: ${loginPageTitle}`);
    const loginPageUrl = page.url();
    console.log(`🔗 URL actual: ${loginPageUrl}`);
    const loginPageText = await page.evaluate(() => document.body.innerText);
    console.log(`📝 Texto de la página (primeros 500 chars):\n${loginPageText.substring(0, 500)}...`);
    const loginPageHTML = await page.evaluate(() => document.documentElement.outerHTML);
    console.log(`🏗️ HTML de la página (primeros 800 chars):\n${loginPageHTML.substring(0, 800)}...`);
    console.log("📄 === FIN CONTENIDO PÁGINA DE LOGIN ===");

    // Verificar que los selectores existen
    console.log("🔍 Verificando selector de email: #user-mail");
    const emailSelector = await page.$('#user-mail');
    if (!emailSelector) {
      throw new Error("❌ Selector #user-mail no encontrado");
    }
    console.log("✅ Selector de email encontrado");

    console.log("🔍 Verificando selector de password: #pass");
    const passSelector = await page.$('#pass');
    if (!passSelector) {
      throw new Error("❌ Selector #pass no encontrado");
    }
    console.log("✅ Selector de password encontrado");

    console.log(`📝 Escribiendo email: ${USER_EMAIL}`);
    await page.click("#user-mail"); // Click primero para enfocar
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300)); // Delay aleatorio
    await page.type("#user-mail", USER_EMAIL, { delay: 50 + Math.random() * 100 }); // Delay variable entre teclas
    console.log("✅ Email escrito");

    console.log("📝 Escribiendo password...");
    await page.click("#pass"); // Click primero para enfocar
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300)); // Delay aleatorio
    await page.type("#pass", USER_PASSWORD, { delay: 50 + Math.random() * 100 }); // Delay variable entre teclas
    console.log("✅ Password escrito");

    // Simular movimiento de mouse antes del click
    console.log("🖱️ Simulando movimiento de mouse...");
    const loginButton = await page.$('.js-tkit-loading-button');
    
    console.log("🔍 Verificando botón de login: .js-tkit-loading-button");
    if (!loginButton) {
      throw new Error("❌ Botón de login .js-tkit-loading-button no encontrado");
    }
    console.log("✅ Botón de login encontrado");
    
    const buttonBox = await loginButton.boundingBox();
    if (buttonBox) {
      // Mover el mouse a una posición aleatoria cerca del botón
      await page.mouse.move(
        buttonBox.x + buttonBox.width * (0.3 + Math.random() * 0.4),
        buttonBox.y + buttonBox.height * (0.3 + Math.random() * 0.4)
      );
      await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
    }

    console.log("🖱️ Haciendo click en botón de login...");
    await page.click(".js-tkit-loading-button");
    
    // Esperar a que la página procese el login
    console.log("⏳ Esperando respuesta del login...");
    await new Promise(r => setTimeout(r, 3000));
    
    // Verificar si el login fue exitoso
    const currentUrlAfterLogin = page.url();
    console.log(`🔗 URL después del login: ${currentUrlAfterLogin}`);
    
    // Si seguimos en la página de login, verificar si hay errores
    if (currentUrlAfterLogin.includes('/login')) {
      console.log("⚠️ Aún estamos en la página de login, verificando errores...");
      
      // Buscar mensajes de error
      const errorMessages = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('.alert-danger, .error, .alert-error, [class*="error"], [class*="danger"]');
        return Array.from(errorElements).map(el => el.textContent.trim()).filter(text => text.length > 0);
      });
      
      if (errorMessages.length > 0) {
        console.error("❌ Errores encontrados en el login:");
        errorMessages.forEach(msg => console.error(`   - ${msg}`));
        throw new Error(`Login falló: ${errorMessages.join(', ')}`);
      }
      
      // Verificar si los campos aún están presentes (indica que el login no fue exitoso)
      const emailField = await page.$('#user-mail');
      const passField = await page.$('#pass');
      
      if (emailField && passField) {
        // Verificar el contenido de los campos para asegurar que se llenaron correctamente
        const emailValue = await page.$eval('#user-mail', el => el.value);
        const passValue = await page.$eval('#pass', el => el.value);
        
        console.log(`📧 Email en el campo: ${emailValue}`);
        console.log(`🔐 Password length: ${passValue.length} caracteres`);
        
        if (!emailValue || !passValue) {
          throw new Error("Los campos de email o password están vacíos después del intento de login");
        }
        
        // Intentar hacer click nuevamente, a veces el primer click no funciona
        console.log("🔄 Reintentando click en botón de login...");
        await page.click(".js-tkit-loading-button");
        await new Promise(r => setTimeout(r, 5000)); // Esperar más tiempo
        
        const urlAfterRetry = page.url();
        if (urlAfterRetry.includes('/login')) {
          throw new Error("Login falló - credenciales incorrectas o problema con el sitio");
        }
      }
    }
    
    console.log("✅ Login completado exitosamente");

    // Mostrar contenido después del login
    console.log("📄 === CONTENIDO DESPUÉS DEL LOGIN ===");
    const afterLoginTitle = await page.title();
    console.log(`📋 Título: ${afterLoginTitle}`);
    const afterLoginUrl = page.url();
    console.log(`🔗 URL actual: ${afterLoginUrl}`);
    const afterLoginText = await page.evaluate(() => document.body.innerText);
    console.log(`📝 Texto de la página (primeros 500 chars):\n${afterLoginText.substring(0, 500)}...`);
    const afterLoginHTML = await page.evaluate(() => document.documentElement.outerHTML);
    console.log(`🏗️ HTML de la página (primeros 800 chars):\n${afterLoginHTML.substring(0, 800)}...`);
    console.log("📄 === FIN CONTENIDO DESPUÉS DEL LOGIN ===");

    // 2) 2FA - Verificar si es necesario
    console.log("🔐 PASO 2: Verificando si se requiere 2FA...");
    
    // Esperar un momento para que la página se cargue completamente
    await new Promise(r => setTimeout(r, 2000));
    
    // Verificar si estamos en la página de 2FA o ya en el dashboard
    const currentUrl = page.url();
    console.log(`🔗 URL actual después del login: ${currentUrl}`);
    
    // Verificar si hay un selector de código 2FA
    const codeSelector = await page.$('#code');
    const authFactorPage = await page.$('#authentication-factor-verify-page');
    
    if (codeSelector || authFactorPage) {
      console.log("🔐 Se detectó página de 2FA, procediendo con verificación...");
      
      const code2FA = generateToken();
      
      console.log("🔍 Verificando selector de código 2FA: #code");
      if (!codeSelector) {
        throw new Error("❌ Selector #code no encontrado en página de 2FA");
      }
      console.log("✅ Selector de código 2FA encontrado");

      console.log(`📝 Escribiendo código 2FA: ${code2FA}`);
      await page.click("#code"); // Click primero para enfocar
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300)); // Delay aleatorio
      await page.type("#code", code2FA, { delay: 100 + Math.random() * 150 }); // Delay variable entre teclas
      console.log("✅ Código 2FA escrito");

      console.log("🔍 Verificando botón de verificación 2FA: #authentication-factor-verify-page input[type='submit']");
      const verifyButton = await page.$("#authentication-factor-verify-page input[type='submit']");
      if (!verifyButton) {
        throw new Error("❌ Botón de verificación 2FA no encontrado");
      }
      console.log("✅ Botón de verificación 2FA encontrado");

      // Simular movimiento de mouse antes del click del 2FA
      console.log("🖱️ Simulando movimiento de mouse para 2FA...");
      const verifyButtonBox = await verifyButton.boundingBox();
      if (verifyButtonBox) {
        await page.mouse.move(
          verifyButtonBox.x + verifyButtonBox.width * (0.3 + Math.random() * 0.4),
          verifyButtonBox.y + verifyButtonBox.height * (0.3 + Math.random() * 0.4)
        );
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
      }

      console.log("🖱️ Haciendo click en botón de verificación 2FA...");
      await page.click("#authentication-factor-verify-page input[type='submit']");
      
      // Esperar a que procese el 2FA
      console.log("⏳ Esperando procesamiento de 2FA...");
      await new Promise(r => setTimeout(r, 3000));
      console.log("✅ 2FA completado");

      // Mostrar contenido después del 2FA
      console.log("📄 === CONTENIDO DESPUÉS DEL 2FA ===");
      const after2FATitle = await page.title();
      console.log(`📋 Título: ${after2FATitle}`);
      const after2FAUrl = page.url();
      console.log(`🔗 URL actual: ${after2FAUrl}`);
      const after2FAText = await page.evaluate(() => document.body.innerText);
      console.log(`📝 Texto de la página (primeros 500 chars):\n${after2FAText.substring(0, 500)}...`);
      const after2FAHTML = await page.evaluate(() => document.documentElement.outerHTML);
      console.log(`🏗️ HTML de la página (primeros 800 chars):\n${after2FAHTML.substring(0, 800)}...`);
      console.log("📄 === FIN CONTENIDO DESPUÉS DEL 2FA ===");
    } else {
      console.log("✅ No se detectó página de 2FA, el login fue directo");
      console.log("🔄 Continuando con el flujo sin verificación adicional...");
      
      // Mostrar contenido actual (sin 2FA)
      console.log("📄 === CONTENIDO SIN 2FA ===");
      const no2FATitle = await page.title();
      console.log(`📋 Título: ${no2FATitle}`);
      const no2FAUrl = page.url();
      console.log(`🔗 URL actual: ${no2FAUrl}`);
      const no2FAText = await page.evaluate(() => document.body.innerText);
      console.log(`📝 Texto de la página (primeros 500 chars):\n${no2FAText.substring(0, 500)}...`);
      const no2FAHTML = await page.evaluate(() => document.documentElement.outerHTML);
      console.log(`🏗️ HTML de la página (primeros 800 chars):\n${no2FAHTML.substring(0, 800)}...`);
      console.log("📄 === FIN CONTENIDO SIN 2FA ===");
    }

    // 3) Navegar al dashboard (lanza la petición)
    console.log("🏠 PASO 3: Navegando al dashboard...");
    const dashboardUrl = "https://perlastore6.mitiendanube.com/admin/v2/apps/envionube/ar/dashboard";
    console.log(`🔗 URL del dashboard: ${dashboardUrl}`);
    
    await page.goto(dashboardUrl, { waitUntil: "networkidle2" });
    console.log("✅ Dashboard cargado");

    // Mostrar contenido del dashboard
    console.log("📄 === CONTENIDO DEL DASHBOARD ===");
    const dashboardTitle = await page.title();
    console.log(`📋 Título: ${dashboardTitle}`);
    const dashboardCurrentUrl = page.url();
    console.log(`🔗 URL actual: ${dashboardCurrentUrl}`);
    const dashboardText = await page.evaluate(() => document.body.innerText);
    console.log(`📝 Texto de la página (primeros 500 chars):\n${dashboardText.substring(0, 500)}...`);
    const dashboardHTML = await page.evaluate(() => document.documentElement.outerHTML);
    console.log(`🏗️ HTML de la página (primeros 800 chars):\n${dashboardHTML.substring(0, 800)}...`);
    console.log("📄 === FIN CONTENIDO DEL DASHBOARD ===");

    // Esperar más tiempo y verificar que la aplicación esté cargada
    console.log("⏳ Esperando a que la aplicación se cargue completamente...");
    
    // Esperar hasta 30 segundos a que aparezca contenido real (no solo "Cargando...")
    let attempts = 0;
    const maxAttempts = 30; // 30 segundos máximo
    
    while (attempts < maxAttempts && !authHeader) {
      await new Promise((r) => setTimeout(r, 1000)); // Esperar 1 segundo
      attempts++;
      
      // Verificar si el contenido ya no es solo "Cargando..."
      const currentContent = await page.evaluate(() => document.body.innerText);
      const isStillLoading = currentContent.trim() === "Cargando......" || currentContent.trim() === "...";
      
      console.log(`⏳ Intento ${attempts}/${maxAttempts} - Contenido: ${isStillLoading ? 'Aún cargando...' : 'Aplicación cargada'}`);
      
      if (!isStillLoading && !authHeader) {
        // La aplicación se cargó pero aún no tenemos el token, esperar un poco más
        console.log("🔄 Aplicación cargada, esperando requests de API...");
        await new Promise((r) => setTimeout(r, 2000)); // Esperar 2 segundos más
        break;
      }
      
      if (authHeader) {
        console.log("✅ Token capturado durante la espera!");
        break;
      }
    }
    
    if (attempts >= maxAttempts && !authHeader) {
      console.log("⚠️ Tiempo máximo de espera alcanzado, intentando refrescar la página...");
      await page.reload({ waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 3000)); // Esperar 3 segundos después del refresh
    }

    if (!authHeader) {
      console.error("❌ No se capturó ningún header Authorization");
      console.log("🔍 Verificando si hay elementos en la página...");
      const bodyContent = await page.evaluate(() => document.body.innerText);
      console.log(`📄 Contenido de la página (primeros 200 chars): ${bodyContent.substring(0, 200)}...`);
      
      // Mostrar todas las requests que se hicieron
      console.log("📡 === ANÁLISIS DE REQUESTS ===");
      console.log("🔍 Buscando requests que contengan 'orders', 'api', 'authorization'...");
      // Este log se mostrará en el interceptor de requests arriba
      console.log("📡 === FIN ANÁLISIS DE REQUESTS ===");
      
      throw new Error("No se capturó ningún header Authorization");
    }
    
    console.log("🎉 Proceso completado exitosamente");
    return authHeader;
  } catch (error) {
    console.error("💥 Error en fetchAuthToken:", error.message);
    console.error("📍 Stack trace:", error.stack);
    
    // Mostrar contenido de la página donde falló
    try {
      console.log("📄 === CONTENIDO DE LA PÁGINA DONDE FALLÓ ===");
      const errorPageTitle = await page.title();
      console.log(`📋 Título: ${errorPageTitle}`);
      const errorPageUrl = page.url();
      console.log(`🔗 URL actual: ${errorPageUrl}`);
      const errorPageText = await page.evaluate(() => document.body.innerText);
      console.log(`📝 Texto completo de la página:\n${errorPageText}`);
      const errorPageHTML = await page.evaluate(() => document.documentElement.outerHTML);
      console.log(`🏗️ HTML completo de la página:\n${errorPageHTML}`);
      console.log("📄 === FIN CONTENIDO DE LA PÁGINA DONDE FALLÓ ===");
    } catch (pageError) {
      console.error("❌ No se pudo obtener el contenido de la página donde falló:", pageError.message);
    }
    
    throw error;
  } finally {
    console.log("🔒 Cerrando browser...");
    if (browser) {
      await browser.close();
      console.log("✅ Browser cerrado");
    }
  }
}

// --- Express ---
const app = express();
app.use(express.json());

app.post("/token", async (_req, res) => {
  console.log("📬 POST /token recibido, iniciando login…");
  let attempt = 0;
  while (attempt < 3) {
    attempt++;
    try {
      console.log(`🔄 Intento #${attempt} de 3`);
      const token = await fetchAuthToken();
      console.log("✅ Token capturado, devolviendo al cliente");
      return res.json({ authorization: token });
    } catch (err) {
      console.error(`❌ Error en intento #${attempt}:`, err.message);
      if (attempt < 3) {
        console.log(`⏳ Esperando 3 segundos antes del siguiente intento...`);
        await new Promise(r => setTimeout(r, 3000));
      }
      // continúa al siguiente intento
    }
  }
  console.error("💀 Todos los intentos fallaron");
  res.status(500).json({ error: "No se pudo obtener el token después de 3 intentos" });
});

app.listen(PORT, () =>
  console.log(`⚡️ Servicio escuchando en http://localhost:${PORT}`)
);

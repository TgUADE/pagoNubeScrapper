// index.js
"use strict";
require("dotenv").config();
const express = require("express");

// Usar puppeteer-extra con plugins GRATUITOS para bypass de reCAPTCHA
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
const UserAgent = require('user-agents');

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

// Configurar plugins de puppeteer-extra (SOLO GRATUITOS)
puppeteer.use(StealthPlugin());
console.log("🛡️ Plugin Stealth configurado (técnicas gratuitas de evasión)");

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
  
  // Verificar entorno
  console.log("🔍 === VERIFICACIÓN DEL ENTORNO ===");
  console.log(`🐧 Sistema operativo: ${process.platform}`);
  console.log(`📁 Directorio actual: ${process.cwd()}`);
  console.log(`🔧 Variables de entorno relevantes:`);
  console.log(`   - DISPLAY: ${process.env.DISPLAY || 'No configurado'}`);
  console.log(`   - DEBUG_MODE: ${process.env.DEBUG_MODE || 'No configurado'}`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'No configurado'}`);
  console.log("🔍 === FIN VERIFICACIÓN DEL ENTORNO ===");
  
  // Configuración del browser - equilibrada entre anti-detección y funcionalidad
  console.log("🛡️ Configurando browser con técnicas anti-detección equilibradas...");
  
  // Generar user agent aleatorio pero realista
  const userAgent = new UserAgent();
  const randomUA = userAgent.toString();
  console.log(`🎭 User Agent aleatorio: ${randomUA}`);
  
  // Viewport aleatorio para parecer más humano
  const randomViewport = {
    width: 1920 + Math.floor(Math.random() * 100),
    height: 1080 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  };
  console.log(`📱 Viewport aleatorio: ${randomViewport.width}x${randomViewport.height}`);
  
  const browserOptions = {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled', // Crítico para evitar detección
      '--disable-extensions',
      '--disable-plugins',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--disable-translate',
      '--disable-default-apps',
      '--disable-component-extensions-with-background-pages',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-client-side-phishing-detection',
      '--disable-datasaver-prompt',
      '--disable-domain-reliability',
      '--disable-features=TranslateUI',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--password-store=basic',
      '--use-mock-keychain',
      // Argumentos adicionales para bypass de detección
      '--disable-automation',
      '--exclude-switches=enable-automation',
      '--disable-extensions-http-throttling',
      '--metrics-recording-only',
      '--no-report-upload',
      '--safebrowsing-disable-auto-update'
    ],
    headless: process.env.DEBUG_MODE !== 'true' ? 'new' : false, // Si DEBUG_MODE=true, mostrar browser
    slowMo: process.env.DEBUG_MODE === 'true' ? 100 : 50 + Math.floor(Math.random() * 50), // Delay aleatorio para parecer humano
    defaultViewport: randomViewport,
    ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'], // Permitir extensiones
    ignoreHTTPSErrors: true,
    timeout: 60000,
    devtools: false,
  };
  
  console.log("🚀 Intentando lanzar browser con configuración anti-detección equilibrada...");
  
  let browser;
  try {
    browser = await puppeteer.launch(browserOptions);
    console.log("🌐 Browser lanzado exitosamente");
  } catch (launchError) {
    console.error("💥 Error al lanzar el browser:", launchError.message);
    console.error("📍 Stack trace del error de lanzamiento:", launchError.stack);
    
    // Intentar con configuración más básica para Docker
    console.log("🔄 Intentando con configuración básica...");
    const basicOptions = {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: process.env.DEBUG_MODE !== 'true',
      slowMo: process.env.DEBUG_MODE === 'true' ? 100 : 0,
      ignoreHTTPSErrors: true
    };
    
    try {
      browser = await puppeteer.launch(basicOptions);
      console.log("🌐 Browser lanzado exitosamente con configuración básica");
    } catch (basicError) {
      console.error("💀 Error crítico: No se pudo lanzar el browser ni con configuración básica");
      console.error("📍 Error básico:", basicError.message);
      throw new Error(`No se pudo lanzar el browser: ${basicError.message}`);
    }
  }

  try {
    const page = await browser.newPage();
    console.log("📄 Nueva página creada");
    
    // Configuraciones anti-detección de bots - TÉCNICAS EQUILIBRADAS
    console.log("🤖 Configurando anti-detección de bots con técnicas equilibradas...");
    
    // Establecer user agent aleatorio
    await page.setUserAgent(randomUA);
    
    // TÉCNICA 1: Ocultar que es un navegador automatizado
    await page.evaluateOnNewDocument(() => {
      // Pass webdriver check - Eliminar la propiedad webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Eliminar propiedades de automatización
      delete window.webdriver;
      delete window.__webdriver_evaluate;
      delete window.__selenium_evaluate;
      delete window.__webdriver_script_function;
      delete window.__webdriver_script_func;
      delete window.__webdriver_script_fn;
      delete window.__fxdriver_evaluate;
      delete window.__driver_unwrapped;
      delete window.__webdriver_unwrapped;
      delete window.__driver_evaluate;
      delete window.__selenium_unwrapped;
      delete window.__fxdriver_unwrapped;
    });

    // TÉCNICA 2: Pass chrome check - Agregar propiedades de Chrome
    await page.evaluateOnNewDocument(() => {
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
    });

    // TÉCNICA 3: Pass notifications check - Sobrescribir permisos
    await page.evaluateOnNewDocument(() => {
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    // TÉCNICA 4: Pass plugins check - Sobrescribir la propiedad plugins
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    // TÉCNICA 5: Pass languages check - Sobrescribir la propiedad languages
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-ES', 'es', 'en-US', 'en'],
      });
    });
    
    // TÉCNICA 6: Configurar headers HTTP realistas
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document'
    });
    
    console.log("✅ Configuración anti-detección equilibrada completada");
    
    // TÉCNICA 7: Función para detectar y evadir reCAPTCHA (SOLO MÉTODOS GRATUITOS)
    const solveRecaptchaIfPresent = async () => {
      try {
        console.log("🔍 Verificando presencia de reCAPTCHA...");
        
        // Buscar diferentes tipos de reCAPTCHA
        const recaptchaSelectors = [
          'iframe[src*="recaptcha"]',
          '.g-recaptcha',
          '#recaptcha',
          '[data-sitekey]',
          '.recaptcha-checkbox',
          '.rc-anchor-container',
          '.rc-imageselect',
          '#recaptcha-anchor',
          '.recaptcha-checkbox-border'
        ];
        
        let recaptchaFound = false;
        
        for (const selector of recaptchaSelectors) {
          const element = await page.$(selector);
          if (element) {
            console.log(`🎯 reCAPTCHA detectado con selector: ${selector}`);
            recaptchaFound = true;
            break;
          }
        }
        
        if (recaptchaFound) {
          console.log("🔓 Intentando evadir reCAPTCHA con técnicas gratuitas...");
          
          // TÉCNICA 1: Esperar y verificar si se resuelve automáticamente
          console.log("⏳ Esperando resolución automática...");
          await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
          
          // TÉCNICA 2: Simular interacciones humanas sutiles
          console.log("🖱️ Simulando interacciones humanas...");
          
          // Movimientos de mouse aleatorios sobre la página
          for (let i = 0; i < 3; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 600;
            await page.mouse.move(x, y);
            await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
          }
          
          // TÉCNICA 3: Intentar hacer click en checkbox si es reCAPTCHA v2
          try {
            const checkboxSelectors = [
              '.recaptcha-checkbox-border',
              '.rc-anchor-checkbox',
              '#recaptcha-anchor',
              '.recaptcha-checkbox'
            ];
            
            for (const selector of checkboxSelectors) {
              const checkbox = await page.$(selector);
              if (checkbox) {
                console.log(`☑️ Intentando click en checkbox: ${selector}`);
                
                // Simular hover antes del click
                await page.hover(selector);
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
                
                // Click con delay humano
                await page.click(selector);
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
                
                console.log("✅ Click en checkbox realizado");
                break;
              }
            }
          } catch (err) {
            console.log("⚠️ No se pudo hacer click en checkbox:", err.message);
          }
          
          console.log("✅ reCAPTCHA procesado");
        } else {
          console.log("✅ No se detectó reCAPTCHA");
        }
      } catch (error) {
        console.log("⚠️ Error al verificar/evadir reCAPTCHA:", error.message);
        // No lanzar error, continuar con el flujo
      }
    };
    
    let authHeader = null;

    // Interceptamos la request de orders y otras requests de API
    page.on("request", (req) => {
      const url = req.url();
      
      // Buscar requests que puedan contener el token de autorización
      if (url.includes("/stores/orders") || 
          url.includes("/api/") || 
          url.includes("/admin/") ||
          url.includes("envionube")) {
        console.log(`�� Request detectada: ${url.substring(0, 80)}...`);
        
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
      timeout: 60000
    });
    console.log("✅ Página de login cargada");
    
    // Verificar y resolver reCAPTCHA si está presente
    await solveRecaptchaIfPresent();

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
    // Simular comportamiento humano más realista pero sin ser demasiado lento
    await page.hover("#user-mail"); // Hover antes del click
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
    await page.click("#user-mail"); // Click para enfocar
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300)); // Delay realista
    await page.type("#user-mail", USER_EMAIL, { delay: 50 + Math.random() * 50 });
    console.log("✅ Email escrito");

    console.log("📝 Escribiendo password...");
    // Simular comportamiento humano para password
    await page.hover("#pass"); // Hover antes del click
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
    await page.click("#pass"); // Click para enfocar
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300)); // Delay realista
    await page.type("#pass", USER_PASSWORD, { delay: 50 + Math.random() * 50 });
    console.log("✅ Password escrito");
    
    // Verificar reCAPTCHA antes del submit
    await solveRecaptchaIfPresent();

    console.log("🔍 Verificando botón de login: .js-tkit-loading-button");
    const loginButton = await page.$('.js-tkit-loading-button');
    if (!loginButton) {
      throw new Error("❌ Botón de login .js-tkit-loading-button no encontrado");
    }
    console.log("✅ Botón de login encontrado");

    console.log("🖱️ Haciendo click en botón de login...");
    await Promise.all([
      page.click(".js-tkit-loading-button"),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    ]);
    console.log("✅ Login completado, navegación exitosa");

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
      
      // Verificar reCAPTCHA en página de 2FA
      await solveRecaptchaIfPresent();
      
      const code2FA = generateToken();
      
      console.log("🔍 Verificando selector de código 2FA: #code");
      if (!codeSelector) {
        throw new Error("❌ Selector #code no encontrado en página de 2FA");
      }
      console.log("✅ Selector de código 2FA encontrado");

      console.log(`📝 Escribiendo código 2FA: ${code2FA}`);
      // Simular comportamiento humano para 2FA
      await page.hover("#code");
      await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
      await page.click("#code"); // Click para enfocar
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      await page.type("#code", code2FA, { delay: 50 + Math.random() * 50 });
      console.log("✅ Código 2FA escrito");

      console.log("🔍 Verificando botón de verificación 2FA: #authentication-factor-verify-page input[type='submit']");
      const verifyButton = await page.$("#authentication-factor-verify-page input[type='submit']");
      if (!verifyButton) {
        throw new Error("❌ Botón de verificación 2FA no encontrado");
      }
      console.log("✅ Botón de verificación 2FA encontrado");

      console.log("🖱️ Haciendo click en botón de verificación 2FA...");
      await Promise.all([
        page.click("#authentication-factor-verify-page input[type='submit']"),
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
      ]);
      console.log("✅ 2FA completado, navegación exitosa");

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
    
    await page.goto(dashboardUrl, { waitUntil: "networkidle2", timeout: 60000 });
    console.log("✅ Dashboard cargado");
    
    // Verificar reCAPTCHA en el dashboard
    await solveRecaptchaIfPresent();

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
      await page.reload({ waitUntil: "networkidle2", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 3000)); // Esperar 3 segundos después del refresh
      
      // Verificar reCAPTCHA después del refresh
      await solveRecaptchaIfPresent();
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
    
    console.log("🎉 Proceso completado exitosamente con técnicas anti-reCAPTCHA equilibradas");
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

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

// Genera el código TOTP
function generateToken() {
  try {
    return authenticator.generate(TOKEN_CODE);
  } catch (err) {
    console.error("❌ Error generando TOTP:", err);
    throw err;
  }
}

// Hace todo el flujo de login y captura el header
async function fetchAuthToken() {
  // const browser = await puppeteer.launch({
  //   headless: "shell",
  //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
  // });

  const browser = await puppeteer.launch({args: ['--no-sandbox']});

  try {
    const page = await browser.newPage();
    let authHeader = null;

    // Interceptamos la request de orders
    page.on("request", (req) => {
      if (req.url().includes("/stores/orders") && req.headers().authorization) {
        authHeader = req.headers().authorization;
      }
    });

    // 1) Login
    await page.goto("https://www.tiendanube.com/login", {
      waitUntil: "networkidle2",
    });
    await page.type("#user-mail", USER_EMAIL, { delay: 100 });
    await page.type("#pass", USER_PASSWORD, { delay: 100 });
    await Promise.all([
      page.click(".js-tkit-loading-button"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    // 2) 2FA
    const code2FA = generateToken();
    await page.type("#code", code2FA, { delay: 100 });
    await Promise.all([
      page.click("#authentication-factor-verify-page input[type='submit']"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    // 3) Navegar al dashboard (lanza la petición)
    await page.goto(
      "https://perlastore6.mitiendanube.com/admin/v2/apps/envionube/ar/dashboard",
      { waitUntil: "networkidle2" }
    );

    // Pequeña pausa para asegurar que la petición ocurra
    await new Promise((r) => setTimeout(r, 1000));

    if (!authHeader) {
      throw new Error("No se capturó ningún header Authorization");
    }
    return authHeader;
  } finally {
    await browser.close();
  }
}

// --- Express ---
const app = express();
app.use(express.json());

app.post("/token", async (_req, res) => {
  console.log("📬 POST /token recibido, iniciando login…");
  let attempt = 0;
  while (attempt < 5) {
    attempt++;
    try {
      console.log(`🔄 Intento #${attempt}`);
      const token = await fetchAuthToken();
      console.log("✅ Token capturado, devolviendo al cliente");
      return res.json({ authorization: token });
    } catch (err) {
      console.error(`❌ Error en intento #${attempt}:`, err.message);
      // continúa al siguiente intento
    }
  }
});

app.listen(PORT, () =>
  console.log(`⚡️ Servicio escuchando en http://localhost:${PORT}`)
);

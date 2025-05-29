#!/bin/bash

echo "🚀 Iniciando Pago Nube Scrapper..."

# Verificar que Chrome esté instalado
if command -v google-chrome-stable &> /dev/null; then
    echo "✅ Google Chrome encontrado: $(google-chrome-stable --version)"
else
    echo "❌ Google Chrome no encontrado. Instalando..."
    # Instalar Chrome si no está presente
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list
    apt-get update
    apt-get install -y google-chrome-stable
fi

# Verificar variables de entorno
echo "🔍 Verificando variables de entorno..."
if [ -z "$USER_EMAIL" ]; then
    echo "❌ USER_EMAIL no está configurado"
    exit 1
fi

if [ -z "$USER_PASSWORD" ]; then
    echo "❌ USER_PASSWORD no está configurado"
    exit 1
fi

if [ -z "$TOKEN_CODE" ]; then
    echo "❌ TOKEN_CODE no está configurado"
    exit 1
fi

echo "✅ Variables de entorno configuradas correctamente"

# Configurar límites de memoria compartida
echo "🔧 Configurando memoria compartida..."
mount -t tmpfs -o size=512m tmpfs /dev/shm 2>/dev/null || echo "⚠️ No se pudo configurar /dev/shm (puede ser normal en algunos contenedores)"

# Iniciar la aplicación
echo "🎯 Iniciando aplicación Node.js..."
exec node scrapperPagoNube.js 
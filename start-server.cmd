@echo off
setlocal

REM Shinseikan Karate - servidor local sin dependencias
REM Requiere Node.js instalado (node.exe en PATH)

cd /d "%~dp0"

echo Iniciando servidor en http://localhost:5500/ ...
echo Admin: http://localhost:5500/admin/
echo (Cierra esta ventana para detener el servidor)
echo.

start "" "http://localhost:5500/dojo/"
node serve.mjs 5500

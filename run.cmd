@echo off
setlocal

REM Windows runner (no make required)
REM Starts Angular dev server using the proxy config

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not on PATH. Please install Node.js and reopen your terminal.
  exit /b 1
)

npx ng serve --proxy-config proxy.conf.json

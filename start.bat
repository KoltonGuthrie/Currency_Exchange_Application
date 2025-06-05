@echo off
echo Installing dependencies...
call npm run install-dependencies

echo Starting server...
start cmd.exe /k "npm run start-server"

TIMEOUT /T 2

echo Starting client...
start cmd.exe /k "npm run start-client"
@echo off
echo Installing dependencies...
call npm run install-dependencies

echo Starting server...
start cmd.exe /c "npm run start-server"

TIMEOUT /T 2

echo Starting client...
start cmd.exe /c "npm run start-client"
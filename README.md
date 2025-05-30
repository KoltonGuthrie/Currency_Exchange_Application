# Electron - Currency Exchange Application

![Currency Conversion Calculator](https://github.com/user-attachments/assets/b8f7f55a-78e3-4716-a492-ba3e83f60bf4)

A simple Electron-based desktop application for converting currencies using real-time exchange rate data.

## Setup

To get started, follow these steps to configure and run the application locally.

### 1. Configure the API Key
- Rename the `.env.example` file to `.env`.
- Sign up for an API key at the [Exchange Rates Data API](https://apilayer.com/marketplace/exchangerates_data-api).
- Update the `.env` file by adding your `API_KEY`.

### 2. Install Dependencies
Run the following command to install the required dependencies:
```bash
npm run install-dependencies
```

### 3. Run the Application
You can start the server and client separately or use a single script to launch both.

#### Option 1: Start Server and Client Separately
- Start the server:
  ```bash
  npm run start-server
  ```
- Start the client:
  ```bash
  npm run start-client
  ```

#### Option 2: Run Automatically
- Run the `start.bat` file to handle dependency installation, server, and client startup in one go:
  ```bash
  ./start.bat
  ```

## Notes
- Ensure [Node.js](https://nodejs.org/) and npm are installed on your system.
- The application uses the [Exchange Rates Data API](https://apilayer.com/marketplace/exchangerates_data-api) for real-time exchange rate data.

# Salesforce Validation Rule Manager

A full-stack web application that allows Salesforce users to manage Account validation rules dynamically. Built for the Associate Software Engineer assignment.

## 🚀 Features

- **Salesforce OAuth 2.0**: Securely log in using your Salesforce Developer Org.
- **Metadata Management**: Fetch validation rules specifically for the Account object using the Tooling API.
- **Dynamic Toggle**: Enable or disable validation rules with a single click.
- **Real-time Updates**: Changes are deployed back to Salesforce instantly.
- **Responsive UI**: Modern, clean dashboard built with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Axios, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express, JSForce (Salesforce Integration), JWT, Cookie-parser.
- **Authentication**: Salesforce OAuth 2.0 Authorization Code Flow.

## 📋 Prerequisites

- A [Salesforce Developer Edition](https://developer.salesforce.com/signup) org.
- Node.js (v16 or higher) and npm installed.

## ⚙️ Salesforce Setup

### 1. Create Validation Rules
1. Log in to your Salesforce Org.
2. Go to **Object Manager** > **Account** > **Validation Rules**.
3. Create 4-5 validation rules. 
   - Example: `Validation_Rule_1`, `Validation_Rule_2`.
   - Ensure they are initially set to **Inactive** (optional).

### 2. Create a Connected App
1. Go to **Setup** > **App Manager** > **New Connected App**.
2. **Connected App Name**: `Metadata Manager`.
3. **Contact Email**: Your email.
4. **Enable OAuth Settings**: Checked.
5. **Callback URL**: `http://localhost:5000/api/auth/callback` (for local development).
6. **Selected OAuth Scopes**:
   - `Manage user data via APIs (api)`
   - `Manage user data via Web browsers (web)`
   - `Full access (full)`
   - `Perform requests at any time (refresh_token, offline_access)`
7. **Require Secret for Web Server Flow**: Checked.
8. Click **Save** (Wait ~10 mins for changes to propagate).
9. Copy the **Consumer Key** (Client ID) and **Consumer Secret** (Client Secret).

## 🚀 Getting Started

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   SALESFORCE_CLIENT_ID=your_consumer_key
   SALESFORCE_CLIENT_SECRET=your_consumer_secret
   SALESFORCE_REDIRECT_URI=http://localhost:5000/api/auth/callback
   JWT_SECRET=your_random_secret
   CLIENT_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 Project Architecture

### OAuth Flow
1. User clicks "Connect to Salesforce".
2. Backend redirects user to Salesforce login page.
3. After login, Salesforce redirects back to `/api/auth/callback` with a `code`.
4. Backend exchanges the `code` for an `access_token` and `refresh_token`.
5. User session is stored in a secure HTTP-only cookie using JWT.

### Tooling API Usage
The app uses `jsforce` to interact with the Salesforce Tooling API. 
- **Fetch**: `SELECT Id, ValidationName, Active, ErrorMessage FROM ValidationRule WHERE EntityDefinitionId = 'Account'`
- **Update**: `conn.tooling.sobject('ValidationRule').update({ Id, Active })`

## 📄 License
ISC

# Salesforce Setup Guide

Follow these steps to prepare your Salesforce Developer Org for this project.

## 1. Create Validation Rules
1. Log in to your [Salesforce Developer Org](https://login.salesforce.com).
2. Click the **Gear Icon** (top right) > **Setup**.
3. Go to **Object Manager** tab.
4. Search for and click on **Account**.
5. Click **Validation Rules** in the left sidebar.
6. Click **New**.
7. Create at least 2 rules:
   - **Rule 1**:
     - Rule Name: `Validation_Rule_1`
     - Description: `Testing rule 1`
     - Error Condition Formula: `ISBLANK(Phone)`
     - Error Message: `Phone is required for Accounts.`
     - Error Location: `Top of Page`
     - **Active**: Unchecked (Initially)
   - **Rule 2**:
     - Rule Name: `Validation_Rule_2`
     - Description: `Testing rule 2`
     - Error Condition Formula: `ISBLANK(Website)`
     - Error Message: `Website is required for Accounts.`
     - Error Location: `Top of Page`
     - **Active**: Unchecked (Initially)
8. Click **Save**.

## 2. Create a Connected App
1. In **Setup**, search for **App Manager** in the Quick Find box.
2. Click **New Connected App** (top right).
3. Fill in the following:
   - **Connected App Name**: `Metadata Manager`
   - **API Name**: `Metadata_Manager`
   - **Contact Email**: (Your email)
4. In **API (Enable OAuth Settings)**:
   - Check **Enable OAuth Settings**.
   - **Callback URL**: `http://localhost:5000/api/auth/callback`
   - **Selected OAuth Scopes**:
     - `Manage user data via APIs (api)`
     - `Manage user data via Web browsers (web)`
     - `Full access (full)`
     - `Perform requests at any time (refresh_token, offline_access)`
   - Check **Require Secret for Web Server Flow**.
5. Click **Save**.
6. Click **Continue**.
7. You will see **Consumer Key** and **Consumer Secret**. Click **Manage Consumer Details** to view them.
8. **IMPORTANT**: It can take up to 10 minutes for a new Connected App to become active in Salesforce.

## 3. Environment Variables
Copy the **Consumer Key** and **Consumer Secret** into your backend `.env` file:

```env
SALESFORCE_CLIENT_ID=your_consumer_key
SALESFORCE_CLIENT_SECRET=your_consumer_secret
SALESFORCE_REDIRECT_URI=http://localhost:5000/api/auth/callback
SALESFORCE_LOGIN_URL=https://login.salesforce.com
```

# Video Explanation Script: Salesforce Validation Rule Manager

**Tone:** Natural, Confident, Professional, Junior-friendly.
**Duration:** ~8-10 Minutes.

---

## 1. Introduction (0:00 - 1:00)
"Hi everyone! My name is [Your Name], and today I’m excited to walk you through my Salesforce integration project. 

The goal of this project was to build a realistic, production-like tool that allows Salesforce administrators or developers to manage Account validation rules dynamically from an external web application. 

Instead of navigating through the complex Salesforce Setup menu, users can log in via OAuth and toggle rules ON or OFF with a single click. Let’s dive in!"

## 2. Salesforce Setup (1:00 - 2:30)
"Before looking at the code, let’s see the Salesforce side. 

In my Developer Org, I’ve created several validation rules on the Account object. For example, 'Validation Rule 1' and 'Validation Rule 2'. Initially, I’ve kept them disabled.

To allow our external app to talk to Salesforce, I set up a **Connected App**. I enabled OAuth settings and selected scopes like 'Full Access' and 'Refresh Token'. This gives our app the permission to use the Tooling API to read and update metadata."

## 3. Tech Stack Overview (2:30 - 3:30)
"For the tech stack, I chose:
- **Frontend:** React with Vite for a fast development experience. I used Tailwind CSS for a clean, modern UI and the Context API to manage authentication state.
- **Backend:** Node.js with Express. I used the `jsforce` library, which is the industry standard for Salesforce-Node integrations.
- **Security:** I implemented JWT for session management and stored tokens in secure HTTP-only cookies to prevent XSS attacks."

## 4. OAuth Flow Explanation (3:30 - 5:00)
"One of the core features is the **Salesforce OAuth 2.0 Authorization Code Flow**. 

When a user clicks 'Connect to Salesforce', the backend generates a secure authorization URL. Once the user logs in and approves the app, Salesforce sends a code back to our callback route. 

The backend then exchanges this code for an access token. I’ve avoided hardcoding any credentials—everything is handled dynamically, so this app works for *any* Salesforce Developer Org user."

## 5. Backend & Tooling API (5:00 - 6:30)
"On the backend, I created clean Express routes. The most interesting part is the **Metadata Route**. 

I’m using the **Salesforce Tooling API** because it’s specifically designed for managing metadata like validation rules. 

In the `getValidationRules` controller, I run a SOQL query against the `ValidationRule` object, filtering specifically for the Account entity. 

For toggling rules, I use the `sobject().update()` method from jsforce. This sends a PATCH request back to Salesforce to update the `Active` status."

## 6. Frontend Walkthrough (6:30 - 8:00)
"Now, let’s look at the UI. I wanted a professional dashboard feel—nothing too over-engineered, but clean and responsive.

The Dashboard shows the logged-in user's name and their Org name, which we fetch during the auth flow. 

The validation rules are displayed in a card-based table. Each row shows the rule name, its current status with color-coded badges, and a toggle button. 

I used **React Hot Toast** for notifications, so the user gets immediate feedback when a rule is successfully updated or if an error occurs."

## 7. Challenges & Improvements (8:00 - 9:30)
"One challenge I faced was handling the Tooling API query. Unlike standard objects, querying metadata requires specific permissions and the correct `EntityDefinitionId`. I had to ensure the Connected App had the 'Full Access' scope for this to work smoothly.

If I had more time, I’d love to add:
- A search bar for rules (which I've actually implemented a basic version of!).
- Support for other objects like Contacts or Opportunities.
- A 'History' log to see who changed which rule and when.

Overall, this project shows how we can bridge the gap between custom web apps and Salesforce metadata."

## 8. Conclusion (9:30 - 10:00)
"Thanks for watching! This project was a great way to demonstrate my skills in full-stack development and Salesforce integration. I’m looking forward to discussing it further in the interview!"

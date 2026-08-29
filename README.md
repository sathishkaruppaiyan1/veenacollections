<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1N4jXB_dDf_ocyenBAInDLLouPbm4B-AP

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Newsletter (WordPress)

The footer Subscribe form sends emails to your WordPress site. **Suggested plugins:**

- **MC4WP (Mailchimp for WordPress)** – Integrates with Mailchimp; exposes `/wp-json/mc4wp/v1/subscribe`. Install, connect your list, and the app will POST there.
- **Newsletter** by Stefano Lissa – Built-in lists and double opt-in. Use their form shortcode or add a custom REST route that forwards to their subscription API.
- **Icegram Express (Email Subscribers)** – Free, good for smaller lists; add a custom REST endpoint that saves to their tables if needed.

If no plugin is installed, the thank‑you message still appears; install one of the above (or a custom REST route) to store subscriptions in WordPress.

## Google OAuth (Sign in with Google)

The Login / My Account page supports **Sign in with Google**. To enable it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Create an **OAuth 2.0 Client ID** (or use an existing one). Application type: **Web application**.
3. Under **Authorized JavaScript origins**, add your app URL(s):
   - Local dev: `http://localhost:3000`
   - Local dev IP form, if you open it that way: `http://127.0.0.1:3000`
   - Production storefront URL, e.g. `https://your-domain.com`
4. Copy the **Client ID** and set it in your environment:
   - Create `.env` or `.env.local` with: `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`
   - Or copy from [.env.example](.env.example).
5. Restart the dev server. The “Or sign in with Google” option appears on the Login form.

If `VITE_GOOGLE_CLIENT_ID` is not set, the Google button is hidden; email/password and Register still work.

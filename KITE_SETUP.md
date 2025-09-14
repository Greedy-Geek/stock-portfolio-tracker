# Zerodha Kite API Setup Guide

This guide will help you set up Zerodha Kite API integration to display your real portfolio holdings.

## Prerequisites

- Active Zerodha trading account
- Basic understanding of environment variables

## Step 1: Create Kite Connect App

1. **Visit Kite Apps**: Go to [https://kite.zerodha.com/apps](https://kite.zerodha.com/apps)
2. **Login**: Use your Zerodha credentials to log in
3. **Create New App**: Click "Create new app"
4. **Fill App Details**:

   - **App Name**: `Stock Portfolio Tracker` (or any name you prefer)
   - **App Type**: Select "Connect"
   - **Redirect URL**: `http://localhost:3000` (for development)
   - **Description**: Brief description of your app

5. **Submit**: After creation, you'll get:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)

## Step 2: Generate Access Token

Kite Connect requires an access token that needs to be generated through the login flow:

### Option A: Manual Token Generation (Recommended for testing)

1. **Login URL**: Visit this URL (replace `your_api_key` with your actual API key):

   ```
   https://kite.trade/connect/login?api_key=your_api_key&v=3
   ```

2. **Login**: Use your Zerodha credentials to login
3. **Authorize**: Grant permissions to your app
4. **Get Request Token**: After authorization, you'll be redirected to your redirect URL with a `request_token` parameter:

   ```
   http://localhost:3000?request_token=abc123&action=login&status=success
   ```

5. **Generate Access Token**: Use the request token to generate an access token. You can use this Node.js script:

```javascript
const crypto = require("crypto");
const fetch = require("node-fetch");

const api_key = "your_api_key";
const api_secret = "your_api_secret";
const request_token = "request_token_from_redirect";

// Generate checksum
const checksum = crypto
  .createHash("sha256")
  .update(api_key + request_token + api_secret)
  .digest("hex");

// Exchange request token for access token
fetch("https://api.kite.trade/session/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: `api_key=${api_key}&request_token=${request_token}&checksum=${checksum}`,
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Access Token:", data.access_token);
  })
  .catch((error) => console.error("Error:", error));
```

### Option B: Automated Token Generation (Advanced)

For production use, implement the complete OAuth flow in your application.

## Step 3: Set Environment Variables

Create a `.env.local` file in your project root:

```bash
# Alpha Vantage API Key (existing)
ALPHA_VANTAGE_API_KEY=demo

# Zerodha Kite API Credentials
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here
KITE_ACCESS_TOKEN=your_access_token_here
```

**Important**:

- Never commit these credentials to version control
- The access token expires daily and needs to be regenerated
- Keep your API secret secure

## Step 4: Test the Integration

1. **Start Development Server**:

   ```bash
   pnpm dev
   ```

2. **Open Application**: Navigate to `http://localhost:3000`

3. **Switch to Kite Tab**: Click on "Zerodha Portfolio" tab

4. **Fetch Holdings**: Click "Fetch Holdings" button

If everything is set up correctly, you should see your portfolio holdings with:

- Stock symbols and quantities
- Current prices and values
- Profit/Loss calculations
- Portfolio summary

## Troubleshooting

### Common Issues:

1. **"Setup Required" Message**:

   - Check if environment variables are set correctly
   - Restart the development server after adding variables

2. **"Invalid or expired access token"**:

   - Access tokens expire daily
   - Regenerate using the login flow above

3. **"Network error"**:

   - Check your internet connection
   - Verify API credentials are correct

4. **"No holdings found"**:
   - Ensure you have stocks in your Zerodha account
   - Check if the account has any holdings (not just positions)

### API Limits:

- Kite Connect has rate limits (3 requests per second)
- The app automatically handles basic rate limiting
- For high-frequency updates, consider implementing additional throttling

## Production Deployment

For production deployment:

1. **Implement proper OAuth flow** instead of manual token generation
2. **Set up token refresh mechanism** to handle daily expiration
3. **Use secure environment variable management**
4. **Implement proper error handling and logging**
5. **Consider caching to reduce API calls**

## Security Notes

- **Never expose API credentials** in client-side code
- **Use HTTPS** in production
- **Implement proper session management**
- **Regularly rotate API keys**
- **Monitor API usage** for unusual activity

## Support

- **Kite Connect Documentation**: [https://kite.trade/docs/connect/v3/](https://kite.trade/docs/connect/v3/)
- **Zerodha Support**: Contact through Zerodha support channels
- **API Status**: Check [https://status.zerodha.com/](https://status.zerodha.com/) for service status

---

**Note**: This integration is for personal use only. Ensure compliance with Zerodha's terms of service and applicable regulations.

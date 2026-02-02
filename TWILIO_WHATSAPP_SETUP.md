# Twilio WhatsApp Sandbox Setup for Shiksha Mitra

## Step 1: Create Twilio Account

1. Go to [Twilio.com](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

## Step 2: Access WhatsApp Sandbox

1. Log in to your Twilio Console
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Or go directly to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

## Step 3: Get Your Credentials

1. From Twilio Console, go to **Account** → **API keys & tokens**
2. Copy these values:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click to reveal)

## Step 4: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=AC...your_account_sid...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Note:** The sandbox number `+14155238886` is Twilio's default sandbox number.

## Step 5: Install Dependencies

```bash
cd backend
pip install twilio
```

Or if using requirements.txt (already added):
```bash
pip install -r requirements.txt
```

## Step 6: Configure Webhook URL

### For Local Development (using ngrok):

1. Install ngrok: https://ngrok.com/download

2. Start your backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

3. In a new terminal, start ngrok:
   ```bash
   ngrok http 8000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. In Twilio Console → WhatsApp Sandbox Settings:
   - **WHEN A MESSAGE COMES IN:** `https://abc123.ngrok.io/api/whatsapp/webhook`
   - Method: `POST`

### For Production (deployed backend):

Use your deployed backend URL:
```
https://your-app.onrender.com/api/whatsapp/webhook
```

## Step 7: Join Sandbox

1. In Twilio Console, you'll see a unique code like: **join <word>-<word>**
2. From your WhatsApp, send this message to: **+1 415 523 8886**
3. Wait for confirmation message from Twilio

## Step 8: Test the Integration

Send a test message to the sandbox number:
```
Hello
```

You should receive a response from Shiksha Mitra!

## Available Commands

Once connected, you can use:

- `/start` - Start new conversation
- `/help` - Show help message
- `/new` or `/reset` - Clear conversation history
- Any question in Hindi or English

## Testing Checklist

- [ ] Twilio account created
- [ ] Credentials added to .env
- [ ] Backend server running
- [ ] ngrok tunnel active (for local testing)
- [ ] Webhook URL configured in Twilio
- [ ] Joined sandbox with WhatsApp
- [ ] Test message sent and received response

## Troubleshooting

### No response from chatbot:
1. Check if backend is running: `curl http://localhost:8000/api/whatsapp/status`
2. Check ngrok is running and URL matches webhook
3. Check Twilio webhook logs in Console

### "Invalid credentials" error:
- Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env
- Ensure no extra spaces in environment variables

### Webhook not receiving messages:
- Verify webhook URL is HTTPS (ngrok provides this)
- Check Twilio debugger: https://console.twilio.com/us1/monitor/logs/debugger
- Ensure webhook URL ends with `/api/whatsapp/webhook`

## Production Deployment

When deploying to Render/Heroku/etc:

1. Add Twilio environment variables to your hosting platform
2. Update webhook URL to production URL
3. No need for ngrok in production

## Features

✅ Session-based conversation memory per WhatsApp number
✅ Hindi & English language support
✅ RAG-powered responses from NCERT content
✅ Special commands (/start, /help, /reset)
✅ Auto topic detection and sentiment analysis

## Security Notes

- Never commit .env file to Git
- Use Twilio's webhook signature validation in production
- Keep Auth Token secret
- Sandbox is free but has limitations (use production WhatsApp Business API for scale)

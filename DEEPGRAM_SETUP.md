# Deepgram Setup Guide

## Quick Setup (5 minutes)

### 1. Create Deepgram Account

1. Go to [Deepgram Console](https://console.deepgram.com/)
2. Sign up for a free account (no credit card required for free tier)
3. Verify your email address

### 2. Get API Key

1. Once logged in, navigate to the **API Keys** section
2. Click **Create API Key**
3. Give it a name like "Lectra Development"
4. Copy the generated API key

### 3. Add to Environment

1. Open `backend/.env` file
2. Add your API key:
   ```env
   DEEPGRAM_API_KEY=your-actual-api-key-here
   ```

### 4. Test the Setup

1. Start the backend server: `npm run server`
2. Check the console for any Deepgram connection errors
3. If no errors, you're ready to go!

## Free Tier Limits

Deepgram offers a generous free tier:

- **45,000 minutes per month** of transcription
- **3 concurrent streams**
- **No credit card required**

This is more than enough for development and testing.

## Troubleshooting

### Common Issues:

1. **"Invalid API Key" Error**

   - Double-check you copied the full API key
   - Ensure there are no extra spaces or characters
   - Try creating a new API key

2. **"Rate Limit Exceeded" Error**

   - You've hit the monthly free tier limit
   - Wait for the next month or upgrade your plan
   - Check usage in the Deepgram console

3. **"Authentication Failed" Error**
   - Verify the API key is correctly set in `.env`
   - Restart the backend server after adding the key
   - Check that the `.env` file is in the `backend/` directory

### Getting Help:

- [Deepgram Documentation](https://developers.deepgram.com/)
- [Deepgram Support](https://support.deepgram.com/)
- [Deepgram Community](https://github.com/deepgram-devs)

## Why Deepgram?

- **Easy Setup**: Just an API key, no complex Google Cloud setup
- **Great Accuracy**: State-of-the-art speech recognition
- **Fast**: Real-time transcription capabilities
- **Developer Friendly**: Excellent documentation and support
- **Free Tier**: Generous limits for development

That's it! You're now ready to use Deepgram for speech-to-text in Lectra.

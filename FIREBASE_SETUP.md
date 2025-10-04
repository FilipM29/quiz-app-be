# Firebase Setup Guide

This application uses Firebase Admin SDK for user authentication. Follow these steps to configure Firebase environment variables.

## Prerequisites

1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. Firebase Authentication enabled in your project

## Getting Firebase Service Account Credentials

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project

### Step 2: Generate Service Account Key
1. Navigate to **Project Settings** (gear icon)
2. Go to the **Service accounts** tab
3. Click **"Generate new private key"**
4. Download the JSON file (keep it secure!)

### Step 3: Extract Required Values
From the downloaded JSON file, extract these values:

```json
{
  "project_id": "your-project-id",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
}
```

## Environment Variables Setup

### Option 1: Copy from .env.example
```bash
cp .env.example .env
```
Then edit `.env` with your actual Firebase values.

### Option 2: Add to existing .env
Add these lines to your `.env` file:

```bash
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----"
```

## Important Notes

- **Keep your service account key secure** - never commit it to version control
- The `FIREBASE_PRIVATE_KEY` should include the `\n` characters for line breaks
- Make sure your Firebase project has Authentication enabled
- The service account has the necessary permissions for your application

## Testing the Setup

After setting up the environment variables:

1. Restart your development server: `npm run dev`
2. The server should start without Firebase errors
3. Run tests to verify authentication: `npm test`

## Troubleshooting

### Error: "Service account object must contain a string 'project_id' property"
- Check that `FIREBASE_PROJECT_ID` is set correctly
- Verify there are no extra quotes or spaces

### Error: "Invalid private key"
- Ensure `FIREBASE_PRIVATE_KEY` includes the full key with headers
- Check that `\n` characters are properly formatted
- Make sure there are no extra spaces or line breaks

### Error: "Firebase project not found"
- Verify the project ID matches your Firebase project
- Check that the service account has the correct permissions

## Security Best Practices

1. Never commit your `.env` file to version control
2. Use different Firebase projects for development/staging/production
3. Regularly rotate your service account keys
4. Limit service account permissions to only what's needed
5. Monitor your Firebase usage and authentication logs
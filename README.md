# 16Bussy Invitational — Setup Guide

## Quick Overview

This is a Vite + React site that deploys to Vercel (free). The roster saves to a Google Sheet so you can see entries in a spreadsheet too.

**Two things to set up:**
1. Google Sheets backend (10 min)
2. Vercel deployment (5 min)

---

## Step 1: Set Up Google Sheets Backend

### 1a. Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it something like `16Bussy Roster`

### 1b. Add the Apps Script
1. In the spreadsheet, go to **Extensions → Apps Script**
2. Delete any code in the editor
3. Copy the ENTIRE contents of `google-apps-script.js` (included in this project) and paste it in
4. Click the **save icon** (or Ctrl+S) — name the project `16Bussy API`

### 1c. Deploy as Web App
1. In Apps Script, click **Deploy → New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set these options:
   - **Description**: `Roster API`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. Click **Authorize access** → Choose your Google account → click **Advanced** → **Go to 16Bussy API (unsafe)** → **Allow**
6. **Copy the Web app URL** — it looks like: `https://script.google.com/macros/s/AKfycbx.../exec`

> ⚠️ Save this URL! You'll need it for Step 2.

### If you ever need to update the script:
1. Go back to Extensions → Apps Script
2. Make your changes
3. Click **Deploy → Manage deployments**
4. Click the **pencil icon** on your deployment
5. Under "Version", select **New version**
6. Click **Deploy**

---

## Step 2: Deploy to Vercel

### 2a. Push to GitHub
1. Create a new GitHub repository (e.g., `16bussy-invitational`)
2. Push this project folder to it:
   ```bash
   cd 16bussy-invitational
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/16bussy-invitational.git
   git push -u origin main
   ```

### 2b. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub (free)
2. Click **Add New → Project**
3. Import your `16bussy-invitational` repository
4. Under **Environment Variables**, add:
   - **Key**: `VITE_SHEETS_URL`
   - **Value**: *(paste the Google Apps Script URL from Step 1c)*
5. Click **Deploy**
6. Your site is live! Vercel gives you a URL like `16bussy-invitational.vercel.app`

### Optional: Custom domain
In Vercel dashboard → your project → **Settings → Domains**, you can add a custom domain like `16bussy.com` if you buy one (~$10/yr on Namecheap or Google Domains).

---

## How It Works

- When someone visits the site and adds themselves to the roster, it writes to your Google Sheet
- You can view/edit the roster data directly in Google Sheets at any time
- The Google Sheet has columns: `id`, `name`, `handicap`, `ghin`, `airport`, `arrival`, `departure`, `carPlans`
- Everyone who visits the site sees the same shared roster

---

## Local Development

```bash
npm install
```

Create a `.env` file in the project root:
```
VITE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Then run:
```bash
npm run dev
```

The site runs at `http://localhost:5173`.

---

## Project Structure

```
16bussy-invitational/
├── index.html              ← HTML entry point
├── package.json            ← Dependencies
├── vite.config.js          ← Build config
├── google-apps-script.js   ← Paste this into Google Apps Script
├── README.md               ← This file
└── src/
    ├── main.jsx            ← React entry
    └── App.jsx             ← The entire site
```

---

## Troubleshooting

**Roster shows "backend not connected" warning**
→ Make sure `VITE_SHEETS_URL` is set in Vercel's environment variables, then redeploy.

**Roster entries aren't saving**
→ Check that the Apps Script is deployed as a web app with "Anyone" access. Try redeploying with a new version.

**CORS errors in console**
→ Google Apps Script web apps handle CORS automatically. If you see errors, your URL might be wrong — make sure it ends with `/exec`.

**I want to edit content on the site (schedule, pricing, etc.)**
→ Edit `src/App.jsx` — all the data is in arrays at the top of the file. Push changes to GitHub and Vercel auto-redeploys.

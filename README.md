# ⚡ FitOrder
### Fitness-Aware Meal Ordering Agent · Built on Swiggy Builders Club MCP

FitOrder is an AI agent that matches your remaining daily macros to real Swiggy meals — querying Swiggy Food MCP and Instamart MCP live, ranking options by macro fit, and adding to cart in one command.

---

## Tech Stack

- **Frontend**: React + Vite
- **Agent**: Claude API (claude-sonnet-4) with MCP servers
- **MCP**: Swiggy Food + Instamart + Dineout
- **Hosting**: Netlify (frontend) + Netlify Functions (API proxy)

---

## Deploy to Netlify in 5 Steps

### Step 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/fitorder.git
cd fitorder
npm install
```

### Step 2 — Set up environment variables

```bash
cp .env.example .env
# Open .env and add your Anthropic API key
```

### Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "FitOrder — Swiggy Builders Club"
git remote add origin https://github.com/YOUR_USERNAME/fitorder.git
git push -u origin main
```

### Step 4 — Connect to Netlify

1. Go to [netlify.com](https://netlify.com) → New site from Git
2. Connect your GitHub repo
3. Build settings auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy**

### Step 5 — Add environment variable on Netlify

1. Site Settings → Environment Variables
2. Add: `ANTHROPIC_API_KEY` = your key
3. Redeploy

**Your site is live.** Share the URL with builders@swiggy.in

---

## Local Development

```bash
npm install
npm run dev
```

The Vite proxy routes `/api/*` → Netlify Functions locally.
For local function testing, install Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

---

## Project Structure

```
fitorder/
├── netlify/
│   └── functions/
│       └── agent.js          # Secure API proxy — API key never in browser
├── src/
│   ├── components/
│   │   ├── MacroSetup.jsx    # Goal + macro configuration UI
│   │   └── Chat.jsx          # Agent conversation UI
│   ├── hooks/
│   │   └── useAgent.js       # Agent state + API calls
│   ├── App.jsx               # View orchestration
│   └── main.jsx              # Entry point
├── public/
│   └── index.html
├── netlify.toml              # Netlify config + redirects
├── vite.config.js
└── package.json
```

---

## What the Agent Can Do

| Command | What happens |
|---|---|
| "Find meals for my macros" | Calls `search_restaurants` + scores by macro fit |
| "Check Instamart too" | Calls `search_products` on Instamart MCP |
| "Add to cart" | Calls `update_food_cart` on your Swiggy account |
| "What did I order last time?" | Calls `get_food_orders` for history |
| "Veg options only" | Filters with `vegFilter=1` on `search_menu` |
| "Stay under ₹250" | Budget-aware meal filtering |

---

## Built for Swiggy Builders Club

Submitted by Sanchit · builders@swiggy.in

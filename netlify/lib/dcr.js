// netlify/lib/dcr.js
// Swiggy MCP has no client ID to apply for — per Builders Club docs, the
// client registers itself via Dynamic Client Registration (RFC 7591) at
// POST /auth/register. We do this once and cache the resulting client_id
// in Netlify Blobs so every cold start doesn't re-register.
//
// If SWIGGY_CLIENT_ID is set in the environment, it's used directly and
// registration is skipped entirely — handy if you ever want to pin a
// known-good client_id instead of relying on the cache.

const { getStore } = require("@netlify/blobs");

const REGISTER_URL = "https://mcp.swiggy.com/auth/register";
const BLOB_STORE = "swiggy-oauth";
const BLOB_KEY = "client_id";

async function registerClient(redirectUri) {
    const res = await fetch(REGISTER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
                  client_name: "FitOrder",
                  redirect_uris: [redirectUri],
                  grant_types: ["authorization_code"],
                  response_types: ["code"],
                  token_endpoint_auth_method: "none", // public client — PKCE, no secret
          }),
    });

    if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`Swiggy client registration failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    if (!data.client_id) {
          throw new Error("Swiggy registration response had no client_id");
    }
    return data.client_id;
}

// Returns a usable client_id, registering with Swiggy if we don't already
// have one cached. Safe to call on every request — cheap cache hit after
// the first successful registration.
async function getSwiggyClientId(redirectUri) {
    if (process.env.SWIGGY_CLIENT_ID) {
          return process.env.SWIGGY_CLIENT_ID;
    }

    const store = getStore(BLOB_STORE);
    const cached = await store.get(BLOB_KEY);
    if (cached) {
          return cached;
    }

    const clientId = await registerClient(redirectUri);
    await store.set(BLOB_KEY, clientId);
    return clientId;
}

module.exports = { getSwiggyClientId };

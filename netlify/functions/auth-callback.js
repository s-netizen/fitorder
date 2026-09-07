// netlify/functions/auth-callback.js
// GET /api/auth-callback?code=...&state=... — Swiggy redirects here after
// the user approves access. Exchanges the code for an access token using
// the PKCE verifier stashed in the signed cookie from auth-start.js, then
// stores the token in its own signed, httpOnly cookie for agent.js to read.
//
// Swiggy access tokens live 5 days (per Builders Club docs). We don't try
// to silently refresh here — a 401 from agent.js should just re-trigger
// this flow via auth-start.

const { verifySigned, sign } = require("../lib/pkce");
const { getSwiggyClientId } = require("../lib/dcr");

const METADATA_URL = "https://mcp.swiggy.com/.well-known/oauth-authorization-server";

function parseCookies(header) {
    const out = {};
    (header || "").split(";").forEach((pair) => {
          const idx = pair.indexOf("=");
          if (idx === -1) return;
          out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
    });
    return out;
}

exports.handler = async (event) => {
    const cookieSecret = process.env.OAUTH_COOKIE_SECRET;
    const redirectUri = process.env.SWIGGY_REDIRECT_URI;
    const appUrl = process.env.APP_URL || "/"; // where to send the user after linking

    if (!cookieSecret || !redirectUri) {
          return { statusCode: 500, body: "Missing OAUTH_COOKIE_SECRET or SWIGGY_REDIRECT_URI env vars." };
    }

    let clientId;
    try {
          clientId = await getSwiggyClientId(redirectUri, event);
    } catch (e) {
          console.error("Swiggy client registration failed:", e.message);
          return { statusCode: 302, headers: { Location: `${appUrl}?swiggy_auth=failed` }, body: "" };
    }

    const { code, state: returnedState, error } = event.queryStringParameters || {};

    if (error) {
          return { statusCode: 302, headers: { Location: `${appUrl}?swiggy_auth=denied` }, body: "" };
    }
    if (!code || !returnedState) {
          return { statusCode: 400, body: "Missing code or state." };
    }

    const cookies = parseCookies(event.headers.cookie);
    const raw = cookies.swiggy_pkce ? verifySigned(decodeURIComponent(cookies.swiggy_pkce), cookieSecret) : null;
    if (!raw) {
          return { statusCode: 400, body: "Missing or invalid PKCE cookie — restart the auth flow." };
    }

    const { verifier, state: expectedState } = JSON.parse(raw);
    if (returnedState !== expectedState) {
          return { statusCode: 400, body: "State mismatch — possible CSRF, restart the auth flow." };
    }

    let tokenEndpoint;
    try {
          const metaRes = await fetch(METADATA_URL);
          const meta = await metaRes.json();
          tokenEndpoint = meta.token_endpoint;
          if (!tokenEndpoint) throw new Error("no token_endpoint in metadata");
    } catch (e) {
          tokenEndpoint = "https://mcp.swiggy.com/auth/token";
          console.error("OAuth metadata discovery failed, using fallback:", e.message);
    }

    const body = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: verifier,
    });

    let tokenData;
    try {
          const tokenRes = await fetch(tokenEndpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: body.toString(),
          });
          if (!tokenRes.ok) {
                  const errText = await tokenRes.text().catch(() => "");
                  throw new Error(`token exchange failed: ${tokenRes.status} ${errText}`);
          }
          tokenData = await tokenRes.json();
    } catch (e) {
          console.error("Swiggy token exchange failed:", e.message);
          return { statusCode: 302, headers: { Location: `${appUrl}?swiggy_auth=failed` }, body: "" };
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
          return { statusCode: 502, body: "Token response had no access_token." };
    }

    // Swiggy tokens live 5 days — mirror that as the cookie's max-age so an
    // expired cookie and an expired token go stale together.
    const maxAgeSeconds = 5 * 24 * 60 * 60;
    const tokenCookiePayload = sign(accessToken, cookieSecret);

    return {
          statusCode: 302,
          headers: {
                  Location: `${appUrl}?swiggy_auth=success`,
                  "Set-Cookie": [
                            `swiggy_token=${encodeURIComponent(tokenCookiePayload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`,
                            // Clear the now-used PKCE cookie.
                            `swiggy_pkce=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
                          ],
          },
          body: "",
    };
};

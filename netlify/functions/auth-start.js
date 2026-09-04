// netlify/functions/auth-start.js
// GET /api/auth-start — redirects the browser into Swiggy's OAuth authorize
// screen. Discovers the authorize endpoint from Swiggy's metadata document
// rather than hardcoding it, since Builders Club docs note the exact paths
// may move as dynamic client registration support matures across vendors.

const { generateCodeVerifier, codeChallengeFromVerifier, generateState, sign } = require("../lib/pkce");

const METADATA_URL = "https://mcp.swiggy.com/.well-known/oauth-authorization-server";

exports.handler = async (event) => {
    const cookieSecret = process.env.OAUTH_COOKIE_SECRET;
    const clientId = process.env.SWIGGY_CLIENT_ID;
    const redirectUri = process.env.SWIGGY_REDIRECT_URI; // e.g. https://fitorder.netlify.app/api/auth-callback

    if (!cookieSecret || !clientId || !redirectUri) {
          return {
                  statusCode: 500,
                  body: "Missing OAUTH_COOKIE_SECRET, SWIGGY_CLIENT_ID, or SWIGGY_REDIRECT_URI env vars.",
          };
    }

    let authorizeEndpoint;
    try {
          const metaRes = await fetch(METADATA_URL);
          if (!metaRes.ok) throw new Error(`metadata fetch failed: ${metaRes.status}`);
          const meta = await metaRes.json();
          authorizeEndpoint = meta.authorization_endpoint;
          if (!authorizeEndpoint) throw new Error("no authorization_endpoint in metadata");
    } catch (e) {
          // Fallback to the documented default path if discovery fails.
      authorizeEndpoint = "https://mcp.swiggy.com/auth/authorize";
          console.error("OAuth metadata discovery failed, using fallback:", e.message);
    }

    const verifier = generateCodeVerifier();
    const challenge = codeChallengeFromVerifier(verifier);
    const state = generateState();

    // Verifier + state travel in a signed, httpOnly cookie — never touch the
    // browser's JS-visible storage. Callback verifies the signature and the
    // state before exchanging the code.
    const cookiePayload = sign(JSON.stringify({ verifier, state }), cookieSecret);

    const params = new URLSearchParams({
          response_type: "code",
          client_id: clientId,
          redirect_uri: redirectUri,
          code_challenge: challenge,
          code_challenge_method: "S256",
          state,
    });

    return {
          statusCode: 302,
          headers: {
                  Location: `${authorizeEndpoint}?${params.toString()}`,
                  "Set-Cookie": `swiggy_pkce=${encodeURIComponent(cookiePayload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
          },
          body: "",
    };
};

// netlify/lib/pkce.js — PKCE (RFC 7636) helpers for Swiggy's OAuth 2.1 flow.
// Swiggy MCP has no static API key — every account-linked request needs a
// user access token obtained through this flow, forwarded as a Bearer
// token to the Anthropic MCP connector (Anthropic's connector doesn't run
// PKCE itself, so we do it here and just hand it a finished token).

const crypto = require("crypto");

function base64url(buffer) {
    return buffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
}

function generateCodeVerifier() {
    return base64url(crypto.randomBytes(32)); // 43-char verifier
}

function codeChallengeFromVerifier(verifier) {
    const hash = crypto.createHash("sha256").update(verifier).digest();
    return base64url(hash);
}

function generateState() {
    return base64url(crypto.randomBytes(16));
}

// Signs a short-lived value so we can round-trip the PKCE verifier + state
// through a cookie without server-side session storage (Netlify Functions
// are stateless). HMAC keyed on an env secret — not the client secret.
function sign(value, secret) {
    const mac = crypto.createHmac("sha256", secret).update(value).digest("hex");
    return `${value}.${mac}`;
}

function verifySigned(signedValue, secret) {
    const idx = signedValue.lastIndexOf(".");
    if (idx === -1) return null;
    const value = signedValue.slice(0, idx);
    const mac = signedValue.slice(idx + 1);
    const expected = crypto.createHmac("sha256", secret).update(value).digest("hex");
    const macBuf = Buffer.from(mac, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (macBuf.length !== expBuf.length || !crypto.timingSafeEqual(macBuf, expBuf)) {
          return null;
    }
    return value;
}

module.exports = { generateCodeVerifier, codeChallengeFromVerifier, generateState, sign, verifySigned };

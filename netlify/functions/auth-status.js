// netlify/functions/auth-status.js
// GET /api/auth-status — tells the frontend whether the user has a valid
// Swiggy session, without ever exposing the token itself (it's httpOnly,
// so client JS can't read it directly — this is the sanctioned way to check).

const { verifySigned } = require("../lib/pkce");

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
    const cookies = parseCookies(event.headers.cookie);

    const linked = !!(cookieSecret && cookies.swiggy_token && verifySigned(decodeURIComponent(cookies.swiggy_token), cookieSecret));

    return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linked }),
    };
};

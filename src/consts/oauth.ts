const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
if (!GOOGLE_CLIENT_ID) console.log();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
if (!GOOGLE_CLIENT_SECRET) console.log();
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ?? "";
if (!GOOGLE_REDIRECT_URI) console.log();

const GOOGLE_OAUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_ACCESS_SCOPE = ["email", "profile"].join(" ");

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT =
  "https://www.googleapis.com/oauth2/v2/userinfo";

export {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_OAUTH_ENDPOINT,
  GOOGLE_ACCESS_SCOPE,
  GOOGLE_TOKEN_ENDPOINT,
  GOOGLE_USERINFO_ENDPOINT,
};

const crypto = require("crypto");
const https = require("https");
const querystring = require("querystring");

// Replace these with your actual values
const api_key = "v63c0axxefqd8zo4";
const api_secret = "7vr0ao2c8qjffalt2xbdd46jol2fwm5o";
const request_token = "NlPoVmWryFvCPzEtuurvE5LB5OL5OqZO";

console.log("🚀 Generating Kite Access Token...");
console.log("API Key:", api_key);
console.log("Request Token:", request_token);

// Generate checksum
const checksum = crypto
  .createHash("sha256")
  .update(api_key + request_token + api_secret)
  .digest("hex");

console.log("Checksum generated:", checksum);

// Exchange request token for access token
const postData = querystring.stringify({
  api_key: api_key,
  request_token: request_token,
  checksum: checksum,
});

const options = {
  hostname: "api.kite.trade",
  port: 443,
  path: "/session/token",
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const response = JSON.parse(data);
      console.log("\n✅ Success! API Response:");
      console.log(JSON.stringify(response, null, 2));

      if (response.data && response.data.access_token) {
        console.log("\n🎯 Your Access Token:");
        console.log("KITE_ACCESS_TOKEN=" + response.data.access_token);
        console.log("\n📝 Add this to your .env.local file:");
        console.log(`KITE_API_KEY=${api_key}`);
        console.log(`KITE_API_SECRET=${api_secret}`);
        console.log(`KITE_ACCESS_TOKEN=${response.data.access_token}`);
      } else {
        console.log("\n❌ Error: No access token received");
        console.log("Response:", response);
      }
    } catch (error) {
      console.error("\n❌ Error parsing response:", error);
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (error) => {
  console.error("\n❌ Error:", error);
  console.log("\nTroubleshooting:");
  console.log("1. Check your API credentials");
  console.log("2. Ensure request_token is fresh (expires in few minutes)");
  console.log("3. Verify the login flow was completed successfully");
});

req.write(postData);
req.end();

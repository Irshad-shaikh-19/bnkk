// const path = require("path");
// const fs = require("fs");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const KEY_ID = process.env.KEY_ID;
// const ISSUER_ID = process.env.ISSUER_ID;
// const PRIVATE_KEY_PATH = path.resolve(__dirname, "..", process.env.PRIVATE_KEY_PATH); // Correct path

// const generateJWT = () => {
//     try {
//         console.log("Loading private key from:", PRIVATE_KEY_PATH);
//         const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
//         console.log("Private Key:",privateKey)

//         const now = Math.floor(Date.now() / 1000); // Current time in seconds

//         const payload = {
//             iss: ISSUER_ID,  // <-- Use ISSUER_ID here (since no TEAM_ID)
//             sub: ISSUER_ID,  // <-- Use ISSUER_ID here
//             iat: Math.floor(Date.now() / 1000),
//             exp: Math.floor(Date.now() / 1000) + 3600,
//             aud: "appstoreconnect-v1"
//         };
        

//         const token = jwt.sign(payload, privateKey, {
//             algorithm: "ES256",
//             keyid: KEY_ID,
//             header: {
//                 alg: "ES256",
//                 kid: KEY_ID,
//                 typ: "JWT"
//             }
//         });

//         console.log("Generated JWT:", token); // Debugging log
//         return token;
//     } catch (error) {
//         console.error("Error generating JWT:", error.message);
//         return null;
//     }
// };


// module.exports = generateJWT;




const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const KEY_ID = process.env.KEY_ID;
const ISSUER_ID = process.env.ISSUER_ID;
const VENDOR_NUMBER = process.env.VENDOR_NUMBER;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH
    ? path.resolve(__dirname, "..", process.env.PRIVATE_KEY_PATH)
    : null;

    // const PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH
    // ? path.resolve(__dirname, "..", process.env.PUBLIC_KEY_PATH)
    // : null;

const generateJWT = () => {
    try {
        if (!KEY_ID || !ISSUER_ID || !PRIVATE_KEY_PATH) {
            throw new Error("Missing required environment variables (KEY_ID, ISSUER_ID, PRIVATE_KEY_PATH)");
        }

        console.log("🔹 Loading private key from:", PRIVATE_KEY_PATH);
        const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
        // const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");


        const now = Math.floor(Date.now() / 1000);
        const nowPlus20 = now + 1200;

        const payload = {
            iss: ISSUER_ID,
            exp: nowPlus20,
            aud: "appstoreconnect-v1",
        };

        const token = jwt.sign(payload, privateKey, {
            algorithm: "ES256",
            keyid: KEY_ID,
            header: { typ: "JWT" },
        });

        console.log(" Generated JWT Token:", token);

       
        // try {
        //     const decoded = jwt.verify(token,publicKey ); 
        //     console.log("Verified JWT:", decoded);
        // } catch (error) {
        //     console.error("JWT verification failed:", error.message);
        // }

        return token;
    } catch (error) {
        console.error("Error generating JWT:", error.message);
        return null;
    }
};

module.exports = generateJWT;





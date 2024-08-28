import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const privateKey = fs.readFileSync("./certs/private.pem"); // converting private key to json
const jwk = rsaPemToJwk(privateKey, {use:"sig"}, "public"); // privateKey pass ki, then verify token signature using sig, then "public" key daal di

console.log(JSON.stringify(jwk)); // will convert into JSON
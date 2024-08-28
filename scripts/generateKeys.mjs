import crypto from 'crypto';
import fs from 'fs';
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    // will return privateKey and publicKey
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
});
console.log('Public Key: ', publicKey);
console.log('Private Key: ', privateKey);
// writing keys in a file
fs.writeFileSync('certs/private.pem', privateKey);
fs.writeFileSync('certs/public.pem', publicKey);

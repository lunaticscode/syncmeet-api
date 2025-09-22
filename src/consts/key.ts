import fs from "node:fs";
import { importPKCS8, importSPKI, type CryptoKey } from "jose";
import { AppError } from "../utils/error";
const ALG = "RS256";

let privateKeyPem;
let publicKeyPem;

(() => {
  try {
    if (!privateKeyPem) {
      privateKeyPem = fs.readFileSync(
        process.env.JWT_PRIVATE_KEY_PATH ?? "",
        "utf8"
      );
    }
    if (!publicKeyPem) {
      publicKeyPem = fs.readFileSync(
        process.env.JWT_PUBLIC_KEY_PATH ?? "",
        "utf8"
      );
    }
  } catch (err) {
    throw new AppError(
      "Invalid key file, Check public, private key file.",
      "KEY_IMPORT_FAILED"
    );
  }
})();

if (!privateKeyPem.trim()) {
  throw new AppError(
    "Invalid 'privateKeyPem', Check private key file.",
    "KEY_IMPORT_FAILED"
  );
}
if (!publicKeyPem.trim()) {
  throw new AppError(
    "Invalid 'publicKeyPem', Check public key file.",
    "KEY_IMPORT_FAILED"
  );
}

const jwtPrivateKey = await importPKCS8(privateKeyPem, ALG);
const jwtPublicKey = await importSPKI(publicKeyPem, ALG);
export { jwtPrivateKey, jwtPublicKey };

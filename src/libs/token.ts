import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { jwtPrivateKey, jwtPublicKey } from "../consts/key";
import { AppError } from "../utils/error";

const ALG = "RS256";
const TRACE_DIR = "libs.token";
const verifyAndDecodeToken = async (token: string) => {
  try {
    const decodedPayload = await jwtVerify(token, jwtPublicKey, {
      algorithms: [ALG],
    });
    return decodedPayload;
  } catch (err) {
    throw new AppError(
      "Verify and decoding error. Please check token value.",
      "JWT_ERROR",
      `${TRACE_DIR}.verifyAndDecodedToken`
    );
  }
};

const encodeToken = async (payload: JWTPayload, exp: string = "24h") => {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: ALG })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(jwtPrivateKey);
    return token;
  } catch (err) {
    throw new AppError(
      "JWT Sign error. Please check payload, expiration value.",
      "JWT_ERROR",
      `${TRACE_DIR}.encodeToken`
    );
  }
};

const getSignedToken = async (payload: JWTPayload) => {
  try {
    return await encodeToken(payload);
  } catch (err) {
    throw err;
  }
};

const getDecodedPayload = async (token: string) => {
  if (!token) return null;
  try {
    return await verifyAndDecodeToken(token);
  } catch (err) {
    throw err;
  }
};

export { getSignedToken, getDecodedPayload };

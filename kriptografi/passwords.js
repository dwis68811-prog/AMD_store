"use strict";

const { randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");

const ALGORITHM = "scrypt";
const SALT_BYTES = 16;
const KEY_BYTES = 32;
const SCRYPT_OPTIONS = { N: 2 ** 14, r: 8, p: 1 };
const MAX_PASSWORD_BYTES = 1024;

function passwordBuffer(password) {
  if (typeof password !== "string") {
    throw new TypeError("password must be a string");
  }

  const encoded = Buffer.from(password, "utf8");
  if (encoded.length === 0) {
    throw new RangeError("password must not be empty");
  }
  if (encoded.length > MAX_PASSWORD_BYTES) {
    throw new RangeError("password must be at most 1024 UTF-8 bytes");
  }

  return encoded;
}

function hashPassword(password) {
  const passwordData = passwordBuffer(password);
  const salt = randomBytes(SALT_BYTES);
  const digest = scryptSync(passwordData, salt, KEY_BYTES, SCRYPT_OPTIONS);
  return `${ALGORITHM}$${salt.toString("hex")}$${digest.toString("hex")}`;
}

function verifyPassword(password, storedHash) {
  let passwordData;
  try {
    passwordData = passwordBuffer(password);
  } catch (error) {
    if (error instanceof TypeError || error instanceof RangeError) {
      return false;
    }
    throw error;
  }

  if (typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split("$");
  if (
    parts.length !== 3
    || parts[0] !== ALGORITHM
    || !/^[0-9a-f]{32}$/i.test(parts[1])
    || !/^[0-9a-f]{64}$/i.test(parts[2])
  ) {
    return false;
  }

  const salt = Buffer.from(parts[1], "hex");
  const expectedDigest = Buffer.from(parts[2], "hex");
  const actualDigest = scryptSync(passwordData, salt, KEY_BYTES, SCRYPT_OPTIONS);
  return timingSafeEqual(actualDigest, expectedDigest);
}

module.exports = { hashPassword, verifyPassword };

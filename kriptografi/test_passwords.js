"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { hashPassword, verifyPassword } = require("./passwords");

test("hash dapat diverifikasi dengan kata sandi yang benar", () => {
  const storedHash = hashPassword("contoh-kata-sandi-aman");

  assert.equal(verifyPassword("contoh-kata-sandi-aman", storedHash), true);
});

test("kata sandi yang berbeda tidak cocok", () => {
  const storedHash = hashPassword("contoh-kata-sandi-aman");

  assert.equal(verifyPassword("kata-sandi-lain", storedHash), false);
});

test("kata sandi yang sama mendapat salt berbeda", () => {
  const firstHash = hashPassword("kata-sandi-sama");
  const secondHash = hashPassword("kata-sandi-sama");

  assert.notEqual(firstHash, secondHash);
  assert.equal(verifyPassword("kata-sandi-sama", firstHash), true);
  assert.equal(verifyPassword("kata-sandi-sama", secondHash), true);
});

test("kata sandi kosong ditolak", () => {
  assert.throws(() => hashPassword(""), RangeError);
});

test("kata sandi melebihi batas ukuran ditolak", () => {
  assert.throws(() => hashPassword("a".repeat(1025)), RangeError);
});

test("hash rusak atau tipe yang salah tidak pernah cocok", () => {
  assert.equal(verifyPassword("contoh", "bukan-hash-scrypt"), false);
  assert.equal(verifyPassword("contoh", "scrypt$00$00"), false);
  assert.equal(verifyPassword("contoh", null), false);
});

test("kata sandi Unicode dapat diverifikasi", () => {
  const password = "kunci-contoh-🗝️";
  const storedHash = hashPassword(password);

  assert.equal(verifyPassword(password, storedHash), true);
});

import { randomInt } from "node:crypto"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function createQrCodeToken(length = 6) {
  let token = ""
  for (let i = 0; i < length; i++) token += ALPHABET[randomInt(ALPHABET.length)]
  return token
}

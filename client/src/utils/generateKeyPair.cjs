const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const {
  hexToBytes,
  toHex,
  utf8ToBytes,
} = require("ethereum-cryptography/utils");
const fs = require("fs");

async function generateKeyPair() {
  const privateKeyU8 = secp.utils.randomPrivateKey();
  const publicKeyU8 = secp.getPublicKey(privateKeyU8);
  console.log("new privateKey in Uint8Array format:", privateKeyU8);
  console.log("new publicKey in Uint8Array format:", publicKeyU8);
  const hashPublicKeyU8 = keccak256(publicKeyU8);
  const ETHAdress = `0x${toHex(hashPublicKeyU8.slice(-20))}`;
  let keyArrayJSON = fs.readFileSync("../constants/keys.json", "utf-8");
  let keyArray = JSON.parse(keyArrayJSON);
  keyArray = [
    ...keyArray,
    {
      privateKey: toHex(privateKeyU8),
      publicKey: toHex(publicKeyU8),
      ETHAdress,
    },
  ];
  console.log("new key array in hex string format:", keyArray);
  keyArrayJSON = JSON.stringify(keyArray);
  fs.writeFileSync("../constants/keys.json", keyArrayJSON);
}

generateKeyPair();

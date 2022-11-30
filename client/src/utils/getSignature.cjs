const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const {
  toHex,
  hexToBytes,
  utf8ToBytes,
} = require("ethereum-cryptography/utils");

async function getSignature() {
  try {
    console.log("process.argv:", process.argv);
    const txHash = process.argv[2].trim();
    // const txHash = keccak256(utf8ToBytes(txString));
    const privateKey = process.argv[3].trim();
    console.log("txHash", txHash);
    console.log("privateKey", privateKey);
    const signatureArray = await secp.sign(txHash, privateKey, {
      recovered: true,
    });
    console.log("signatureArray:", signatureArray);
    console.log("signatureHex:", toHex(signatureArray[0]));
    console.log("recoverybit:", signatureArray[1]);
  } catch (error) {
    console.log(error);
  }
}

getSignature();

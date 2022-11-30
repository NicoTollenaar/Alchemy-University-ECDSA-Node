const secp = require("ethereum-cryptography/secp256k1");
const fs = require("fs");

const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x95cf9f63fac4be1f16fd748ebd21026105e9106b": 100,
  "0x88424da24272ee49e8979e5505a82e0d8a4c66a3": 50,
  "0x372154d4c52009ddaccb66b229a9a8646ddb9858": 75,
};

const transactionCount = {
  "0x95cf9f63fac4be1f16fd748ebd21026105e9106b": 0,
  "0x88424da24272ee49e8979e5505a82e0d8a4c66a3": 0,
  "0x372154d4c52009ddaccb66b229a9a8646ddb9858": 0,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/transactionCount/:sender", (req, res) => {
  const { sender } = req.params;
  setInitialTransactionCount(sender);
  res.send({ transactionCount: transactionCount[sender] });
});

app.post("/send", async (req, res) => {
  try {
    const { transactionHash, transactionJSON, signature, recoveryBit } =
      req.body;
    const { amount, recipient, intendedSender, nonce } =
      JSON.parse(transactionJSON);

    const message = checkIsValid(
      intendedSender,
      transactionJSON,
      transactionHash,
      signature,
      recoveryBit,
      nonce
    );

    if (message !== "okay") {
      res.status(400).send({ error: message });
    } else {
      const sender = intendedSender;
      setInitialBalance(sender);
      setInitialBalance(recipient);
      setInitialTransactionCount(sender);

      if (balances[sender] < amount) {
        res.status(400).send({ message: "Not enough funds!" });
      } else {
        balances[sender] -= amount;
        balances[recipient] += amount;
        transactionCount[sender]++;
        res.send({ balance: balances[sender], address: sender });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
transactionCount;

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function setInitialTransactionCount(address) {
  if (!transactionCount[address]) {
    transactionCount[address] = 0;
  }
}

function checkIsValid(
  intendedSender,
  transactionJSON,
  transactionHash,
  signature,
  recoveryBit,
  nonce
) {
  const ETHAddressSigner = getETHAdressSigner(
    transactionHash,
    signature,
    Number(recoveryBit)
  );
  const hashTransactionJSON = toHex(keccak256(utf8ToBytes(transactionJSON)));

  if (ETHAddressSigner !== intendedSender) return "signature invalid";

  if (hashTransactionJSON !== transactionHash)
    return "transactionJSON does not match hash";

  if (nonce !== transactionCount[intendedSender] + 1) return "nonce incorrect";

  return "okay";
}

function getETHAdressSigner(hash, signature, recovery) {
  const senderPublicKeyU8 = secp.recoverPublicKey(hash, signature, recovery);
  const ETHAddressSender = `0x${toHex(
    keccak256(senderPublicKeyU8).slice(-20)
  )}`;
  return ETHAddressSender;
}

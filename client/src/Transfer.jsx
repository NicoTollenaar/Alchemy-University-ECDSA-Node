import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { hexToBytes, toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setAddress, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [transactionJSON, setTransactionJSON] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [signature, setSignature] = useState("");
  const [recoveryBit, setRecoveryBit] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function setAndhashTransaction() {
    try {
      const {
        data: { transactionCount },
      } = await server.get(`transactionCount/${address}`);
      const transactionObject = {
        intendedSender: address,
        amount: parseInt(sendAmount),
        recipient,
        nonce: transactionCount + 1,
      };
      const transactionString = JSON.stringify(transactionObject);
      setTransactionJSON(transactionString);
      const transactionU8 = utf8ToBytes(transactionString);
      const txHashU8 = keccak256(transactionU8);
      const txHashHex = toHex(txHashU8);

      setTransactionHash(txHashHex);
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }

  async function transfer(evt) {
    evt.preventDefault();
    const body = {
      transactionJSON,
      transactionHash,
      signature,
      recoveryBit,
    };
    try {
      const {
        data: { balance, address },
      } = await server.post(`send`, body);
      setBalance(balance);
      setAddress(address);
    } catch (ex) {
      console.log(ex.response.data.error);
      alert(ex.response.data.error);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input
        type="button"
        className="button"
        value="Confirm and hash transaction"
        onClick={setAndhashTransaction}
      />

      <div className="transactionHash">Transaction hash: {transactionHash}</div>

      <label>
        Signature
        <input
          placeholder="Copy hashed transaction, sign it off-line and enter signature in hex format here"
          value={signature}
          onChange={setValue(setSignature)}
        ></input>
      </label>

      <label>
        Recovery bit
        <input
          placeholder="Enter recovery bit here"
          value={recoveryBit}
          onChange={setValue(setRecoveryBit)}
        ></input>
      </label>

      <input type="submit" className="button" value="SEND TRANSACTION" />
    </form>
  );
}

export default Transfer;

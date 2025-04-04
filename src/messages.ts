import { BigNumber, ethers, utils } from 'ethers';

import { addressToBytes32 } from './addresses.js';
import { fromHexString, toHexString } from './strings.js';
import {
  Address,
  Domain,
  HexString,
  ParsedMessage,
  ParsedWarpRouteMessage,
} from './types.js';

/**
 * JS Implementation of solidity/contracts/libs/Message.sol#formatMessage
 * @returns Hex string of the packed message
 */
export const formatMessage = (
  version: number | BigNumber,
  nonce: number | BigNumber,
  originDomain: Domain,
  senderAddr: Address,
  destinationDomain: Domain,
  recipientAddr: Address,
  body: HexString,
): HexString => {
  senderAddr = addressToBytes32(senderAddr);
  recipientAddr = addressToBytes32(recipientAddr);

  return ethers.utils.solidityPack(
    ['uint8', 'uint32', 'uint32', 'bytes32', 'uint32', 'bytes32', 'bytes'],
    [
      version,
      nonce,
      originDomain,
      senderAddr,
      destinationDomain,
      recipientAddr,
      body,
    ],
  );
};

/**
 * Get ID given message bytes
 * @param message Hex string of the packed message (see formatMessage)
 * @returns Hex string of message id
 */
export function messageId(message: HexString): HexString {
  return ethers.utils.solidityKeccak256(['bytes'], [message]);
}

/**
 * Parse a serialized Aetherium message from raw bytes.
 *
 * @param message
 * @returns
 */
export function parseMessage(message: string): ParsedMessage {
  const VERSION_OFFSET = 0;
  const NONCE_OFFSET = 1;
  const ORIGIN_OFFSET = 5;
  const SENDER_OFFSET = 9;
  const DESTINATION_OFFSET = 41;
  const RECIPIENT_OFFSET = 45;
  const BODY_OFFSET = 77;

  const buf = Buffer.from(utils.arrayify(message));
  const version = buf.readUint8(VERSION_OFFSET);
  const nonce = buf.readUInt32BE(NONCE_OFFSET);
  const origin = buf.readUInt32BE(ORIGIN_OFFSET);
  const sender = utils.hexlify(buf.subarray(SENDER_OFFSET, DESTINATION_OFFSET));
  const destination = buf.readUInt32BE(DESTINATION_OFFSET);
  const recipient = utils.hexlify(buf.subarray(RECIPIENT_OFFSET, BODY_OFFSET));
  const body = utils.hexlify(buf.subarray(BODY_OFFSET));
  return { version, nonce, origin, sender, destination, recipient, body };
}

export function parseWarpRouteMessage(
  messageBody: string,
): ParsedWarpRouteMessage {
  const RECIPIENT_OFFSET = 0;
  const AMOUNT_OFFSET = 32;
  const buf = fromHexString(messageBody);
  const recipient = toHexString(
    buf.subarray(RECIPIENT_OFFSET, RECIPIENT_OFFSET + 32),
  );
  const amount = BigInt(
    toHexString(buf.subarray(AMOUNT_OFFSET, AMOUNT_OFFSET + 32)),
  );
  return {
    recipient,
    amount,
  };
}

import { Data, Signer } from '@ethersphere/bee-js'
import { EthAddress } from '@ethersphere/bee-js/dist/types/utils/eth'
import { Utils } from '@ethersphere/bee-js'
import elliptic from 'elliptic'
const EC = elliptic.ec
const { assertBytes, hexToBytes, makeHexString, isBytes } = Utils

export const TOPIC_BYTES_LENGTH = 32
export const TOPIC_HEX_LENGTH = 64
export const UNCOMPRESSED_RECOVERY_ID = 27

type PlainChunkReference = Bytes<32>
type EncryptedChunkReference = Bytes<64>

export type Bytes<Length extends number = number> = Utils.Bytes<Length>
export type HexString<Length extends number = number> = Utils.HexString<Length>
// @ts-ignore - this is a hack to make the type checker happy
export type EllipticPublicKey = elliptic.curve.base.BasePoint
export type Signature = Bytes<65>
export type ChunkReference = PlainChunkReference | EncryptedChunkReference

/**
 * Returns a new byte array filled with zeroes with the specified length
 *
 * @param length The length of data to be returned
 */
export function makeBytes<Length extends number>(length: Length): Bytes<Length> {
  return new Uint8Array(length) as Bytes<Length>
}

export function writeUint64BigEndian(value: number, bytes: Bytes<8> = makeBytes(8)): Bytes<8> {
  const dataView = new DataView(bytes.buffer)
  const valueLower32 = value & 0xffffffff

  dataView.setUint32(0, 0)
  dataView.setUint32(4, valueLower32)

  return bytes
}

function publicKeyToAddress(pubKey: EllipticPublicKey): EthAddress {
  const pubBytes = pubKey.encode('array', false)

  return Utils.keccak256Hash(pubBytes.slice(1)).slice(12) as EthAddress
}

function hashWithEthereumPrefix(data: Uint8Array): Bytes<32> {
  const ethereumSignedMessagePrefix = `\x19Ethereum Signed Message:\n${data.length}`
  const prefixBytes = new TextEncoder().encode(ethereumSignedMessagePrefix)

  return Utils.keccak256Hash(prefixBytes, data)
}

/**
 * The default signer function that can be used for integrating with
 * other applications (e.g. wallets).
 *
 * @param data      The data to be signed
 * @param privateKey  The private key used for signing the data
 */
export function defaultSign(data: Uint8Array, privateKey: Bytes<32>): Signature {
  const curve = new EC('secp256k1')
  // @ts-ignore - this is a hack to make the type checker happy
  const keyPair = curve.keyFromPrivate(privateKey)

  const hashedDigest = hashWithEthereumPrefix(data)
  // @ts-ignore - this is a hack to make the type checker happy
  const sigRaw = curve.sign(hashedDigest, keyPair, { canonical: true, pers: undefined })

  if (sigRaw.recoveryParam === null) {
    throw new Error('signDigest recovery param was null')
  }
  const signature = new Uint8Array([
    ...sigRaw.r.toArray('be', 32),
    ...sigRaw.s.toArray('be', 32),
    sigRaw.recoveryParam + UNCOMPRESSED_RECOVERY_ID,
  ])

  return signature as Signature
}

export function makeSigner(signer: Signer | Uint8Array | string | unknown): Signer {
  if (typeof signer === 'string') {
    const hexKey = makeHexString(signer, 64)
    const keyBytes = hexToBytes<32>(hexKey) // HexString is verified for 64 length => 32 is guaranteed

    return makePrivateKeySigner(keyBytes)
  } else if (signer instanceof Uint8Array) {
    // @ts-ignore - this is a hack to make sure that the signer is a 32 bytes long Uint8Array
    assertBytes(signer, 32)

    // @ts-ignore - this is a hack to make sure that the signer is a 32 bytes long Uint8Array
    return makePrivateKeySigner(signer)
  }

  assertSigner(signer)

  return signer
}

export function assertSigner(signer: unknown): asserts signer is Signer {
  if (!isStrictlyObject(signer)) {
    throw new TypeError('Signer must be an object!')
  }

  const typedSigner = signer as Signer

  if (!isBytes(typedSigner.address, 20)) {
    throw new TypeError("Signer's address must be Uint8Array with 20 bytes!")
  }

  if (typeof typedSigner.sign !== 'function') {
    throw new TypeError('Signer sign property needs to be function!')
  }
}

/**
 * Creates a singer object that can be used when the private key is known.
 *
 * @param privateKey The private key
 */
export function makePrivateKeySigner(privateKey: Bytes<32>): Signer {
  const curve = new EC('secp256k1')
  // @ts-ignore - this is a hack to make the type checker happy
  const keyPair = curve.keyFromPrivate(privateKey)
  const address = publicKeyToAddress(keyPair.getPublic())

  return {
    sign: (digest: Data) => defaultSign(digest, privateKey),
    address,
  }
}

export function readUint64BigEndian(bytes: Bytes<8>): number {
  const dataView = new DataView(bytes.buffer)

  return dataView.getUint32(4)
}

/**
 * Helper function for serialize byte arrays
 *
 * @param arrays Any number of byte array arguments
 */
export function serializeBytes(...arrays: Uint8Array[]): Uint8Array {
  const length = arrays.reduce((prev, curr) => prev + curr.length, 0)
  const buffer = new Uint8Array(length)
  let offset = 0
  arrays.forEach(arr => {
    buffer.set(arr, offset)
    offset += arr.length
  })

  return buffer
}

/**
 * Generally it is discouraged to use `object` type, but in this case I think
 * it is best to do so as it is possible to easily convert from `object`to other
 * types, which will be usually the case after asserting that the object is
 * strictly object. With for example Record<string, unknown> you have to first
 * cast it to `unknown` which I think bit defeat the purpose.
 *
 * @param value
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isStrictlyObject(value: unknown): value is object {
  return isObject(value) && !Array.isArray(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

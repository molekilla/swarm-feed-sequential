import * as Y from 'yjs'
import { FdpStoragePersistence } from '../../src/adapter'
import { Utils } from '@ethersphere/bee-js'
const { hexToBytes } = Utils
import { Bee } from '@ethersphere/bee-js'
import { Bytes, HexString, makePrivateKeySigner } from '../../src/feeds/utils'

describe('y-fdp-storage', () => {
  let persistence
  const postageBatchId =
    process.env.BEE_POSTAGE || 'ed214aa124d43bb216b1c30a16bcb14708bd1afd1ff2c3816b06a3f357fbb6e5'

  beforeEach(async () => {
    const bee = new Bee('http://localhost:1633')

    const testIdentity = {
      privateKey: '634fb5a872396d9693e5c9f9d7233cfa93f395c093371017ff44aa9ae6564cdd' as HexString,
      publicKey: '03c32bb011339667a487b6c1c35061f15f7edc36aa9a0f8648aba07a4b8bd741b4' as HexString,
      address: '8d3766440f0d7b949a5e32995d09619a7f86e632' as HexString,
    }
    const wallet = makePrivateKeySigner(hexToBytes(testIdentity.privateKey) as Bytes<32>)
    const topic = '/crdt/document/testing_doc_5'
    persistence = new FdpStoragePersistence(bee, wallet, topic, postageBatchId)
  })

  it('when created should be defined', async () => {
    expect(persistence).toBeDefined()
  })

  it('when syncing one change, should update', async () => {
    const doc = new Y.Doc()

    doc.on('update', async update => {
      await persistence.storeUpdate(update)
    })

    doc.getText('test').insert(0, 'Hello World')

    const mostRecentDoc = await persistence.getYDoc()
    expect(mostRecentDoc.getText('test')).toBeDefined()
  })

  it('when syncing one or more changes, should update', async () => {
    const doc = new Y.Doc()

    doc.on('update', async update => {
      await persistence.storeUpdate(update)
    })

    doc.getArray('test').insert(0, ['Hello'])
    doc.getArray('test').insert(1, ['World'])

    const mostRecentDoc = await persistence.getYDoc()
    expect(mostRecentDoc.getArray('test')).toBeDefined()
  })
})

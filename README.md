# swarm-feed-sequential

Swarm Feed Sequential

## Abstract

Swarm Feed Sequential is a previously unreleased FDP library that implements Swarm Feeds as Sequential type. There are three types of feeds: Epoch, Sequential and Streaming.

## What can you do with a Sequential Feed

You can use it as off-chain, verifiable append-only log, either client or server side.

## Utilities

Additionally, this library includes `FeedStorage` and `BeesonMultiformatFeedStorage`, where you can use to store Uint8Array values or JSON values formatted as IPLD Beeson blocks.



## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [References](#references)
- [License](#license)

## Install

`npm install swarm-feed-sequential`


## API


## SequentialFeed

Creates a SequentialFeed instance.

```typescript
const f = new SequentialFeed(fdp.connection.bee)
```

### makeFeedR

Creates a sequential feed reader - SwarmFeedR

```typescript
const topic = `/crdt/document/test1`
const address = `0x1111111254fb6c44bac0bed2854e76f90643097d`
const feedR = f.makeFeedR(topic, address);
```

### makeFeedRW

Creates a sequential feed reader/writer - SwarmFeedRW

```typescript
const topic = `/crdt/document/test1`
const privateKey = `.....`
const feedR = f.makeFeedRW(topic, privateKey);
```


## SwarmFeedR interface

### getLastUpdate

Gets the last update in the feed

```typescript
const feedUpdate = await feedR.getLastUpdate()
```

### getLastIndex

Gets the last index in the feed

```typescript
const feedIndex = await feedR.getLastIndex()
```

### findLastUpdate

Gets the last appended chunk in the feed.

```typescript
const chunk = await feedR.findLastUpdate()
```

### getUpdate

Downloads a chunk by index number.

```typescript
const index = 0
const chunk = feedR.getUpdate(index)
```

### getUpdates

Download all chunk by indices.

```typescript
const indices = [0, 1, 2]
const chunks = feedR.getUpdates(indices)
```

## SwarmFeedRW interface

### setUpdate

Sets the upload chunk to update.

```typescript
import * as Block from "multiformats/block";
import { codec, hasher } from "@fairdatasociety/beeson-multiformats";
import { BeeSon, Type } from "@fairdatasociety/beeson";
import { SequentialFeed } from "./sequential-feed";
import { Bee } from "@ethersphere/bee-js";
import { BlockDecoder } from "multiformats/block";
import { JsonValue } from "@fairdatasociety/beeson/dist/types";

const bee = new Bee()
const postageBatchId = `...`
const topic = `/crdt/document/test1`
const signer = makePrivateKeySigner(`...`)
const feedRW = f.makeFeedRW(topic, signer);

const beeson = new BeeSon({
  json: {
    ...state,
    timestamp: Date.now(),
  },
});
const value = beeson;

// encode a block
const block = await Block.encode({ value, codec, hasher });

const reference = await bee.uploadData(
  postageBatchId,
  block.bytes
);
const index = 1
return feedRW.setUpdate(index, postageBatchId, reference.reference);
```

### setLastUpdate

Sets the next upload chunk.

```typescript
import * as Block from "multiformats/block";
import { codec, hasher } from "@fairdatasociety/beeson-multiformats";
import { BeeSon, Type } from "@fairdatasociety/beeson";
import { SequentialFeed } from "./sequential-feed";
import { Bee } from "@ethersphere/bee-js";
import { BlockDecoder } from "multiformats/block";
import { JsonValue } from "@fairdatasociety/beeson/dist/types";

const bee = new Bee()
const postageBatchId = `...`
const topic = `/crdt/document/test1`
const signer = makePrivateKeySigner(`...`)
const feedRW = f.makeFeedRW(topic, signer);

const beeson = new BeeSon({
  json: {
    ...state,
    timestamp: Date.now(),
  },
});
const value = beeson;

// encode a block
const block = await Block.encode({ value, codec, hasher });

const reference = await bee.uploadData(
  postageBatchId,
  block.bytes
);
const index = 1
return feedRW.setLastUpdate(postageBatchId, reference.reference); 
```
## Maintainers

[molekilla](https://github.com/molekilla)




## License


[Apache License 2.0](./LICENSE)

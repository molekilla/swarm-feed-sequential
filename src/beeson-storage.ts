import * as Block from "multiformats/block";
import { codec, hasher } from "@fairdatasociety/beeson-multiformats";
import { BeeSon, Type } from "@fairdatasociety/beeson";
import { SequentialFeed } from "./sequential-feed";
import { Bee } from "@ethersphere/bee-js";
import { BlockDecoder } from "multiformats/block";
import { JsonValue } from "@fairdatasociety/beeson/dist/types";

export class BeesonMultiformatFeedStorage {
  constructor(
    public bee: Bee,
    public feed: SequentialFeed,
    public signer: any,
    public topic: any,
    public postageBatchId: any
  ) {}

  /**
   * Reads the last state from the feed.
   * @returns contract state
   */
  async storageRead(): Promise<any> {
    const feedR = this.feed.makeFeedR(this.topic, this.signer.address);
    const last = await feedR.getLastUpdate();
    const state = await this.bee.downloadData(last.reference);

    // decode a block
    const block2 = await Block.decode({
      bytes: state,
      codec: codec as BlockDecoder<252, BeeSon<JsonValue>>,
      hasher,
    });
    let json = await block2.value;

    return { ...json, ...last };
  }

  /**
   * Writes the state to the feed.
   * @param state object state to be written.
   * @returns void
   */
  async storageWrite(state: object) {
    const feedRW = this.feed.makeFeedRW(this.topic, this.signer);

    const beeson = new BeeSon({
      json: {
        ...state,
        timestamp: Date.now(),
      },
    });
    const value = beeson;

    // encode a block
    const block = await Block.encode({ value, codec, hasher });

    const reference = await this.bee.uploadData(
      this.postageBatchId,
      block.bytes
    );

    return feedRW.setLastUpdate(this.postageBatchId, reference.reference);
  }
}

import { Bee } from '@ethersphere/bee-js';
import { isSightingRecord } from '@deccan-birders/format';

export const GATEWAY_URL = process.env.SWARM_GATEWAY_URL || 'https://api.gateway.ethswarm.org/';

export class SightingReader {
  private bee: Bee;

  constructor(gatewayUrl: string = GATEWAY_URL) {
    const url = gatewayUrl.endsWith('/') ? gatewayUrl : `${gatewayUrl}/`;
    this.bee = new Bee(url);
  }

  public async fetchSighting(reference: string) {
    try {
      // 5. Records are read through the same endpoint family used for writing (uploadData used /bytes -> data.download uses /bytes)
      const data = await this.bee.data.download(reference);
      const text = new TextDecoder().decode(data.toUint8Array());
      const record = JSON.parse(text);

      if (!isSightingRecord(record)) {
        throw new Error('Retrieved data is not a valid sighting record');
      }

      return record;
    } catch (e: any) {
      throw new Error(`Failed to fetch and parse sighting: ${e.message}`);
    }
  }
}

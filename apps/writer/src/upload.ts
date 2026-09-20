import { SwarmIdClient } from '@snaha/swarm-id';
import { createSightingRecord } from '@deccan-birders/format';
import { GATEWAY_URL, SWARM_ID_IFRAME_ORIGIN } from './config';

export class SightingUploader {
  private swarmId: SwarmIdClient;

  constructor() {
    this.swarmId = new SwarmIdClient({
      iframeOrigin: SWARM_ID_IFRAME_ORIGIN,
      subsidisedGatewayUrl: GATEWAY_URL,
      metadata: {
        name: 'Deccan Birders Writer',
        description: 'Bird sighting writer',
      }
    });
  }

  public async signIn() {
    try {
      await this.swarmId.initialize();
      await this.swarmId.connect();
    } catch (e: any) {
      throw new Error(`Sign-in failure: ${e.message}`);
    }
  }

  public async uploadSighting(species: string, location: string, date: number) {
    // 1. Upload capability is checked before an upload is attempted
    const info = this.swarmId.connectionInfo;

    // Gated by identity and canUpload
    if (!info.identity || !info.canUpload) {
      throw new Error('Upload capability unavailable');
    }

    try {
      // 3. Each stored record contains its own format identifier and version
      const record = createSightingRecord(species, date, location);
      const payload = new TextEncoder().encode(JSON.stringify(record));

      // 5. Records are read through the same endpoint family used for writing (uploadData maps to bytes)
      // Pass the documented options empty to avoid adding pin and tag flags
      const result = await this.swarmId.uploadData(payload);

      return result.reference;
    } catch (e: any) {
      // 7. Upload failures produce specific reasons
      if (e.message.includes('Upload capability')) {
        throw e;
      } else if (e.message.includes('Invalid sighting')) {
        throw new Error(`Invalid sighting data: ${e.message}`);
      } else if (e.status === 402 || e.status === 403) {
        throw new Error(`Upload rejection: ${e.message}`);
      } else {
        throw new Error(`Gateway/network failure: ${e.message}`);
      }
    }
  }
}

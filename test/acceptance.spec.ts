import { SightingUploader } from '@deccan-birders/writer/src/upload';
import { SightingReader } from '@deccan-birders/reader/src/download';
import { isSightingRecord } from '@deccan-birders/format';

let mockUploadCapability = true;
let mockUploadReject = false;
let uploadedData: Uint8Array | null = null;
let hasIdentity = true;

jest.mock('@ethersphere/bee-js', () => {
  return {
    Bee: jest.fn().mockImplementation((url) => {
      // 5. Records are read through the same endpoint family used for writing
      return {
        data: {
          download: jest.fn().mockImplementation(async (ref) => {
            if (ref !== 'mock-reference-123') throw new Error('Not found');
            return {
              toUint8Array: () => uploadedData
            };
          })
        }
      };
    })
  };
});

jest.mock('@snaha/swarm-id', () => {
  return {
    SwarmIdClient: jest.fn().mockImplementation((config) => {
      // 2. subsidized gateway is configured
      if (!config.subsidisedGatewayUrl) {
         throw new Error('subsidisedGatewayUrl missing');
      }
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        connect: jest.fn().mockResolvedValue(undefined),
        get connectionInfo() {
          return {
            identity: hasIdentity ? { name: 'user' } : undefined,
            canUpload: mockUploadCapability
          };
        },
        uploadData: jest.fn().mockImplementation(async (payload) => {
          if (mockUploadReject) {
            const err = new Error('Payment required');
            (err as any).status = 402;
            throw err;
          }
          uploadedData = payload;
          return { reference: 'mock-reference-123' };
        })
      };
    })
  };
});

describe('Deccan Birders Acceptance Criteria', () => {
  beforeEach(() => {
    mockUploadCapability = true;
    hasIdentity = true;
    mockUploadReject = false;
    uploadedData = null;
    jest.clearAllMocks();
  });

  it('1. Upload capability is checked before an upload is attempted', async () => {
    const uploader = new SightingUploader();
    mockUploadCapability = false;
    await expect(uploader.uploadSighting('Sparrow', 'Park', Date.now()))
      .rejects.toThrow('Upload capability unavailable');

    mockUploadCapability = true;
    hasIdentity = false;
    await expect(uploader.uploadSighting('Sparrow', 'Park', Date.now()))
      .rejects.toThrow('Upload capability unavailable');
  });

  it('3. Each stored record contains its own format identifier and version', async () => {
    const uploader = new SightingUploader();
    await uploader.uploadSighting('Sparrow', 'Park', Date.now());

    expect(uploadedData).not.toBeNull();
    const text = new TextDecoder().decode(uploadedData!);
    const record = JSON.parse(text);

    expect(record.formatId).toBe('deccan-birders-sighting');
    expect(record.version).toBe(1);
    expect(isSightingRecord(record)).toBe(true);
  });

  it('4. & 5. An independent reader exists and uses correct endpoint family', async () => {
    // Write using uploader (internal /bytes)
    const uploader = new SightingUploader();
    const ref = await uploader.uploadSighting('Sparrow', 'Park', Date.now());

    // Read using completely separate reader class which uses /bytes internally via API
    const reader = new SightingReader();
    const record = await reader.fetchSighting(ref);

    expect(record.formatId).toBe('deccan-birders-sighting');
    expect(record.species).toBe('Sparrow');
  });

  it('7. Upload failures produce specific reasons', async () => {
    const uploader = new SightingUploader();

    // Reject test (e.g. 402)
    mockUploadReject = true;
    await expect(uploader.uploadSighting('Sparrow', 'Park', Date.now()))
      .rejects.toThrow('Upload rejection');
  });
});

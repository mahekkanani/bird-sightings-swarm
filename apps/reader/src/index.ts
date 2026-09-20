import { SightingReader } from './download';

export async function runReaderDemo(reference: string) {
  const reader = new SightingReader();

  console.log(`Fetching reference ${reference}...`);
  try {
    const record = await reader.fetchSighting(reference);
    console.log('Record details:', JSON.stringify(record, null, 2));
  } catch (err: any) {
    console.error(`Fetch error: ${err.message}`);
  }
}

if (require.main === module) {
  const ref = process.argv[2];
  if (!ref) {
    console.error('Usage: npm run start:reader <reference>');
    process.exit(1);
  }
  runReaderDemo(ref);
}

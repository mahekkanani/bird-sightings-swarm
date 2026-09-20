import { SightingUploader } from './upload';

export async function runWriterDemo() {
  const uploader = new SightingUploader();

  console.log('Signing in...');
  await uploader.signIn();

  console.log('Sending sighting...');
  try {
    const reference = await uploader.uploadSighting('Sparrow', 'Park', Date.now());
    console.log(`Success! Reference: ${reference}`);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
  }
}

if (require.main === module) {
  runWriterDemo();
}

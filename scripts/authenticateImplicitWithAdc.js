/* eslint-env node */
/* global console */
/**
 * Shows credentials auto-detections in the intercation with GCP libraries
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 */
function main(projectId) {
  // [START auth_cloud_implicit_adc]
  /**
   * TODO(developer):
   *  1. Uncomment and replace these variables before running the sample.
   *  2. Set up ADC as described in https://cloud.google.com/docs/authentication/external/set-up-adc
   *  3. Make sure you have the necessary permission to list storage buckets "storage.buckets.list"
   *    (https://cloud.google.com/storage/docs/access-control/iam-permissions#bucket_permissions)
   */
  // const projectId = 'YOUR_PROJECT_ID';

  const { Storage } = require('@google-cloud/storage');

  /**
   *
   */
  async function authenticateImplicitWithAdc() {
    // This snippet demonstrates how to list buckets.
    // NOTE: Replace the client created below with the client required for your application.
    // Note that the credentials are not specified when constructing the client.
    // The client library finds your credentials using ADC.
    const storage = new Storage({
      projectId,
    });
    const [buckets] = await storage.getBuckets();
    console.log('Buckets:');

    for (const bucket of buckets) {
      console.log(`- ${bucket.name}`);
    }

    console.log('Listed all storage buckets.');
  }

  authenticateImplicitWithAdc();
  // [END auth_cloud_implicit_adc]
}

process.on('unhandledRejection', (err) => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

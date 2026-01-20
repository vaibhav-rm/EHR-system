const { fhirStore } = require('../src/lib/fhir-store');

async function test() {
    console.log('Testing findUserByEmail...');
    const user = await fhirStore.findUserByEmail('doctor@example.com');
    console.log('Result:', JSON.stringify(user, null, 2));
}

test().catch(console.error);

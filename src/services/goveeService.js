/**
 * Simulates fetching a list of Govee devices.
 * @param {string} apiKey - The API key for Govee service
 * @returns {Promise<Array>} A promise that resolves to an array of device objects
 */
export async function fetchGoveeDevices(apiKey) {
    console.log(`Simulating Govee device fetch with API Key: ${apiKey}`);
    return new Promise(resolve => {
        setTimeout(() => {
            if (apiKey && apiKey.startsWith('TEST_KEY')) {
                resolve([
                    { device: 'AA:BB:CC:DD:EE:F1', model: 'H5075', deviceName: 'Office Humidor Sensor' },
                    { device: 'AA:BB:CC:DD:EE:F2', model: 'H5074', deviceName: 'Travel Case Sensor' },
                    { device: 'AA:BB:CC:DD:EE:F3', model: 'H5100', deviceName: 'Living Room Sensor' },
                ]);
            } else {
                resolve([]);
            }
        }, 1500);
    });
}
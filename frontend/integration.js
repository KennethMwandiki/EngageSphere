import { integrateWithPlatform } from "./api.js";

async function handleIntegration(platform, data) {
  try {
    const result = await integrateWithPlatform(platform, data);
    // Handle result (e.g., show success)
    alert(`Integration with ${platform} successful!`);
  } catch (err) {
    // Handle error (e.g., show error message)
    alert(`Integration failed: ${err.message}`);
  }
}

// Example usage: attach to a button or event
// document.getElementById('integrateBtn').onclick = () => handleIntegration('youtube', { some: 'data' });

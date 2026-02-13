/**
 * Global API service for HealthGuard platform integrations.
 */
export const sendWebhook = async (payload: any, endpoint: string) => {
  try {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.warn("Automation server not found on localhost:8000. Operating in offline demo mode.");
    return { success: true, mode: 'demo', timestamp: new Date().toISOString() };
  }
};
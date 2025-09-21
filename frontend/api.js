export async function integrateWithPlatform(platform, payload) {
  const response = await fetch(`/api/integrate/${platform}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

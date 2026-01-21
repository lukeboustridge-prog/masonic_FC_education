export const submitScore = async (userId: string, score: number) => {
  const baseUrl = import.meta.env.VITE_MAIN_APP_URL as string | undefined;
  const gameSlug = import.meta.env.VITE_GAME_SLUG as string | undefined;
  const secret = import.meta.env.VITE_GAME_API_SECRET as string | undefined;

  if (!baseUrl || !gameSlug || !secret) {
    console.log('Score submission skipped: missing VITE_MAIN_APP_URL, VITE_GAME_SLUG, or VITE_GAME_API_SECRET.');
    return;
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/mini-games/score`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        score,
        gameSlug,
        secret
      })
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    console.log('Score submission response', {
      status: response.status,
      ok: response.ok,
      payload
    });

    return response;
  } catch (error) {
    console.log('Score submission error', error);
  }
};

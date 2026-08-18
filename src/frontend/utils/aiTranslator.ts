/**
 * Client-side helper to request Gemini translation from the backend server.
 */
export async function translateContentWithAi(
  texts: Record<string, string>,
  targetLang: 'en' | 'fr' = 'en',
  context?: string
): Promise<Record<string, string>> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        targetLang,
        context,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur de traduction (${response.status})`);
    }

    const data = await response.json();
    return data.translations || {};
  } catch (error: any) {
    console.error('Erreur lors de la traduction IA:', error);
    throw error;
  }
}

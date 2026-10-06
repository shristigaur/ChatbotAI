const aiClient = {
  async askAI({ systemPrompt, history, userText }) {
    const baseUrl = (process.env.AI_API_URL || '').replace(/\/$/, '');
    const url = `${baseUrl}/chat/completions`;
    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;

    // Construct the payload in OpenAI-compatible format
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.text
      })),
      { role: 'user', content: userText }
    ];

    // Create an AbortController to enforce the 20-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`AI API request failed with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } finally {
      // Clean up the timeout so it doesn't hang the process
      clearTimeout(timeoutId);
    }
  }
};

module.exports = aiClient;

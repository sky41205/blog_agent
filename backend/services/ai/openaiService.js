const axios = require('axios');

class OpenAIService {
  constructor(apiKey, modelName = 'gpt-4o') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.modelName = modelName;
  }

  async generate(prompt, systemInstruction = '') {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.modelName,
        messages,
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 60000
      }
    );

    const choice = response.data?.choices?.[0];
    if (!choice) {
      throw new Error('No choices returned by OpenAI model.');
    }

    return choice.message.content;
  }

  async generateJSON(prompt, systemInstruction = '') {
    const rawText = await this.generate(prompt, systemInstruction);
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error(`Failed to parse OpenAI response as JSON: ${e.message}`);
    }
  }
}

module.exports = OpenAIService;

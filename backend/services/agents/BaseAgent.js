/**
 * BaseAgent - Foundational class for all specialized multi-agent content creation agents.
 * Provides structured validation, timing, logging, retries, and AI provider connectivity.
 */

const { AIProviderFactory } = require('../ai/aiProvider');

class BaseAgent {
  constructor(name, role, options = {}) {
    this.name = name;
    this.role = role;
    this.options = options;
    this.maxRetries = options.maxRetries || 2;
    this.timeoutMs = options.timeoutMs || 45000;
  }

  log(step, message, extra = null) {
    const time = new Date().toISOString();
    console.log(`[${this.name}] [${step}] ${message}`);
    return {
      agent: this.name,
      step,
      message,
      timestamp: time,
      extra
    };
  }

  async getAI() {
    return await AIProviderFactory.getProvider();
  }

  /**
   * Safe execution wrapper with timing, retry logic, and fallback support
   */
  async execute(input, context = {}) {
    const startTime = Date.now();
    this.log('START', `Initiating task with input: ${JSON.stringify(input).slice(0, 100)}...`);

    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.run(input, context);
        const duration = Date.now() - startTime;
        this.log('SUCCESS', `Completed in ${duration}ms (Attempt ${attempt})`);
        return {
          success: true,
          agent: this.name,
          role: this.role,
          attempt,
          durationMs: duration,
          data: result
        };
      } catch (err) {
        lastError = err;
        this.log('RETRY_WARN', `Attempt ${attempt}/${this.maxRetries} failed: ${err.message}`);
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 800 * attempt));
        }
      }
    }

    // Fallback handler if implemented by agent
    if (typeof this.fallback === 'function') {
      try {
        this.log('FALLBACK', 'Executing deterministic fallback logic...');
        const fallbackResult = await this.fallback(input, context, lastError);
        const duration = Date.now() - startTime;
        return {
          success: true,
          agent: this.name,
          role: this.role,
          isFallback: true,
          durationMs: duration,
          data: fallbackResult
        };
      } catch (fbErr) {
        this.log('FALLBACK_ERROR', `Fallback also failed: ${fbErr.message}`);
      }
    }

    const duration = Date.now() - startTime;
    return {
      success: false,
      agent: this.name,
      role: this.role,
      durationMs: duration,
      error: lastError?.message || 'Execution failed'
    };
  }

  // To be implemented by subclasses
  async run(input, context) {
    throw new Error(`Agent ${this.name} must implement the run() method`);
  }
}

module.exports = BaseAgent;

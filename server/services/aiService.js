const auditService = require('./auditService');
const Groq = require('groq-sdk');
const AILog = require('../models/AILog');

/**
 * AI Service Layer
 * Abstracts Groq AI interactions. Keeps the API key purely on the backend.
 * Provides timeout handling, rate limiting detection, and audit logging.
 */
class AIService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || 'MISSING_API_KEY' // Fallback to prevent immediate crash if env is missing, but will fail gracefully
    });
    // Define the default model for various tasks. Fast/cheap for summaries, big for analysis.
    this.defaultModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
  }

  /**
   * Safe execution wrapper for AI calls that handles logging and standard errors.
   */
  async _executeAIOperation(userId, action, prompt, systemPrompt, modelConfig, metadata = {}) {
    const startTime = Date.now();
    let logStatus = 'success';
    let errorMessage = null;
    let aiResponseText = null;
    let promptTokens = 0;
    let responseTokens = 0;

    try {
      if (this.groq.apiKey === 'MISSING_API_KEY') {
        throw new Error('Groq API Key is not configured on the backend environment.');
      }

      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: modelConfig?.model || this.defaultModel,
        temperature: modelConfig?.temperature || 0.3, 
        max_tokens: modelConfig?.max_tokens || 1024,
      });

      aiResponseText = response.choices[0]?.message?.content || '';
      promptTokens = response.usage?.prompt_tokens || 0;
      responseTokens = response.usage?.completion_tokens || 0;
      
      return aiResponseText;

    } catch (error) {
      errorMessage = error.message;

      if (error instanceof Groq.APIError) {
        if (error.status === 429) {
          logStatus = 'rate_limited';
          throw new Error('AI Service is currently rate limited. Please try again later.');
        }
        if (error.status >= 500) {
          logStatus = 'timeout'; 
          throw new Error('AI Service is currently unavailable. Please try again later.');
        }
      }
      
      logStatus = 'error';
      throw new Error(`AI processing failed: ${error.message}`);
      
    } finally {
      const processingTimeMs = Date.now() - startTime;
      
      // Fire-and-forget Audit Log
      AILog.create({
        user: userId,
        action,
        caseId: metadata.caseId || null,
        promptTokens,
        responseTokens,
        modelUsed: modelConfig?.model || this.defaultModel,
        processingTimeMs,
        status: logStatus,
        errorMessage
      }).catch(err => console.error('Failed to save AI audit log:', err));

      // Also register in the master system audit log
      auditService.logInternal(userId, 'ai_feature_used', 'AI', null, { 
        aiAction: action, 
        caseId: metadata.caseId 
      });
    }
  }

  /**
   * Generic text test for the API
   */
  async testPrompt(userId, userPrompt) {
    const systemPrompt = "You are AegisCore, a highly secure AI assistant for law enforcement. Answer the user's prompt politely but concisely. Do not make autonomous decisions or provide tactical instructions.";
    return this._executeAIOperation(userId, 'test_prompt', userPrompt, systemPrompt);
  }

  /**
   * Generates a summary for a given block of text.
   */
  async generateSummary(userId, content, caseId = null) {
    if (!content) return '';
    
    const systemPrompt = "You are an assistant for law enforcement. Summarize the following case report text. Be concise, objective, and highlight key facts (suspects, dates, locations, crucial evidence). Do not invent information.";
    
    // We pass null for modelConfig to use defaults
    return this._executeAIOperation(userId, 'summarize_report', content, systemPrompt, null, { caseId });
  }

  /**
   * Analyze case data
   */
  async analyzeCase(userId, caseData) {
    const systemPrompt = `You are a Senior Detective AI. Analyze the provided case details (JSON). Return a tactical breakdown containing:
1. Primary objective
2. Missing evidence or logical gaps
3. Recommended next steps for the investigating officer.
Keep it strictly under 300 words. Format as clean text with bullet points.`;
    
    return this._executeAIOperation(userId, 'analyze_case', JSON.stringify(caseData), systemPrompt, null, { caseId: caseData._id });
  }
}

module.exports = new AIService();

import Anthropic from '@anthropic-ai/sdk';
import { SALARY_SYNTHESIS_SYSTEM_PROMPT, SALARY_SYNTHESIS_PROMPT } from '../prompts/salarySynthesis.prompt';
import { SKILL_DEMAND_SYSTEM_PROMPT, SKILL_DEMAND_PROMPT } from '../prompts/skillDemand.prompt';
import { ROLE_INTELLIGENCE_SYSTEM_PROMPT, ROLE_INTELLIGENCE_PROMPT } from '../prompts/roleIntelligence.prompt';
import { JOB_NORMALIZATION_SYSTEM_PROMPT, JOB_NORMALIZATION_PROMPT } from '../prompts/jobNormalisation.prompt';
import { GAP_ANALYSIS_SYSTEM_PROMPT, GAP_ANALYSIS_PROMPT } from '../prompts/gapAnalysis.prompt';
import { OFFER_EVALUATION_SYSTEM_PROMPT, OFFER_EVALUATION_PROMPT } from '../prompts/offerEvaluation.prompt';
import { MARKET_OVERVIEW_SYSTEM_PROMPT, MARKET_OVERVIEW_PROMPT } from '../prompts/marketOverview.prompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class AIService {
  async generateContent(systemPrompt: string, userPrompt: string, temperature: number = 0.1): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0] as Anthropic.TextBlock;
      return content.text;
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('AI synthesis failed');
    }
  }

  async parseJSONResponse(text: string): Promise<any> {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      throw new Error('Failed to parse AI response');
    }
  }

  async synthesizeSalaryData(rawData: string): Promise<any> {
    const prompt = SALARY_SYNTHESIS_PROMPT(rawData);
    const response = await this.generateContent(SALARY_SYNTHESIS_SYSTEM_PROMPT, prompt);
    return this.parseJSONResponse(response);
  }

  async synthesizeSkillDemand(rawData: string, location: string = 'global'): Promise<any> {
    const prompt = SKILL_DEMAND_PROMPT(rawData, location);
    const response = await this.generateContent(SKILL_DEMAND_SYSTEM_PROMPT, prompt);
    return this.parseJSONResponse(response);
  }

  async synthesizeRoleIntelligence(rawData: string): Promise<any> {
    const prompt = ROLE_INTELLIGENCE_PROMPT(rawData);
    const response = await this.generateContent(ROLE_INTELLIGENCE_SYSTEM_PROMPT, prompt);
    return this.parseJSONResponse(response);
  }

  async normalizeJobTitles(rawTitles: string[]): Promise<any> {
    const prompt = JOB_NORMALIZATION_PROMPT(rawTitles);
    const response = await this.generateContent(JOB_NORMALIZATION_SYSTEM_PROMPT, prompt);
    return this.parseJSONResponse(response);
  }

  async analyzeSkillGap(currentSkills: string[], targetRole: string, currentRole?: string, experienceYears?: number, timelineMonths?: number): Promise<any> {
    const prompt = GAP_ANALYSIS_PROMPT(currentSkills, targetRole, currentRole, experienceYears, timelineMonths);
    const response = await this.generateContent(GAP_ANALYSIS_SYSTEM_PROMPT, prompt, 0.2);
    return this.parseJSONResponse(response);
  }

  async evaluateSalaryOffer(offerData: any): Promise<any> {
    const prompt = OFFER_EVALUATION_PROMPT(offerData);
    const response = await this.generateContent(OFFER_EVALUATION_SYSTEM_PROMPT, prompt);
    return this.parseJSONResponse(response);
  }

  async generateMarketOverview(rawData: string, sector: string, location: string): Promise<any> {
    const prompt = MARKET_OVERVIEW_PROMPT(rawData, sector, location);
    const response = await this.generateContent(MARKET_OVERVIEW_SYSTEM_PROMPT, prompt, 0.3);
    return this.parseJSONResponse(response);
  }

  async normalizeJobTitle(title: string): Promise<string> {
    try {
      const result = await this.normalizeJobTitles([title]);
      return result[0].normalised;
    } catch (error) {
      console.error('Job title normalization failed:', error);
      return title;
    }
  }
}

export default new AIService();
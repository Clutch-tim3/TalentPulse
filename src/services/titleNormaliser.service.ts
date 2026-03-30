import aiService from './ai.service';
import { normalizeJobTitle as localNormalize } from '../utils/titleTaxonomy';

class TitleNormaliserService {
  async normalizeJobTitles(rawTitles: string[]): Promise<Array<{ input: string; normalised: string; confidence: string; level: string; note?: string }>> {
    try {
      const normalizedTitles = await aiService.normalizeJobTitles(rawTitles);
      
      return normalizedTitles.map((result: any) => ({
        input: result.input,
        normalised: result.normalised,
        confidence: result.confidence,
        level: result.level,
        note: result.note,
      }));
    } catch (error) {
      console.error('AI title normalization failed, using local fallback:', error);
      
      return rawTitles.map(title => {
        const result = localNormalize(title);
        return {
          input: title,
          normalised: result.normalized,
          confidence: result.confidence,
          level: result.level,
          note: 'Normalized using local taxonomy',
        };
      });
    }
  }

  async normalizeJobTitle(rawTitle: string): Promise<{ input: string; normalised: string; confidence: string; level: string; note?: string }> {
    try {
      const [result] = await this.normalizeJobTitles([rawTitle]);
      return result;
    } catch (error) {
      console.error('Title normalization failed:', error);
      
      const localResult = localNormalize(rawTitle);
      return {
        input: rawTitle,
        normalised: localResult.normalized,
        confidence: localResult.confidence,
        level: localResult.level,
        note: 'Normalized using local taxonomy',
      };
    }
  }
}

export default new TitleNormaliserService();
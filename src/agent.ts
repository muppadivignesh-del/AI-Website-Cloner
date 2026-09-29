import { analyzeWebsite, type AnalysisResult } from './analyze';
import { generateWebsite, type GenerationResult } from './generate';
import { modifyWebsite, type ModifyResult } from './modify';
import { validateAndFixCode, validateCodeSyntax } from './validate';

export interface CloneWorkflowResult {
  url: string;
  analysis: AnalysisResult;
  code: string;
  componentList: string[];
  syntaxValidation: { valid: boolean; errors: string[] };
}

export class WebsiteClonerAgent {
  /**
   * Complete end-to-end website cloning pipeline:
   * 1. Analyze target website (DOM, fonts, screenshot, sections)
   * 2. Generate responsive React/Tailwind frontend
   * 3. Validate code syntax
   */
  async clone(url: string): Promise<CloneWorkflowResult> {
    console.log(`[Agent] Initiating clone workflow for: ${url}`);

    // Step 1: Analyze
    const analysis = await analyzeWebsite(url);
    console.log(`[Agent] Analysis completed: "${analysis.title}" with ${analysis.sections.length} sections`);

    // Step 2: Generate
    const genResult = await generateWebsite(analysis);
    const code = genResult.files['app/cloned/page.tsx'] || Object.values(genResult.files)[0] || '';

    // Step 3: Validate
    const syntaxValidation = validateCodeSyntax(code);
    let finalCode = code;

    if (!syntaxValidation.valid) {
      console.warn('[Agent] Syntax warnings detected, attempting auto-repair...');
      finalCode = await validateAndFixCode(code, syntaxValidation.errors.join('; '));
    }

    return {
      url,
      analysis,
      code: finalCode,
      componentList: genResult.componentList,
      syntaxValidation,
    };
  }

  /**
   * Apply natural language instructions to an existing generated website
   */
  async modify(currentCode: string, instruction: string, url: string = ''): Promise<ModifyResult> {
    console.log(`[Agent] Applying modification: "${instruction}"`);
    return modifyWebsite(currentCode, instruction, url);
  }
}

export const agent = new WebsiteClonerAgent();

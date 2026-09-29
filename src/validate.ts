import { fixCodeErrors as baseFixCodeErrors } from '../lib/generator';

export async function validateAndFixCode(code: string, errors: string): Promise<string> {
  if (!errors || !errors.trim()) {
    return code;
  }
  return baseFixCodeErrors(code, errors);
}

export function validateCodeSyntax(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!code || code.trim().length === 0) {
    errors.push('Code is empty');
  }

  // Check balanced braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Mismatched braces: ${openBraces} open vs ${closeBraces} close`);
  }

  // Check default export
  if (!code.includes('export default')) {
    errors.push('Missing export default component');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

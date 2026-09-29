import { modifyWebsite as baseModifyWebsite, type ModifyResult } from '../lib/generator';
import { fallbackModifyCode } from '../lib/modifier-fallback';

export { type ModifyResult, fallbackModifyCode };

export async function modifyWebsite(
  currentCode: string,
  instruction: string,
  url: string = ''
): Promise<ModifyResult> {
  return baseModifyWebsite(currentCode, instruction, url);
}

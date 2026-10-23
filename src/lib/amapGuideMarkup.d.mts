export type InlineToken =
  | { type: 'text' | 'strong' | 'em'; text: string }
  | { type: 'link'; text: string; href: string };
export type ShotSegment = { type: 'text'; text: string } | { type: 'shots'; ids: string[] };
export function parseInline(text: string): InlineToken[];
export function splitShots(text: string): ShotSegment[];
export function plainText(text: string): string;
type ShotBlock = { text?: string; items?: string[]; ids?: string[] };
export function shotIds(content: { sections: Array<{ blocks: ShotBlock[]; subsections?: Array<{ blocks: ShotBlock[] }> }> }): string[];
export function shotMaxWidth(count: number): number;

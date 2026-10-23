export type InlineToken =
  | { type: 'text' | 'strong' | 'em'; text: string }
  | { type: 'link'; text: string; href: string };
export type ShotSegment = { type: 'text'; text: string } | { type: 'shots'; ids: string[] };
export function parseInline(text: string): InlineToken[];
export function splitShots(text: string): ShotSegment[];
export function plainText(text: string): string;
export function shotIds(content: { sections: Array<{ blocks: Array<{ text?: string; items?: string[] }>; subsections?: Array<{ blocks: Array<{ text?: string; items?: string[] }> }> }> }): string[];

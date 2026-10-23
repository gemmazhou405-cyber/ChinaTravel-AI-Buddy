export interface AmapLanguageFix {
  title: string;
  steps: string[];
  href: string;
  label: string;
}
export interface AmapLanguageHelpContent {
  devices: Array<{ id: string; label: string }>;
  issues: Array<{ id: string; label: string; platformSpecific?: boolean; beforeSteps?: string[]; fix?: AmapLanguageFix }>;
  platformFixes: Record<string, AmapLanguageFix>;
}
export function getAmapLanguageFix(content: AmapLanguageHelpContent, deviceId: string, issueId: string): AmapLanguageFix | null;

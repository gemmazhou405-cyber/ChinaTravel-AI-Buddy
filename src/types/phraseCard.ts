export interface PhraseCardData {
  id: string;
  scene: string;
  priority: 'high' | 'medium' | 'low';
  english: string;
  chinese: string;
  pinyin: string;
  usageNote: string;
  showToLocal: boolean;
  emergencyRelevant: boolean;
  audioText: string;
  tags: string[];
}

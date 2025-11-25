export interface ViveToolResult {
  featureName: string;
  featureId: string;
  command: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface Tip {
  title: string;
  content: string;
  category: 'System' | 'Productivity' | 'Hidden' | 'Customization' | 'Cheats' | 'Gameplay';
}

export type Platform = 'Windows' | 'iPhone' | 'Games';

export enum AppView {
  HOME = 'HOME',
  VIVETOOL = 'VIVETOOL',
  TIPS = 'TIPS'
}
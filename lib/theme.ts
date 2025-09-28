export type Palette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  background2: string;
  background3: string;
  text: string;
  textEmphasis: string;
  border: string;
  borderActive: string;
  success: string;
  warning: string;
};

export type Theme = {
  name: 'retro' | 'nova';
  gradient: [string, string, string];
  colors: Palette;
};

export const RetroTheme: Theme = {
  name: 'retro',
  gradient: ['#000011', '#001122', '#000033'],
  colors: {
    primary: '#00FFFF',
    secondary: '#FF00FF',
    accent: '#FFFF00',
    background: '#000011',
    background2: '#001122',
    background3: '#000033',
    text: '#C3C7FF',
    textEmphasis: '#FFFFFF',
    border: '#333366',
    borderActive: '#00FFFF',
    success: '#00FF66',
    warning: '#FFA500',
  },
};

// Modern, higher-contrast but calmer look
export const NovaTheme: Theme = {
  name: 'nova',
  gradient: ['#0B1020', '#0F172A', '#0B1020'],
  colors: {
    primary: '#22D3EE', // cyan-400
    secondary: '#8B5CF6', // violet-500
    accent: '#FCD34D', // amber-300
    background: '#0B1020',
    background2: '#0F172A',
    background3: '#0B1020',
    text: '#CBD5E1', // slate-300
    textEmphasis: '#FFFFFF',
    border: '#1F2A44',
    borderActive: '#38BDF8', // sky-400
    success: '#10B981', // emerald-500
    warning: '#F59E0B', // amber-500
  },
};

export const THEMES: Record<Theme['name'], Theme> = {
  retro: RetroTheme,
  nova: NovaTheme,
};


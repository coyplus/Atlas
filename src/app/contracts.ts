export type PersonaId = 'alex' | 'jordan' | 'sam' | 'elena';
export type TabId = 'now' | 'future' | 'you';
export type Direction = 'vanilla' | 'bento' | 'metro';
export interface AtlasNavigation {
  person: PersonaId;
  tab: TabId;
  direction: Direction;
  modal: string | null;
}
export interface ViewState extends AtlasNavigation {
  depth: number;
  agreement: string | null;
}
export interface DemoApi {
  dispatch(action: string): void;
  getState(): unknown;
  getView(): ViewState;
  go(person?: string, tab?: string): void;
  closeAll(): void;
  reset(): void;
  [method: string]: unknown;
}
declare global {
  interface Window {
    atlas: DemoApi;
    ATLAS_DATA: any;
    ATLAS_MEDIA: any;
    ATLAS_PORTRAITS: Record<string, string>;
    ATLAS_BANK_LOGOS: Record<string, string>;
    ATLAS_AUDIO: any;
    ATLAS_RESTORED: any;
    ATLAS_VERSION: string;
    __ATLAS_TEST__?: boolean;
    __consoleErrors?: string[];
  }
}

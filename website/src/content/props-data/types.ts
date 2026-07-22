export interface PropRow {
  name: string;
  type: string;
  default: string;
  platform?: 'iOS' | 'Android' | 'iOS 26+' | 'iOS, Web';
  description: string;
}

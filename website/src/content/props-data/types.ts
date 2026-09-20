export interface PropRow {
  name: string;
  type: string;
  default: string;
  platform?: 'iOS' | 'Android' | 'iOS 26+' | 'iOS, Web' | 'iOS 26+, Android 13+';
  description: string;
}

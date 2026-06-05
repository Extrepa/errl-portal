export type NavKey = 'forum' | 'about' | 'gallery' | 'studio';

export type NavItemConfig = {
  key: NavKey;
  label: string;
  href: string;
  external?: boolean;
  angle: number;
  dist: number;
  color: string;
};

export const NAV_ITEMS: NavItemConfig[] = [
  {
    key: 'forum',
    label: 'Forum',
    href: 'https://forum.errl.wtf',
    external: true,
    angle: 140,
    dist: 180,
    color: '#7ec8ff',
  },
  {
    key: 'about',
    label: 'About',
    href: '/about/',
    angle: 210,
    dist: 180,
    color: '#c9a7ff',
  },
  {
    key: 'gallery',
    label: 'Gallery',
    href: '/gallery/',
    angle: 260,
    dist: 175,
    color: '#ff9ed8',
  },
  {
    key: 'studio',
    label: 'Studio',
    href: '/studio/',
    angle: 20,
    dist: 200,
    color: '#8dffb5',
  },
];

import { Product } from './types';

export const PERFUMES: Product[] = [
  {
    id: '1',
    name: 'Royal Oud',
    category: 'Men',
    type: 'Perfume',
    price: 4500,
    sizeVariants: {
      '50ml': { price: 4500, originalPrice: 6500 },
      '100ml': { price: 7500, originalPrice: 9500 }
    },
    description: 'An intense woody fragrance with notes of agarwood and sandalwood.',
    notes: ['Agarwood', 'Sandalwood', 'Spices'],
    images: ['https://picsum.photos/seed/oud/500/500'],
    isBestSeller: true,
    isFeatured: true,
    concentration: 'EDP',
    sizes: ['50ml', '100ml'],
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Impression of Creed',
    category: 'Impression',
    type: 'Perfume',
    price: 2200,
    sizeVariants: {
      '30ml': { price: 2200, originalPrice: 3000 },
      '50ml': { price: 3500, originalPrice: 4500 }
    },
    description: 'Our take on the legendary Aventus. Fruity, rich, and confident.',
    notes: ['Pineapple', 'Birch', 'Musk'],
    images: ['https://picsum.photos/seed/creed/500/500'],
    isBestSeller: true,
    isFeatured: true,
    concentration: 'Extrait',
    sizes: ['30ml', '50ml'],
    createdAt: new Date().toISOString()
  }
];

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop All', href: '/shop' },
  { name: 'Men', href: '/shop/Men' },
  { name: 'Women', href: '/shop/Women' },
  { name: 'Impression', href: '/shop/Impression' },
];
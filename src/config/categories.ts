import { Category } from '@prisma/client';

interface CategoryConfig {
  icon: string;
  color: string;
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  [Category.SPORT]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/857/857418.png', // Sports ball
    color: '#FF6B35'
  },
  [Category.GEOGRAPHY]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/1865/1865269.png', // Globe
    color: '#3498DB'
  },
  [Category.SCIENCE]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/2784/2784403.png', // Atom
    color: '#27AE60'
  },
  [Category.HISTORY]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/2991/2991148.png', // Scroll
    color: '#8B6F47'
  },
  [Category.POP_CULTURE]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/1828/1828884.png', // Star
    color: '#E91E63'
  },
  [Category.ENTERTAINMENT]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/2809/2809590.png', // Film reel
    color: '#FFD700'
  },
  [Category.TECHNOLOGY]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/2103/2103633.png', // Circuit
    color: '#2196F3'
  },
  [Category.LITERATURE]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/2232/2232688.png', // Book
    color: '#9B59B6'
  },
  [Category.FOOD]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/1046/1046784.png', // Utensils
    color: '#E74C3C'
  },
  [Category.BUSINESS]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/1170/1170576.png', // Briefcase
    color: '#607D8B'
  },
  [Category.HEALTH]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/2807/2807843.png', // Heart pulse
    color: '#FF4757'
  },
  [Category.NATURE]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/628/628283.png', // Leaf
    color: '#4CAF50'
  },
  [Category.MATHEMATICS]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/3039/3039659.png', // Calculator
    color: '#3F51B5'
  },
  [Category.LANGUAGES]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/2950/2950853.png', // Speech bubble
    color: '#00BCD4'
  },
  [Category.CURRENT_EVENTS]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/2965/2965879.png', // Newspaper
    color: '#263238'
  },
  [Category.OTHER]: {
    icon: 'https://cdn-icons-png.flaticon.com/64/1828/1828640.png', // Question mark
    color: '#9E9E9E'
  }
};

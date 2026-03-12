export interface NewArrivalProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  colors?: string[];
  isNew: boolean;
}

export const NEW_ARRIVALS_DATA: NewArrivalProduct[] = [
  {
    id: 'new-1',
    name: 'AuraMax Pro',
    price: 319,
    originalPrice: 389,
    category: 'Over-Ear Headphones',
    image: 'https://readdy.ai/api/search-image?query=sleek%20matte%20black%20over%20ear%20headphones%20with%20brushed%20aluminum%20accents%20ultra%20modern%20minimalist%20design%20floating%20on%20pure%20white%20background%20premium%20product%20photography%20studio%20lighting%202025%20audio%20gear&width=500&height=500&seq=new-arr-001&orientation=squarish',
    rating: 4.9,
    reviewCount: 42,
    badge: 'Just Dropped',
    colors: ['#1a1a1a', '#C0C0C0', '#8B4513'],
    isNew: true,
  },
  {
    id: 'new-2',
    name: 'PureFlow Buds',
    price: 149,
    originalPrice: 179,
    category: 'True Wireless Earbuds',
    image: 'https://readdy.ai/api/search-image?query=pearl%20white%20true%20wireless%20earbuds%20with%20transparent%20charging%20case%20modern%20elegant%20design%20floating%20on%20soft%20cream%20background%20premium%20product%20photography%20clean%20minimal%20aesthetic%202025&width=500&height=500&seq=new-arr-002&orientation=squarish',
    rating: 4.7,
    reviewCount: 28,
    badge: 'New',
    colors: ['#F5F5F0', '#D4C5B0', '#2C2C2C'],
    isNew: true,
  },
  {
    id: 'new-3',
    name: 'ZenStudio 3',
    price: 429,
    category: 'Studio Headphones',
    image: 'https://readdy.ai/api/search-image?query=professional%20studio%20reference%20headphones%20warm%20brown%20leather%20headband%20with%20cream%20ear%20cups%20elegant%20vintage%20modern%20fusion%20design%20floating%20on%20light%20beige%20background%20high%20end%20audio%20product%20photography&width=500&height=500&seq=new-arr-003&orientation=squarish',
    rating: 5.0,
    reviewCount: 17,
    badge: 'Editor\'s Pick',
    colors: ['#8B7355', '#F5F0E8', '#2C2C2C'],
    isNew: true,
  },
  {
    id: 'new-4',
    name: 'SwiftRun X2',
    price: 119,
    originalPrice: 149,
    category: 'Sport Earbuds',
    image: 'https://readdy.ai/api/search-image?query=vibrant%20coral%20orange%20sport%20wireless%20earbuds%20with%20secure%20fit%20ear%20hooks%20athletic%20performance%20design%20floating%20on%20clean%20white%20background%20dynamic%20product%20photography%20fitness%20audio%202025&width=500&height=500&seq=new-arr-004&orientation=squarish',
    rating: 4.6,
    reviewCount: 63,
    badge: 'Trending',
    colors: ['#FF6B47', '#2C2C2C', '#FFFFFF'],
    isNew: true,
  },
  {
    id: 'new-5',
    name: 'CloudFold Lite',
    price: 229,
    originalPrice: 269,
    category: 'Foldable Headphones',
    image: 'https://readdy.ai/api/search-image?query=compact%20foldable%20wireless%20headphones%20in%20sage%20green%20with%20soft%20matte%20finish%20travel%20friendly%20modern%20design%20floating%20on%20light%20gray%20background%20premium%20product%20photography%20minimalist%20style&width=500&height=500&seq=new-arr-005&orientation=squarish',
    rating: 4.8,
    reviewCount: 35,
    badge: 'New',
    colors: ['#8FAF8F', '#E8E0D5', '#3C3C3C'],
    isNew: true,
  },
  {
    id: 'new-6',
    name: 'NightOwl ANC',
    price: 369,
    category: 'Noise Cancelling',
    image: 'https://readdy.ai/api/search-image?query=deep%20navy%20blue%20premium%20noise%20cancelling%20headphones%20with%20gold%20trim%20accents%20sophisticated%20luxury%20design%20floating%20on%20dark%20gradient%20background%20high%20end%20product%20photography%20exclusive%20audio%20equipment&width=500&height=500&seq=new-arr-006&orientation=squarish',
    rating: 4.9,
    reviewCount: 51,
    badge: 'Hot',
    colors: ['#1B2A4A', '#C9A84C', '#F0EDE8'],
    isNew: true,
  },
];

export const NEW_ARRIVALS_BADGE_COLORS: Record<string, string> = {
  'Just Dropped': 'bg-teal-500 text-white',
  'New': 'bg-emerald-500 text-white',
  "Editor's Pick": 'bg-amber-500 text-white',
  'Trending': 'bg-rose-500 text-white',
  'Hot': 'bg-orange-500 text-white',
};

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface NavLink {
  id: string;
  label: string;
  url: string;
  visible: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface HeroContent {
  heading1: string;
  heading2: string;
  highlightedWord: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  backgroundImage: string;
}

interface FooterContent {
  brandName: string;
  tagline: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  productsLinks: Array<{ id: string; label: string; url: string }>;
  supportLinks: Array<{ id: string; label: string; url: string }>;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
  };
  copyright: string;
  showTrustBadges: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  isNew?: boolean;
  stock?: number;
  badge?: string;
}

export interface StoreCategory {
  id: string;
  name: string;
  image: string;
  description?: string;
}

export interface AnnouncementBarSettings {
  enabled: boolean;
  message: string;
  icon: string;
  linkLabel: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  dismissible: boolean;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_STORE_NAME = 'WHISPER';
const DEFAULT_STORE_TAGLINE = 'Premium Audio Experience';

const DEFAULT_NAV_LINKS: NavLink[] = [
  { id: '1', label: 'Home', url: '/', visible: true },
  { id: '2', label: 'Shop', url: '/shop', visible: true },
  { id: '3', label: 'Contact', url: '/contact', visible: true },
];

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Admin User',
  email: 'admin@whisper.com',
  avatar: '',
};

const DEFAULT_HERO: HeroContent = {
  heading1: 'Experience Pure',
  heading2: 'Sound Quality',
  highlightedWord: 'whisper',
  description: 'Immerse yourself in crystal-clear audio with our premium headphones. Designed for audiophiles who demand perfection.',
  ctaLabel: 'Shop Now',
  ctaUrl: '/shop',
  backgroundImage: 'https://readdy.ai/api/search-image?query=modern%20minimalist%20premium%20audio%20headphones%20floating%20in%20clean%20studio%20environment%20with%20soft%20gradient%20background%20professional%20product%20photography%20style%20high%20end%20technology%20aesthetic%20clean%20composition&width=1920&height=1080&seq=hero-bg-001&orientation=landscape',
};

const DEFAULT_FOOTER: FooterContent = {
  brandName: 'WHISPER',
  tagline: 'Premium Audio Experience',
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
  },
  productsLinks: [
    { id: '1', label: 'Headphones', url: '/shop?category=headphones' },
    { id: '2', label: 'Earbuds', url: '/shop?category=earbuds' },
    { id: '3', label: 'Accessories', url: '/shop?category=accessories' },
  ],
  supportLinks: [
    { id: '1', label: 'Contact Us', url: '/contact' },
    { id: '2', label: 'Shipping Info', url: '/shipping' },
    { id: '3', label: 'Returns', url: '/returns' },
  ],
  contactInfo: {
    address: '123 Audio Street, Sound City, SC 12345',
    phone: '+1 (555) 123-4567',
    email: 'support@whisper.com',
  },
  copyright: '© 2025 WHISPER. All rights reserved.',
  showTrustBadges: true,
};

export const DEFAULT_STORE_CATEGORIES: StoreCategory[] = [
  {
    id: 'cat-1',
    name: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=premium%20over-ear%20headphones%20with%20sleek%20black%20design%20isolated%20on%20pure%20white%20background%2C%20product%20photography%2C%20clean%20minimal%20style%2C%20professional%20studio%20lighting%2C%20centered%20composition%2C%20no%20shadows&width=200&height=200&seq=cat-headphones-001&orientation=squarish',
    description: 'Over-ear & on-ear',
  },
  {
    id: 'cat-2',
    name: 'Earbuds',
    image: 'https://readdy.ai/api/search-image?query=wireless%20earbuds%20in%20open%20charging%20case%20isolated%20on%20pure%20white%20background%2C%20product%20photography%2C%20clean%20minimal%20style%2C%20professional%20studio%20lighting%2C%20centered%20composition%2C%20no%20shadows&width=200&height=200&seq=cat-earbuds-001&orientation=squarish',
    description: 'True wireless & wired',
  },
  {
    id: 'cat-3',
    name: 'Speakers',
    image: 'https://readdy.ai/api/search-image?query=modern%20portable%20bluetooth%20speaker%20isolated%20on%20pure%20white%20background%2C%20product%20photography%2C%20clean%20minimal%20style%2C%20professional%20studio%20lighting%2C%20centered%20composition%2C%20no%20shadows&width=200&height=200&seq=cat-speakers-001&orientation=squarish',
    description: 'Portable & home audio',
  },
  {
    id: 'cat-4',
    name: 'Accessories',
    image: 'https://readdy.ai/api/search-image?query=audio%20accessories%20headphone%20cable%20and%20adapter%20isolated%20on%20pure%20white%20background%2C%20product%20photography%2C%20clean%20minimal%20style%2C%20professional%20studio%20lighting%2C%20centered%20composition%2C%20no%20shadows&width=200&height=200&seq=cat-accessories-001&orientation=squarish',
    description: 'Cables, cases & more',
  },
  {
    id: 'cat-5',
    name: 'Studio Gear',
    image: 'https://readdy.ai/api/search-image?query=professional%20studio%20condenser%20microphone%20isolated%20on%20pure%20white%20background%2C%20product%20photography%2C%20clean%20minimal%20style%2C%20professional%20studio%20lighting%2C%20centered%20composition%2C%20no%20shadows&width=200&height=200&seq=cat-studio-001&orientation=squarish',
    description: 'Pro recording tools',
  },
];

const DEFAULT_PROMOTIONAL: Product[] = [
  {
    id: 'promo-1',
    name: 'Studio Pro X1',
    price: 299,
    originalPrice: 399,
    category: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=premium%20black%20over%20ear%20studio%20headphones%20with%20sleek%20modern%20design%20floating%20on%20minimal%20light%20gray%20background%20professional%20product%20photography%20high%20quality%20audio%20equipment&width=600&height=600&seq=promo-prod-001&orientation=squarish',
    stock: 45,
  },
  {
    id: 'promo-2',
    name: 'AirPods Elite',
    price: 199,
    originalPrice: 249,
    category: 'Earbuds',
    image: 'https://readdy.ai/api/search-image?query=white%20wireless%20earbuds%20in%20charging%20case%20modern%20minimalist%20design%20floating%20on%20soft%20light%20background%20premium%20product%20photography%20clean%20aesthetic&width=600&height=600&seq=promo-prod-002&orientation=squarish',
    stock: 78,
  },
  {
    id: 'promo-3',
    name: 'Bass Master 500',
    price: 349,
    originalPrice: 449,
    category: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=red%20and%20black%20gaming%20headphones%20with%20led%20lights%20modern%20aggressive%20design%20floating%20on%20minimal%20background%20professional%20product%20shot%20high%20end%20gaming%20gear&width=600&height=600&seq=promo-prod-003&orientation=squarish',
    stock: 23,
  },
];

const DEFAULT_POPULAR: Product[] = [
  {
    id: 'pop-1',
    name: 'Wireless Pro',
    price: 249,
    originalPrice: 299,
    category: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=silver%20wireless%20headphones%20premium%20design%20with%20soft%20ear%20cushions%20floating%20on%20clean%20white%20background%20professional%20product%20photography%20modern%20audio%20equipment&width=500&height=500&seq=pop-prod-001&orientation=squarish',
    rating: 4.8,
    reviewCount: 234,
    stock: 56,
  },
  {
    id: 'pop-2',
    name: 'Sport Buds',
    price: 129,
    category: 'Earbuds',
    image: 'https://readdy.ai/api/search-image?query=black%20sport%20wireless%20earbuds%20with%20ear%20hooks%20athletic%20design%20floating%20on%20light%20background%20product%20photography%20fitness%20audio%20gear&width=500&height=500&seq=pop-prod-002&orientation=squarish',
    rating: 4.6,
    reviewCount: 189,
    stock: 92,
  },
  {
    id: 'pop-3',
    name: 'Studio Monitor',
    price: 399,
    category: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=professional%20studio%20monitor%20headphones%20black%20with%20gold%20accents%20premium%20build%20quality%20floating%20on%20minimal%20background%20high%20end%20audio%20equipment&width=500&height=500&seq=pop-prod-003&orientation=squarish',
    rating: 4.9,
    reviewCount: 312,
    stock: 34,
  },
  {
    id: 'pop-4',
    name: 'Comfort Plus',
    price: 179,
    originalPrice: 229,
    category: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=beige%20comfortable%20wireless%20headphones%20with%20plush%20ear%20pads%20modern%20minimalist%20design%20floating%20on%20soft%20background%20product%20photography&width=500&height=500&seq=pop-prod-004&orientation=squarish',
    rating: 4.7,
    reviewCount: 156,
    stock: 67,
  },
];

const DEFAULT_RECOMMENDED: Product[] = [
  {
    id: 'rec-1',
    name: 'Premium Wireless',
    price: 279,
    originalPrice: 329,
    category: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=elegant%20rose%20gold%20wireless%20headphones%20luxury%20design%20with%20leather%20headband%20floating%20on%20clean%20background%20premium%20product%20photography&width=500&height=500&seq=rec-prod-001&orientation=squarish',
    rating: 4.8,
    reviewCount: 267,
    colors: ['#C9ADA7', '#4A4E69', '#22223B'],
    isNew: true,
    stock: 41,
  },
  {
    id: 'rec-2',
    name: 'Noise Cancel Pro',
    price: 329,
    category: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=matte%20black%20noise%20cancelling%20headphones%20sleek%20professional%20design%20floating%20on%20minimal%20light%20background%20high%20end%20product%20photography&width=500&height=500&seq=rec-prod-002&orientation=squarish',
    rating: 4.9,
    reviewCount: 423,
    colors: ['#000000', '#2C3E50', '#95A5A6'],
    stock: 28,
  },
  {
    id: 'rec-3',
    name: 'Travel Companion',
    price: 199,
    originalPrice: 249,
    category: 'Earbuds',
    image: 'https://readdy.ai/api/search-image?query=compact%20white%20wireless%20earbuds%20with%20portable%20charging%20case%20travel%20friendly%20design%20floating%20on%20soft%20background%20product%20photography&width=500&height=500&seq=rec-prod-003&orientation=squarish',
    rating: 4.7,
    reviewCount: 198,
    colors: ['#FFFFFF', '#E8E8E8'],
    isNew: true,
    stock: 85,
  },
  {
    id: 'rec-4',
    name: 'Gaming Elite',
    price: 259,
    category: 'Headphones',
    image: 'https://readdy.ai/api/search-image?query=gaming%20headphones%20with%20rgb%20lighting%20black%20and%20neon%20accents%20modern%20esports%20design%20floating%20on%20dark%20background%20professional%20gaming%20gear%20photography&width=500&height=500&seq=rec-prod-004&orientation=squarish',
    rating: 4.8,
    reviewCount: 341,
    colors: ['#000000', '#00FF00', '#FF0000'],
    stock: 52,
  },
];

const DEFAULT_FEATURED: Product = {
  id: 'feat-1',
  name: 'Signature Edition',
  price: 449,
  originalPrice: 599,
  category: 'Headphones',
  image: 'https://readdy.ai/api/search-image?query=luxury%20premium%20headphones%20with%20gold%20and%20black%20finish%20signature%20edition%20design%20floating%20on%20elegant%20background%20high%20end%20product%20photography%20exclusive%20audio%20equipment&width=800&height=800&seq=feat-prod-001&orientation=squarish',
  rating: 5.0,
  reviewCount: 512,
  stock: 15,
};

const DEFAULT_NEW_ARRIVALS: Product[] = [
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
    stock: 30,
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
    stock: 55,
  },
  {
    id: 'new-3',
    name: 'ZenStudio 3',
    price: 429,
    category: 'Studio Headphones',
    image: 'https://readdy.ai/api/search-image?query=professional%20studio%20reference%20headphones%20warm%20brown%20leather%20headband%20with%20cream%20ear%20cups%20elegant%20vintage%20modern%20fusion%20design%20floating%20on%20light%20beige%20background%20high%20end%20audio%20product%20photography&width=500&height=500&seq=new-arr-003&orientation=squarish',
    rating: 5.0,
    reviewCount: 17,
    badge: "Editor's Pick",
    colors: ['#8B7355', '#F5F0E8', '#2C2C2C'],
    isNew: true,
    stock: 18,
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
    stock: 72,
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
    stock: 44,
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
    stock: 26,
  },
];

const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarSettings = {
  enabled: true,
  message: '🎧 Free shipping on orders over $50 — Limited time offer!',
  icon: '',
  linkLabel: 'Shop Now',
  linkUrl: '/shop',
  bgColor: '#0f766e',
  textColor: '#ffffff',
  dismissible: true,
};

// ─── Supabase helpers ─────────────────────────────────────────────────────────

const TABLE = 'Store settings';

async function loadSetting<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error || !data) return null;
  return data.value as T;
}

async function saveSetting(key: string, value: unknown): Promise<void> {
  await supabase
    .from(TABLE)
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface AdminStoreContextType {
  settingsLoading: boolean;
  storeName: string;
  setStoreName: (name: string) => void;
  storeLogo: string;
  setStoreLogo: (logo: string) => void;
  storeTagline: string;
  setStoreTagline: (tagline: string) => void;
  navLinks: NavLink[];
  setNavLinks: (links: NavLink[]) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  heroContent: HeroContent;
  setHeroContent: (content: HeroContent) => void;
  footerContent: FooterContent;
  setFooterContent: (content: FooterContent) => void;
  promotionalProducts: Product[];
  setPromotionalProducts: (products: Product[]) => void;
  popularProducts: Product[];
  setPopularProducts: (products: Product[]) => void;
  recommendedProducts: Product[];
  setRecommendedProducts: (products: Product[]) => void;
  featuredProduct: Product | null;
  setFeaturedProduct: (product: Product | null) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
  storeCategories: StoreCategory[];
  setStoreCategories: (categories: StoreCategory[]) => void;
  newArrivalsProducts: Product[];
  setNewArrivalsProducts: (products: Product[]) => void;
  newArrivalsMaxProducts: number;
  setNewArrivalsMaxProducts: (max: number) => void;
  announcementBar: AnnouncementBarSettings;
  setAnnouncementBar: (settings: AnnouncementBarSettings) => void;
}

const AdminStoreContext = createContext<AdminStoreContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AdminStoreProvider = ({ children }: { children: ReactNode }) => {
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [storeName, setStoreNameState] = useState(DEFAULT_STORE_NAME);
  const [storeLogo, setStoreLogoState] = useState('');
  const [storeTagline, setStoreTaglineState] = useState(DEFAULT_STORE_TAGLINE);
  const [navLinks, setNavLinksState] = useState<NavLink[]>(DEFAULT_NAV_LINKS);
  const [userProfile, setUserProfileState] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [heroContent, setHeroContentState] = useState<HeroContent>(DEFAULT_HERO);
  const [footerContent, setFooterContentState] = useState<FooterContent>(DEFAULT_FOOTER);
  const [promotionalProducts, setPromotionalProductsState] = useState<Product[]>(DEFAULT_PROMOTIONAL);
  const [popularProducts, setPopularProductsState] = useState<Product[]>(DEFAULT_POPULAR);
  const [recommendedProducts, setRecommendedProductsState] = useState<Product[]>(DEFAULT_RECOMMENDED);
  const [featuredProduct, setFeaturedProductState] = useState<Product | null>(DEFAULT_FEATURED);
  const [lowStockThreshold, setLowStockThresholdState] = useState<number>(10);
  const [storeCategories, setStoreCategoriesState] = useState<StoreCategory[]>(DEFAULT_STORE_CATEGORIES);
  const [newArrivalsProducts, setNewArrivalsProductsState] = useState<Product[]>(DEFAULT_NEW_ARRIVALS);
  const [newArrivalsMaxProducts, setNewArrivalsMaxProductsState] = useState<number>(6);
  const [announcementBar, setAnnouncementBarState] = useState<AnnouncementBarSettings>(DEFAULT_ANNOUNCEMENT_BAR);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          sName, sLogo, sTagline,
          nav, profile,
          hero, footer,
          promo, popular, recommended, featured,
          threshold, cats, newArrivals, newArrivalsMax,
          annBar,
        ] = await Promise.all([
          loadSetting<string>('storeName'),
          loadSetting<string>('storeLogo'),
          loadSetting<string>('storeTagline'),
          loadSetting<NavLink[]>('navLinks'),
          loadSetting<UserProfile>('userProfile'),
          loadSetting<HeroContent>('heroContent'),
          loadSetting<FooterContent>('footerContent'),
          loadSetting<Product[]>('promotionalProducts'),
          loadSetting<Product[]>('popularProducts'),
          loadSetting<Product[]>('recommendedProducts'),
          loadSetting<Product>('featuredProduct'),
          loadSetting<number>('lowStockThreshold'),
          loadSetting<StoreCategory[]>('storeCategories'),
          loadSetting<Product[]>('newArrivalsProducts'),
          loadSetting<number>('newArrivalsMaxProducts'),
          loadSetting<AnnouncementBarSettings>('announcementBar'),
        ]);

        if (sName !== null) setStoreNameState(sName);
        if (sLogo !== null) setStoreLogoState(sLogo);
        if (sTagline !== null) setStoreTaglineState(sTagline);
        if (nav !== null) setNavLinksState(nav);
        if (profile !== null) setUserProfileState(profile);
        if (hero !== null) setHeroContentState(hero);
        if (footer !== null) setFooterContentState(footer);
        if (promo !== null) setPromotionalProductsState(promo);
        if (popular !== null) setPopularProductsState(popular);
        if (recommended !== null) setRecommendedProductsState(recommended);
        if (featured !== null) setFeaturedProductState(featured);
        if (threshold !== null) setLowStockThresholdState(threshold);
        if (cats !== null) setStoreCategoriesState(cats);
        if (newArrivals !== null) setNewArrivalsProductsState(newArrivals);
        if (newArrivalsMax !== null) setNewArrivalsMaxProductsState(newArrivalsMax);
        if (annBar !== null) setAnnouncementBarState(annBar);
      } catch (_) {
        // silently fall back to defaults
      } finally {
        setSettingsLoading(false);
      }
    };
    load();
  }, []);

  const setStoreName = useCallback((v: string) => { setStoreNameState(v); saveSetting('storeName', v); }, []);
  const setStoreLogo = useCallback((v: string) => { setStoreLogoState(v); saveSetting('storeLogo', v); }, []);
  const setStoreTagline = useCallback((v: string) => { setStoreTaglineState(v); saveSetting('storeTagline', v); }, []);
  const setNavLinks = useCallback((v: NavLink[]) => { setNavLinksState(v); saveSetting('navLinks', v); }, []);
  const setUserProfile = useCallback((v: UserProfile) => { setUserProfileState(v); saveSetting('userProfile', v); }, []);
  const setHeroContent = useCallback((v: HeroContent) => { setHeroContentState(v); saveSetting('heroContent', v); }, []);
  const setFooterContent = useCallback((v: FooterContent) => { setFooterContentState(v); saveSetting('footerContent', v); }, []);
  const setPromotionalProducts = useCallback((v: Product[]) => { setPromotionalProductsState(v); saveSetting('promotionalProducts', v); }, []);
  const setPopularProducts = useCallback((v: Product[]) => { setPopularProductsState(v); saveSetting('popularProducts', v); }, []);
  const setRecommendedProducts = useCallback((v: Product[]) => { setRecommendedProductsState(v); saveSetting('recommendedProducts', v); }, []);
  const setFeaturedProduct = useCallback((v: Product | null) => { setFeaturedProductState(v); saveSetting('featuredProduct', v); }, []);
  const setLowStockThreshold = useCallback((v: number) => { setLowStockThresholdState(v); saveSetting('lowStockThreshold', v); }, []);
  const setStoreCategories = useCallback((v: StoreCategory[]) => { setStoreCategoriesState(v); saveSetting('storeCategories', v); }, []);
  const setNewArrivalsProducts = useCallback((v: Product[]) => { setNewArrivalsProductsState(v); saveSetting('newArrivalsProducts', v); }, []);
  const setNewArrivalsMaxProducts = useCallback((v: number) => { setNewArrivalsMaxProductsState(v); saveSetting('newArrivalsMaxProducts', v); }, []);
  const setAnnouncementBar = useCallback((v: AnnouncementBarSettings) => { setAnnouncementBarState(v); saveSetting('announcementBar', v); }, []);

  return (
    <AdminStoreContext.Provider
      value={{
        settingsLoading,
        storeName, setStoreName,
        storeLogo, setStoreLogo,
        storeTagline, setStoreTagline,
        navLinks, setNavLinks,
        userProfile, setUserProfile,
        heroContent, setHeroContent,
        footerContent, setFooterContent,
        promotionalProducts, setPromotionalProducts,
        popularProducts, setPopularProducts,
        recommendedProducts, setRecommendedProducts,
        featuredProduct, setFeaturedProduct,
        lowStockThreshold, setLowStockThreshold,
        storeCategories, setStoreCategories,
        newArrivalsProducts, setNewArrivalsProducts,
        newArrivalsMaxProducts, setNewArrivalsMaxProducts,
        announcementBar, setAnnouncementBar,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
};

export const useAdminStore = () => {
  const context = useContext(AdminStoreContext);
  if (!context) throw new Error('useAdminStore must be used within AdminStoreProvider');
  return context;
};

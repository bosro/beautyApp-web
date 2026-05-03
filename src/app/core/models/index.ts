// ========== User & Auth ==========
export type UserRole = 'CUSTOMER' | 'BEAUTICIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  emailVerified?: boolean;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  beautician?: BeauticianProfile;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ========== Beautician ==========
export interface BeauticianProfile {
  id: string;
  userId: string;
  businessName: string;
  businessCategory: string;
  businessAddress: string;
  city: string;
  region: string;
  bio: string;
  profileImage?: string;
  coverImage?: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  rating: number;
  totalReviews: number;
  totalBookings: number;
  verificationStatus: string;
  averageRating?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  _count?: {
    services: number;
    bookings: number;
    reviews: number;
  };
}

// ========== Service ==========
export interface BeautyService {
  id: string;
  beauticianId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  durationMinutes: number;
  image?: string;
  tags: string[];
  isActive: boolean;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
  beautician?: {
    id: string;
    businessName: string;
    rating: number;
    city?: string;
  };
}

// ========== Booking ==========
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  beauticianId: string;
  serviceId: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  commission: number;
  beauticianEarnings: number;
  note?: string;
  cancellationReason?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  beautician: {
    id: string;
    businessName: string;
    businessAddress?: string;
    userId: string;
    avatar?: string;
    user: {
      name: string;
      phone?: string;
    };
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
    category: string;
  };
  payment?: unknown;
  review?: Review;
}

// ========== Review ==========
export interface Review {
  id: string;
  customerId: string;
  beauticianId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  images: string[];
  isFlagged: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    name: string;
    avatar?: string;
  };
}

// ========== Category ==========
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  servicesCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ========== Notification ==========
export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ========== Promotion ==========
export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUses?: number;
  totalUsed: number;
  beauticianId?: string;
  serviceId?: string;
  createdAt: string;
  updatedAt: string;
  beautician?: {
    id: string;
    businessName: string;
    location?: string;
    avatar?: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    category: string;
  };
}

// ========== Referral ==========
export interface ReferralStats {
  totalReferrals: number;
  pendingRewards: number;
  totalEarned: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward: number;
  createdAt: string;
  updatedAt: string;
  referee?: {
    name: string;
    email: string;
  };
}

// ========== Schedule ==========
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
}

export interface DaySchedule {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  slotDuration: number;
  breakTimes: Array<{ startTime: string; endTime: string }>;
  slots: TimeSlot[];
}

// ========== API Response Wrappers ==========
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  meta: PaginatedMeta;
}

// ========== Dashboard ==========
export interface BeauticianDashboardStats {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  pendingPayouts: number;
  totalReviews: number;
  averageRating: number;
  rating: number;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit?: string;
  favoriteService?: string;
  averageRating: number;
  createdAt: string;
}

// ========== Toast ==========
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// ========== Theme ==========
export type ThemeMode = 'light' | 'dark' | 'system';

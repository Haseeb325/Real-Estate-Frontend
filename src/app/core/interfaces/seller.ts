import { User } from './User';

export interface SellerDocuments {
  CNIC_Front?: string;
  CNIC_Back?: string;
  PAN_Card?: string;
}

export interface sellerProfile {
  user: User;
  stripe_account_id?: string;
  phone: string;
  profile_image?: string;
  docs?: SellerDocuments;
  company_name?: string;
  city?: string;
  address?: string;
  state?: string;
  country?: string;
  is_verified_seller?: boolean;
  profileImage?: string; // UI property mapping
  fullLocation?: string; // UI property mapping
}

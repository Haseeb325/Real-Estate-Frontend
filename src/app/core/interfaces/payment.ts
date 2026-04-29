import { Property } from './property';
import { User } from './User';

export interface Payment {
  id: string;
  stripe_charge_id: string;
  amount: string;
  payment_type: 'sale' | 'rent' | 'security_deposit';
  status: 'succeeded' | 'pending' | 'failed';
  timestamp: string;
  buyer: string; // username
  seller: string; // username
  property: number;
  property_title: string;
}

export interface MonthlyRentPayment {
  id: string;
  due_date: string;
  amount: string;
  status: 'pending' | 'paid' | 'late' | 'waived';
  date_paid?: string;
}

export interface RentalAgreement {
  id: string;
  property: number;
  property_title: string;
  buyer: string;
  start_date: string;
  end_date: string;
  monthly_rent_amount: string;
  security_deposit_amount: string;
  status: 'active' | 'ended' | 'defaulted';
  created_at: string;
  monthly_payments: MonthlyRentPayment[];
}

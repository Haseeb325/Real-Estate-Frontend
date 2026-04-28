export interface Appointment {
  id: string;
  property: string;
  property_title: string;
  property_details: any;
  buyer_name: string;
  seller_name: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  available_actions: string[];
}

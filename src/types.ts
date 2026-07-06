// The blueprint for a Hustler profile
export interface Hustler {
  id: number;
  store_name: string;
  owner_name: string;
  whatsapp_number: string;
  city: string;
  category: string;
  created_at: string;
}

// The blueprint for an item being sold
export interface Listing {
  id: number;
  hustler_id: number; // Links to Hustler.id
  title: string;
  price: number;
  image_url: string | null;
  created_at: string;
}

// The blueprint for a WhatsApp click/lead
export interface Inquiry {
  id: number;
  listing_id: number; // Links to Listing.id
  user_phone: string | null;
  status: "pending" | "connected" | "abandoned";
  created_at: string;
}

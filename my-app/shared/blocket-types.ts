// Blocket API Types based on Pro Import API documentation

export interface BlocketAdRequest {
  source_id: string;
  dealer_code?: string;
  category_id: number;
  title: string;
  body: string;
  price: BlocketPrice[];
  image_urls?: string[];
  url?: string;
  url_title?: string;
  location?: BlocketLocation;
  contact: BlocketContact;
  category_fields?: Record<string, any>;
  dont_publish_on_failed_images?: boolean;
}

export interface BlocketPrice {
  amount: number;
  currency: string; // "SEK"
  type: "fixed" | "negotiable";
}

export interface BlocketLocation {
  region: string;
  municipality: string;
  address?: string;
  zip_code?: string;
}

export interface BlocketContact {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
}

export interface BlocketAdResponse {
  id: string;
  source_id: string;
  dealer_code: string;
  category_id: number;
  title: string;
  body: string;
  price: BlocketPrice[];
  image_urls: string[];
  contact: BlocketContact;
  state: "created" | "deleted";
  blocket_ad_id?: string;
  bytbil_ad_id?: string;
  created_at: string;
  updated_at: string;
  logs: BlocketLogMessage[];
}

export interface BlocketLogMessage {
  id: string;
  action: "create" | "update" | "bump" | "boost" | "handle_media" | "publish" | "delete" | "unpublish";
  state: "processing" | "done" | "error";
  message?: string;
  created_at: string;
}

// Blocket vehicle categories for cars
export const BLOCKET_VEHICLE_CATEGORIES = {
  CARS: 1020, // Fordon > Bilar
  TRANSPORT_VEHICLES: 1021, // Fordon > Transportbilar
  MOTORCYCLES: 1140, // Fordon > Motorcykel
  TRAILERS: 1045, // Fordon > Trailer
  CARAVANS: 1101, // Fordon > Husvagn
  MOTORHOMES: 1102, // Fordon > Husbil
  ATV: 1143, // Fordon > ATV
  SNOWMOBILES: 1180, // Fordon > Snöskoter
  BOATS_MOTOR: 1061, // Fordon > Båtar > Motorbåt
  BOATS_SAIL: 1062, // Fordon > Båtar > Segelbåt
  MOPEDS: 1121, // Fordon > Mopeder & A-traktor > Mopeder
  A_TRACTORS: 1122, // Fordon > Mopeder & A-traktor > A-Traktorer
  TRUCKS: 1221, // Fordon > Lastbil, truck & entreprenad > Lastbil & buss
} as const;

export type BlocketCategoryId = typeof BLOCKET_VEHICLE_CATEGORIES[keyof typeof BLOCKET_VEHICLE_CATEGORIES];
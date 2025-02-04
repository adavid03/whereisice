export type AddressSuggestion = {
  key: string;
  address: string;
  isCustom?: boolean;
};

export type GeocoderResult = {
  key: string;
  address: string;
  isCustom?: boolean;
};

export type ReportFormData = {
  agentCount: number;
  activities: string[];
  otherActivity?: string;
  location: string;
  clothing: string[];
  otherClothing?: string;
  time: string;
  equipment: string[];
  otherEquipment?: string;
  details?: string;
  latitude?: number;
  longitude?: number;
}

export type Report = {
  id: number;
  created_at: string;
  agent_count: number;
  activities: string[];
  other_activity?: string;
  location: string;
  clothing: string[];
  other_clothing?: string;
  time: string;
  equipment: string[];
  other_equipment?: string;
  details?: string;
  latitude?: number;
  longitude?: number;
  over_votes: string[];
}

export type GeocodingResult = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
}; 
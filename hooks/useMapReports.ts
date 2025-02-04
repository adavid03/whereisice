import { useState, useEffect } from 'react';
import { Report } from '@/types/reports';

export function useMapReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [mapBounds, setMapBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  // Move the reports fetching logic here
  const fetchReports = async () => {
    // ... existing fetchReports code
  };

  return {
    reports,
    setMapBounds,
    fetchReports,
  };
} 
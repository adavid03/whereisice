/* eslint-disable react/jsx-sort-props */
/* eslint-disable prettier/prettier */
"use client";

import type { Report } from "@/types/reports";

import React, { useState, useRef, useEffect } from "react";
import {
  Map,
  Marker,
  FeatureVisibility,
  MapInteractionEvent,
  ColorScheme,
  CoordinateRegion,
} from "mapkit-react";
import {
  useDisclosure
} from "@heroui/react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { PlusCircle } from "lucide-react";


import { ReportModal } from "@/components/ReportModal";
import { ReportDetails } from "@/components/ReportDetails";
import { ACTIVITY_COLORS, ACTIVITY_PRIORITY } from "@/constants/colors";

declare global {
  interface Window {
    mapkit: any;
    searchTimeout: ReturnType<typeof setTimeout>;
  }
}

type AddressSuggestion = {
  key: string;
  address: string;
  isCustom?: boolean;
};

type GeocoderResult = {
  key: string;
  address: string;
  isCustom?: boolean;
};

type ReportFormData = {
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

type GeocodingResult = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function Home() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [currentInput, setCurrentInput] = useState("");
  const mapRef = useRef<any>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [tempMarker, setTempMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { theme } = useTheme();
  const [agentCount, setAgentCount] = useState<number>(0);
  const [activities, setActivities] = useState<string[]>([]);
  const [otherActivity, setOtherActivity] = useState<string>("");
  const [clothing, setClothing] = useState<string[]>([]);
  const [otherClothing, setOtherClothing] = useState<string>("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [otherEquipment, setOtherEquipment] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  );
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [voterId, setVoterId] = useState<string>('');
  const [mapBounds, setMapBounds] = useState<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  if (!process.env.NEXT_PUBLIC_MAPKIT_TOKEN) {
    throw new Error("MapKit token is required");
  }

  const handleLocationClick = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      const timeoutId = setTimeout(() => {
        setIsLocating(false);
        alert("Location request timed out. Please try again.");
      }, 15000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          setIsLocating(false);
          const geocoder = new window.mapkit.Geocoder({
            language: "en",
          });

          geocoder.reverseLookup(
            new window.mapkit.Coordinate(
              position.coords.latitude,
              position.coords.longitude,
            ),
            (
              error: any,
              data: {
                results: { formattedAddress: React.SetStateAction<string> }[];
              },
            ) => {
              if (!error && data.results[0]) {
                setCurrentInput(String(data.results[0].formattedAddress));
              }
            },
          );
        },
        (error) => {
          clearTimeout(timeoutId);
          setIsLocating(false);
          if (error.code === 1) {
            alert(
              "Please enable location services.",
            );
          } else {
            alert("Could not get location. Please try again.");
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        },
      );
    } else {
      setIsLocating(false);
      alert("Location services are not supported by your browser");
    }
  };

  const handleAddressSearch = (value: string) => {
    setCurrentInput(value);

    if (value.length > 1) {
      const geocoder = new window.mapkit.Geocoder({
        language: "en-US",
        getsUserLocation: true,
      });

      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }

      window.searchTimeout = setTimeout(() => {
        geocoder.lookup(value, (error: any, data: { results: any[] }) => {
          if (!error && data.results) {
            const suggestions: GeocoderResult[] = data.results
              .slice(0, 5)
              .map((result: any, index: number) => ({
                key: `result-${index}`,
                address: result.formattedAddress,
                isCustom: false,
              }));

            suggestions.push({
              key: "custom",
              address: `Add: ${value}`,
              isCustom: true,
            });

            setAddressSuggestions(suggestions);
          }
        });
      }, 300);
    } else {
      setAddressSuggestions([]);
    }
  };

  const handleMapClick = (event: MapInteractionEvent) => {
    if (isSelectingLocation) {
      const coords = event.toCoordinates();

      setTempMarker({
        lat: coords.latitude,
        lng: coords.longitude,
      });
    }

    if (selectedReport) {
      handleCloseDetails();
    }
  };

  const handleConfirmLocation = () => {
    if (tempMarker) {
      const geocoder = new window.mapkit.Geocoder({
        language: "en-US",
      });

      geocoder.reverseLookup(
        new window.mapkit.Coordinate(tempMarker.lat, tempMarker.lng),
        (error: any, data: any) => {
          if (!error && data.results[0]) {
            setCurrentInput(data.results[0].formattedAddress);
            setTempMarker(null);
            setIsSelectingLocation(false);
            onOpen();
          }
        },
      );
    }
  };

  const resetForm = () => {
    setAgentCount(0);
    setActivities([]);
    setOtherActivity("");
    setClothing([]);
    setOtherClothing("");
    setEquipment([]);
    setOtherEquipment("");
    setDetails("");
    setTime(new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }));
    setCurrentInput("");
    setTempMarker(null);
    setIsSelectingLocation(false);
  };

  const handleReport = async () => {
    setSubmitLoading(true);

    // Get coordinates from the location string
    const geocoder = new window.mapkit.Geocoder({ language: "en-US" });

    try {
      const geocodeResult = await new Promise<GeocodingResult>((resolve, reject) => {
        geocoder.lookup(currentInput, (error: any, data: any) => {
          if (error) reject(error);
          if (data && data.results[0]) resolve(data.results[0]);
          else reject(new Error('Location not found'));
        });
      });

      const formData: ReportFormData = {
        agentCount,
        activities,
        ...(activities.includes("5") && { otherActivity }),
        location: currentInput,
        clothing,
        ...(clothing.includes("9") && { otherClothing }),
        time,
        equipment,
        ...(equipment.includes("15") && { otherEquipment }),
        ...(details && { details }),
        latitude: geocodeResult.coordinate.latitude,
        longitude: geocodeResult.coordinate.longitude
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      resetForm();
      onOpenChange();
      setSubmitLoading(false);
      fetchReports();
    } catch (error) {
      setSubmitLoading(false);
      throw new Error('Failed to submit report', { cause: error });
    }
  };


  const getMarkerColor = (activities: string[]) => {
    for (const priority of ACTIVITY_PRIORITY) {
      if (activities.includes(priority)) {
        return ACTIVITY_COLORS[priority as keyof typeof ACTIVITY_COLORS];
      }
    }

    return ACTIVITY_COLORS['5'];
  };

  const fetchReports = async () => {
    try {
      if (!mapBounds) return;

      const params = new URLSearchParams({
        minLat: mapBounds.minLat.toString(),
        maxLat: mapBounds.maxLat.toString(),
        minLng: mapBounds.minLng.toString(),
        maxLng: mapBounds.maxLng.toString(),
      });

      const response = await fetch(`/api/reports?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      if (json.error) {
        throw new Error(json.error);

        return;
      }

      if (json.data) {
        setReports(json.data);
      }
    } catch (error) {
      throw new Error('Failed to fetch reports', { cause: error });
    }
  };


  const handleMapRegionChange = (region: CoordinateRegion) => {
    if (!region) return;

    setMapBounds({
      minLat: region.centerLatitude - region.latitudeDelta / 2,
      maxLat: region.centerLatitude + region.latitudeDelta / 2,
      minLng: region.centerLongitude - region.longitudeDelta / 2,
      maxLng: region.centerLongitude + region.longitudeDelta / 2,
    });
  };

  const handleMapLoad = (map: any) => {
    setTimeout(() => {
      if (map && map.region) {
        const region = map.region();

        setMapBounds({
          minLat: region.centerLatitude - region.latitudeDelta / 2,
          maxLat: region.centerLatitude + region.latitudeDelta / 2,
          minLng: region.centerLongitude - region.longitudeDelta / 2,
          maxLng: region.centerLongitude + region.longitudeDelta / 2,
        });
      }
    }, 0);
  };

  const debouncedFetchReports = debounce(fetchReports, 300);

  useEffect(() => {
    if (mapBounds) {
      debouncedFetchReports();
    }
  }, [mapBounds]);

  useEffect(() => {
    const storedId = localStorage.getItem('voterId') || crypto.randomUUID();

    setVoterId(storedId);
    localStorage.setItem('voterId', storedId);
  }, []);

  const handleMarkerSelect = (report: Report) => {
    setSelectedReport(report);
    setSelectedMarkerId(report.id);
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
    setSelectedMarkerId(null);
  };

  const handleVoteOver = async (reportId: number) => {
    try {
      const response = await fetch('/api/reports/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId, voterId })
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || 'Failed to vote');
      }

      const data = await response.json();

      // Store the vote in localStorage
      const votedReports = JSON.parse(localStorage.getItem('votedReports') || '[]');

      if (!votedReports.includes(reportId)) {
        votedReports.push(reportId);
        localStorage.setItem('votedReports', JSON.stringify(votedReports));
      }

      if (data.data) {
        const updatedReports = reports.map(report =>
          report.id === reportId ? { ...report, ...data.data } : report
        );

        setReports(updatedReports);

        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport({ ...selectedReport, ...data.data });
        }
      }
    } catch (error) {
      throw new Error('Failed to vote', { cause: error });
    }
  };


  return (
    <div className="h-full w-full relative">
      <Map
        ref={mapRef}
        allowWheelToZoom={true}
        colorScheme={theme === "dark" ? ColorScheme.Dark : ColorScheme.Light}
        showsCompass={FeatureVisibility.Hidden}
        showsScale={FeatureVisibility.Adaptive}
        showsUserLocation={true}
        showsUserLocationControl={false}
        showsMapTypeControl={false}
        showsZoomControl={false}
        token={process.env.NEXT_PUBLIC_MAPKIT_TOKEN}
        tracksUserLocation={true}
        onClick={handleMapClick}
        onLoad={function (this: any) { handleMapLoad(this); }}
        onRegionChangeEnd={handleMapRegionChange}
      >
        {tempMarker && (
          <Marker latitude={tempMarker.lat} longitude={tempMarker.lng} />
        )}
        {reports.map((report) =>
          report.latitude && report.longitude ? (
            <Marker
              key={report.id}
              color={getMarkerColor(report.activities)}
              latitude={report.latitude}
              longitude={report.longitude}
              selected={selectedMarkerId === report.id}
              onSelect={() => handleMarkerSelect(report)}
            />
          ) : null
        )}
      </Map>

      {isSelectingLocation && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
          <Button
            color="danger"
            disabled={!tempMarker}
            onPress={handleConfirmLocation}
          >
            Use This Location
          </Button>
        </div>
      )}

      <Button
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20"
        color="danger"
        size="lg"
        startContent={<PlusCircle />}
        onPress={onOpen}
      >
        Report Activity
      </Button>

      <ReportModal
        activities={activities}
        addressSuggestions={addressSuggestions}
        agentCount={agentCount}
        clothing={clothing}
        currentInput={currentInput}
        details={details}
        equipment={equipment}
        handleAddressSearch={handleAddressSearch}
        handleLocationClick={handleLocationClick}
        isLocating={isLocating}
        isOpen={isOpen}
        otherActivity={otherActivity}
        otherClothing={otherClothing}
        otherEquipment={otherEquipment}
        setActivities={setActivities}
        setAgentCount={setAgentCount}
        setClothing={setClothing}
        setDetails={setDetails}
        setEquipment={setEquipment}
        setIsSelectingLocation={setIsSelectingLocation}
        setOtherActivity={setOtherActivity}
        setOtherClothing={setOtherClothing}
        setOtherEquipment={setOtherEquipment}
        setTime={setTime}
        submitLoading={submitLoading}
        time={time}
        onClose={() => {
          resetForm();
          onOpenChange();
        }}
        onLocationChange={handleAddressSearch}
        onOpenChange={onOpenChange}
        onSubmit={handleReport}
        setCurrentInput={setCurrentInput}
      />
      {selectedReport && (
        <ReportDetails
          report={selectedReport}
          voterId={voterId}
          onClose={handleCloseDetails}
          onVote={handleVoteOver}
        />
      )}
    </div>
  );
}

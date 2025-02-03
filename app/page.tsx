"use client";

import React, { useState, useRef } from "react";
import {
  Map,
  Marker,
  FeatureVisibility,
  MapInteractionEvent,
  ColorScheme,
} from "mapkit-react";
import { Button } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { LocateFixed, PlusIcon } from "lucide-react";
import { Input, Autocomplete, AutocompleteItem } from "@heroui/react";
import { Checkbox, CheckboxGroup } from "@heroui/react";
import { useTheme } from "next-themes";

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

export default function Home() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [onSelected, setOnSelected] = useState<string[]>([]);
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
              position.coords.longitude
            ),
            (
              error: any,
              data: {
                results: { formattedAddress: React.SetStateAction<string> }[];
              }
            ) => {
              if (!error && data.results[0]) {
                setCurrentInput(String(data.results[0].formattedAddress));
              }
            }
          );
        },
        (error) => {
          clearTimeout(timeoutId);
          setIsLocating(false);
          if (error.code === 1) {
            // Permission denied
            alert(
              "Please enable location services in your device settings:\nSettings > Safari > Location Services"
            );
          } else {
            alert("Could not get location. Please try again.");
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        }
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

      // Clear any existing timeout
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
      // Set new timeout
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
      setAddressSuggestions([]); // Clear suggestions if input is too short
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
        }
      );
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
        showsUserLocationControl={true}
        showsZoomControl={false}
        token={process.env.NEXT_PUBLIC_MAPKIT_TOKEN}
        tracksUserLocation={true}
        onClick={handleMapClick}
      >
        {tempMarker && (
          <Marker latitude={tempMarker.lat} longitude={tempMarker.lng} />
        )}
      </Map>
      <Button
        className="absolute bottom-5 right-5 z-20"
        color="danger"
        size="lg"
        startContent={<PlusIcon size={16} />}
        variant="shadow"
        onPress={onOpen}
      >
        Report Sighting
      </Button>
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="sm:max-w-[95vw] md:max-w-[600px]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg">Report a Sighting</h2>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <h6 className="text-xs text-default-500 font-extralight">
                  You can leave any field blank if you don&apos;t have
                  information.
                </h6>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="text-sm whitespace-nowrap">How many agents?</p>
                  <Input
                    className="flex-1"
                    inputMode="numeric"
                    min={1}
                    pattern="[0-9]*"
                    placeholder="Enter a number"
                    size="lg"
                    type="number"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm">What are they doing?</p>
                  <div className="flex-1">
                    <CheckboxGroup
                      className="flex flex-col gap-1"
                      value={onSelected}
                      onValueChange={setOnSelected}
                    >
                      <Checkbox color="danger" value="1">
                        Arrests
                      </Checkbox>
                      <Checkbox color="danger" value="2">
                        Patrols
                      </Checkbox>
                      <Checkbox color="danger" value="3">
                        Questioning
                      </Checkbox>
                      <Checkbox color="danger" value="4">
                        ID Checks
                      </Checkbox>
                      <Checkbox color="danger" value="5">
                        Other
                      </Checkbox>
                    </CheckboxGroup>
                    {onSelected.includes("5") && (
                      <Input
                        className="w-full mt-2"
                        placeholder="Specify other activity"
                        size="lg"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm">Location</p>
                  <div className="flex gap-2 sm:flex-row flex-col">
                    <Autocomplete
                      aria-label="Location search"
                      className="flex-1"
                      defaultItems={addressSuggestions}
                      inputValue={currentInput}
                      placeholder="Enter a location"
                      size="lg"
                      onInputChange={handleAddressSearch}
                      onSelectionChange={(key) => {
                        const selected = addressSuggestions.find(
                          (item) => item.key === key
                        );

                        if (selected) {
                          // If it's a custom entry, use the input value directly
                          const finalAddress = selected.isCustom
                            ? currentInput
                            : selected.address;

                          setCurrentInput(finalAddress);
                        }
                      }}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.key}>
                          {item.address}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        color="danger"
                        isLoading={isLocating}
                        size="lg"
                        startContent={!isLocating && <LocateFixed size={16} />}
                        onPress={handleLocationClick}
                      />
                      <Button
                        color="danger"
                        size="lg"
                        onPress={() => {
                          setIsSelectingLocation(true);
                          onOpenChange();
                        }}
                      >
                        Pick on Map
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm">What are they wearing?</p>
                  <div className="flex-1">
                    <CheckboxGroup
                      className="flex flex-col gap-1"
                      value={onSelected}
                      onValueChange={setOnSelected}
                    >
                      <Checkbox color="danger" value="6">
                        Uniform
                      </Checkbox>
                      <Checkbox color="danger" value="7">
                        Plain Clothes
                      </Checkbox>
                      <Checkbox color="danger" value="8">
                        Undercover
                      </Checkbox>
                      <Checkbox color="danger" value="9">
                        Other
                      </Checkbox>
                    </CheckboxGroup>
                    {onSelected.includes("9") && (
                      <Input
                        className="w-full mt-2"
                        placeholder="Specify other clothing"
                        size="lg"
                      />
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={onClose}>
                  Report
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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
    </div>
  );
}

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { useState, useEffect, useRef, FC, memo } from "react";
import { MapInputProps } from "@/types";

const containerStyle = {
  width: "100%",
  height: "400px",
  maxWidth: "100%",
  maxHeight: "100%",
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const MapInput: FC<MapInputProps> = ({ value, onChange }) => {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <MapContent value={value} onChange={onChange} />
    </APIProvider>
  );
};

interface MapContentProps {
  value: MapInputProps["value"];
  onChange: MapInputProps["onChange"];
}

const MapContent: FC<MapContentProps> = ({ value, onChange }) => {
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [placeDetails, setPlaceDetails] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [isMarkerHovered, setIsMarkerHovered] = useState(false);

  const [markerRef, marker] = useAdvancedMarkerRef();
  const map = useMap();
  const places = useMapsLibrary("places");
  const core = useMapsLibrary("core");
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  // Initialize PlacesService when map and places library are ready
  useEffect(() => {
    if (!places || !map) return;

    const service = new places.PlacesService(map);
    setPlacesService(service);
  }, [places, map]);

  // Set initial marker position from value.coordinates when core library is loaded
  useEffect(() => {
    if (!core || !value?.coordinates) return;

    const [lat, lng] = value.coordinates.split(",").map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      setSelectedPlace({
        geometry: {
          location: new core.LatLng(lat, lng),
        },
        formatted_address: value.location,
        name: value.location,
      } as google.maps.places.PlaceResult);
    }
  }, [core, value]);

  // Fetch full place details when a place is selected
  useEffect(() => {
    if (!placesService || !selectedPlace?.place_id) return;

    const request = {
      placeId: selectedPlace.place_id,
      fields: ["name", "formatted_address", "geometry", "place_id"],
    };

    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        setPlaceDetails(place);

        const location = place.geometry?.location;
        if (location) {
          const lat = location.lat();
          const lng = location.lng();
          const address = place.formatted_address || "";
          const placeId = place.place_id || "";

          if (marker) {
            marker.position = { lat, lng };
          }
          if (map) {
            map.panTo({ lat, lng });
          }

          onChange({
            location: `${address}, || ${placeId}`,
            coordinates: `${lat},${lng}`,
          });
        }
      }
    });
  }, [placesService, selectedPlace, map, marker, onChange]);

  return (
    <div className="relative">
      {/* Location Search Input */}
      <div className="mb-4">
        <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
      </div>

      {/* Google Map */}
      <div className="map-container">
        <Map
          mapId="a16cb905c97a2f28"
          style={containerStyle}
          defaultCenter={defaultCenter}
          defaultZoom={10}
          gestureHandling="greedy"
        >
          <AdvancedMarker
            ref={markerRef}
            position={null}
            clickable={true}
            onMouseEnter={() => setIsMarkerHovered(true)}
            onMouseLeave={() => setIsMarkerHovered(false)}
          >
            <Pin
              background={"#EA4335"}
              glyphColor={"#FFF"}
              borderColor={"#EA4335"}
            />
          </AdvancedMarker>
        </Map>
      </div>

      {/* Custom Event location name overlay */}
      <div
        className={`bg-primary text-neutral-white py-1 px-2 rounded-sm shadow-lg text-[12px] transition-opacity ${
          isMarkerHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          minWidth: "max-content",
          zIndex: 10,
        }}
      >
        {placeDetails?.name}
      </div>
    </div>
  );
};

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

const PlaceAutocomplete = ({ onPlaceSelect }: PlaceAutocompleteProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  // Initialize Autocomplete
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current);
    setPlaceAutocomplete(autocomplete);
  }, [places]);

  // Handle place selection
  useEffect(() => {
    if (!placeAutocomplete) return;

    const listener = placeAutocomplete.addListener("place_changed", () => {
      const place = placeAutocomplete.getPlace();
      if (place.formatted_address) {
        setInputValue(place.formatted_address);
      }
      onPlaceSelect(place);
    });

    return () => listener.remove();
  }, [placeAutocomplete, onPlaceSelect]);

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a location"
        className="input-field p-regular-14"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
};

export default memo(MapInput);

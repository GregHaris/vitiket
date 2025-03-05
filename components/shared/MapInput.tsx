import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import { useState, useEffect, useRef, FC, memo } from 'react';

import { MapInputProps } from '@/types';

const containerStyle = {
  width: '100%',
  height: '400px',
  maxWidth: '100%',
  maxHeight: '100%',
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
  value: MapInputProps['value'];
  onChange: MapInputProps['onChange'];
}

const MapContent: FC<MapContentProps> = ({ value, onChange }) => {
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const map = useMap();

  // Parse the initial value (if provided) to set the marker position
  useEffect(() => {
    if (value?.coordinates) {
      const [lat, lng] = value.coordinates.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedPlace({
          geometry: {
            location: new google.maps.LatLng(lat, lng),
          },
          formatted_address: value.location,
          name: value.location,
        } as google.maps.places.PlaceResult);
      }
    }
  }, [value]);

  // Handle place selection and update marker position
  useEffect(() => {
    if (!map || !selectedPlace || !marker) return;

    const location = selectedPlace.geometry?.location;
    if (location) {
      const lat = location.lat();
      const lng = location.lng();
      const address = selectedPlace?.formatted_address || '';

      marker.position = { lat, lng };
      map.panTo({ lat, lng });
      map.setZoom(15);

      onChange({ location: address, coordinates: `${lat},${lng}` });
    }
  }, [map, selectedPlace, marker, onChange]);

  return (
    <div>
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
            title={selectedPlace?.name || ''}
          >
            <Pin
              background={'#EA4335'}
              glyphColor={'#FFF'}
              borderColor={'#EA4335'}
            />
          </AdvancedMarker>
        </Map>
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
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  // Initialize Autocomplete
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current);
    setPlaceAutocomplete(autocomplete);
  }, [places]);

  // Handle place selection
  useEffect(() => {
    if (!placeAutocomplete) return;

    const listener = placeAutocomplete.addListener('place_changed', () => {
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

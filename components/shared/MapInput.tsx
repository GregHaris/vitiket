import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
  Libraries,
} from '@react-google-maps/api';
import React, { useCallback, useState, useRef, useEffect } from 'react';

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

const libraries: Libraries = ['places'];

const MapInput: React.FC<MapInputProps> = ({ value, onChange }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Parse the initial value (if provided) to set the marker position
  useEffect(() => {
    if (value?.coordinates) {
      const [lat, lng] = value.coordinates.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMarkerPosition({ lat, lng });
      }
    }
  }, [value]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      onChange({ location: '', coordinates: `${lat},${lng}` });
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const location = place.formatted_address || '';
        setMarkerPosition({ lat, lng });
        onChange({ location, coordinates: `${lat},${lng}` });
        map?.panTo({ lat, lng });
        map?.setZoom(15);
      }
    }
  };

  const onAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    autocompleteRef.current = autocomplete;
  };

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <div>
      {/* Location Search Input */}
      <div className="mb-4">
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Enter a location"
            className="input-field p-regular-14"
          />
        </Autocomplete>
      </div>

      {/* Google Map */}
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markerPosition}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            gestureHandling: 'greedy',
          }}
        >
          <Marker position={markerPosition} />
        </GoogleMap>
      </div>
    </div>
  );
};

export default React.memo(MapInput);

'use client';

import { FC, memo, useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  Map,
  Pin,
  useMap,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';

import { EventMapProps } from '@/types';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const EventMap: FC<EventMapProps> = ({ coordinates, destinationInfo }) => {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <EventMapContent
        coordinates={coordinates}
        destinationInfo={destinationInfo}
      />
    </APIProvider>
  );
};

interface MapContentProps {
  destinationInfo: EventMapProps['destinationInfo'];
  coordinates: EventMapProps['coordinates'];
}

const EventMapContent: FC<MapContentProps> = ({
  coordinates,
  destinationInfo,
}) => {
  const [lat, lng] = coordinates.split(',').map(Number);
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);
  const [address, locationMapId] = destinationInfo.split(', ||');

  const [markerRef, marker] = useAdvancedMarkerRef();

  const map = useMap();
  
  const places = useMapsLibrary('places');

  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [placeDetails, setPlaceDetails] =
    useState<google.maps.places.PlaceResult | null>(null);

  // Initialize PlacesService when the Places library and map are available
  useEffect(() => {
    if (!places || !map) return;

    const service = new places.PlacesService(map);
    setPlacesService(service);
  }, [places, map]);

  // Fetch place details when PlacesService and locationMapId are available
  useEffect(() => {
    if (!placesService || !locationMapId?.trim()) return;

    const request = {
      placeId: locationMapId.trim(),
      fields: ['name', 'formatted_address', 'geometry', 'place_id'],
    };

    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        setPlaceDetails(place);

        if (marker) {
          marker.position = { lat, lng };
        }

        if (map) {
          map.panTo({ lat, lng });
        }
      }
    });
  }, [placesService, map, marker, locationMapId]);

  return (
    <div className="relative">
      {/* Google Map */}
      <Map
        mapId="a16cb905c97a2f28"
        style={containerStyle}
        defaultCenter={center}
        defaultZoom={14}
      >
        {/* Advanced Marker */}
        <AdvancedMarker
          ref={markerRef}
          position={center}
          clickable={true}
          title={placeDetails?.name || address}
        >
          <Pin
            background={'#EA4335'}
            glyphColor={'#FFF'}
            borderColor={'#EA4335'}
          />
        </AdvancedMarker>
      </Map>
    </div>
  );
};

export default memo(EventMap);

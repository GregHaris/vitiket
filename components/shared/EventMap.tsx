'use client';

import {
  APIProvider,
  AdvancedMarker,
  Map,
  Pin,
  useMap,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { FC, memo, useEffect, useMemo, useState } from 'react';

import { EventMapProps } from '@/types';
import CustomTooltip from './ToolTip';
import Image from 'next/image';

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

  const [isMarkerHovered, setIsMarkerHovered] = useState(false);

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

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="relative">
      {/* Custom Event Location Info Window */}
      {placeDetails && (
        <div className="absolute flex gap-3 flex-wrap top-2.5 right-18 bg-white p-4 rounded-sm shadow-lg z-10 whitespace-pre-wrap">
          <div>
            <h3 className="font-bold text-sm mb-2">{placeDetails?.name}</h3>
            <p className="text-[12px] w-40 whitespace-pre-wrap">{address}</p>
          </div>
          <div>
            <CustomTooltip content="Click for Google Map direction to the event center">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-start items-center text[12px] text-blue-400 hover:underline"
              >
                <Image
                  src={'/assets/icons/directions.svg'}
                  alt="directions-icon"
                  width={24}
                  height={24}
                />
                Directions
              </a>
            </CustomTooltip>
          </div>
        </div>
      )}

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
          onMouseEnter={() => setIsMarkerHovered(true)}
          onMouseLeave={() => setIsMarkerHovered(false)}
        >
          <Pin
            background={'#EA4335'}
            glyphColor={'#FFF'}
            borderColor={'#EA4335'}
          />
        </AdvancedMarker>
      </Map>

      {/* Custom Event location name overlay to replace the AdvancedMarker title */}
      <div
        className={`bg-primary text-white py-2 px-4 rounded-sm shadow-lg text-sm transition-opacity ${
          isMarkerHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          minWidth: 'max-content',
          zIndex: 10,
        }}
      >
        {placeDetails?.name}
      </div>
    </div>
  );
};

export default memo(EventMap);

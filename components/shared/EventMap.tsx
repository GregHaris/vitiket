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

const EventMap: FC<EventMapProps> = memo(({ coordinates, destinationInfo }) => {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <EventMapContent
        coordinates={coordinates}
        destinationInfo={destinationInfo}
      />
    </APIProvider>
  );
});

interface MapContentProps {
  destinationInfo: EventMapProps['destinationInfo'];
  coordinates: EventMapProps['coordinates'];
}

const EventMapContent: FC<MapContentProps> = memo(
  ({ coordinates, destinationInfo }) => {
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

    useEffect(() => {
      if (!places || !map) return;

      const service = new places.PlacesService(map);
      setPlacesService(service);
    }, [places, map]);

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
    }, [placesService, map, marker, locationMapId, lat, lng]);

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return (
      <div className="relative">
        {placeDetails && (
          <div className="absolute flex flex-col gap-3 flex-wrap bottom-8 left-2.5 bg-white p-4 rounded-sm shadow-lg z-10 whitespace-pre-wrap">
            <div>
              <h3 className="font-bold text-sm mb-2">{placeDetails?.name}</h3>
              <p className="text-[12px] w-40">{address}</p>
            </div>
            <div>
              <CustomTooltip content="Click for Google Map direction to the event center">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col justify-start items-center text-sm text-blue-400 hover:underline"
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

        <Map
          mapId="a16cb905c97a2f28"
          style={containerStyle}
          defaultCenter={center}
          defaultZoom={14}
        >
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

        <div
          className={`bg-primary text-white py-1 px-2 rounded-sm shadow-lg text-[12px] transition-opacity ${
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.coordinates === nextProps.coordinates &&
      prevProps.destinationInfo === nextProps.destinationInfo
    );
  }
);

EventMap.displayName = 'EventMap';
EventMapContent.displayName = 'EventMapContent';

export default EventMap;

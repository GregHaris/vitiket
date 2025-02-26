'use client';

import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  OverlayView,
  Libraries,
} from '@react-google-maps/api';
import { Plus, Minus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

import { EventMapProps } from '@/types';
import CustomTooltip from '@shared/ToolTip';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const libraries: Libraries = ['places'];

export default function EventMap({
  coordinates,
  destinationName,
}: EventMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [placeDetails, setPlaceDetails] = useState<{
    name: string;
    formattedAddress: string;
  } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isMarkerHovered, setIsMarkerHovered] = useState(false);

  const [lat, lng] = coordinates.split(',').map(Number);
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  useEffect(() => {
    if (!isLoaded) return;

    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      location: center,
      radius: 50,
      query: destinationName,
    };

    service.textSearch(request, (results, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results[0]
      ) {
        const place = results[0];
        setPlaceDetails({
          name: place.name || destinationName,
          formattedAddress: place.formatted_address || 'Address not available',
        });
      }
    });
  }, [isLoaded, center, destinationName]);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom) {
        map.setZoom(currentZoom + 1);
      }
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom) {
        map.setZoom(currentZoom - 1);
      }
    }
  };

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <div className="relative">
      {placeDetails && (
        <div className="absolute flex flex-wrap top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
          <div>
            <h3 className="font-bold mb-2">{placeDetails.name}</h3>
            <p className="text-sm w-40">{placeDetails.formattedAddress}</p>
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

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={(map) => setMap(map)}
      >
        {/* Marker with custom hover tooltip */}
        <Marker
          position={center}
          onMouseOver={() => setIsMarkerHovered(true)}
          onMouseOut={() => setIsMarkerHovered(false)}
        />

        {/* Custom Tooltip for Marker using OverlayView */}
        <OverlayView
          position={center}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div
            className={` bg-primary text-white px-5 p-2 rounded-lg shadow-lg text-sm transition-opacity ${
              isMarkerHovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              minWidth: 'max-content',
            }}
          >
            {placeDetails?.name}
          </div>
        </OverlayView>
      </GoogleMap>

      {/* Zoom Buttons */}
      <div className="absolute bottom-6 left-4 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
        >
          <Plus />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
        >
          <Minus />
        </button>
      </div>
    </div>
  );
}

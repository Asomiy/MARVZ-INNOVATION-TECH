import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { LocationConfig } from '../types/admin';

interface OfficeLocationMapProps {
  location: LocationConfig;
  heightClass?: string;
}

interface ResolvedCoords {
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface InnerMapSceneProps {
  location: LocationConfig;
  initialCoords: ResolvedCoords | null;
}

const InnerMapScene: React.FC<InnerMapSceneProps> = ({ location, initialCoords }) => {
  const geocodingLib = useMapsLibrary('geocoding');
  const [coords, setCoords] = useState<ResolvedCoords | null>(initialCoords);
  const [resolving, setResolving] = useState<boolean>(!initialCoords);
  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    if (initialCoords) {
      setCoords(initialCoords);
      setResolving(false);
      return;
    }

    if (!geocodingLib) return;

    let cancelled = false;
    setResolving(true);
    const geocoder = new geocodingLib.Geocoder();
    const query = location.mapSearchQuery || location.officeAddress;

    interface GeocoderResultShape {
      results?: Array<{
        formatted_address?: string;
        geometry?: { location?: { lat: () => number; lng: () => number } };
      }>;
    }

    geocoder
      .geocode({ address: query, region: 'BD' })
      .then((response: GeocoderResultShape) => {
        if (cancelled) return;
        const first = response?.results?.[0];
        if (first?.geometry?.location) {
          setCoords({
            lat: first.geometry.location.lat(),
            lng: first.geometry.location.lng(),
            formattedAddress: first.formatted_address || location.officeAddress,
          });
        } else {
          return geocoder
            .geocode({ address: 'West Shewrapara, Dhaka 1216, Bangladesh', region: 'BD' })
            .then((fallbackRes: GeocoderResultShape) => {
              if (cancelled) return;
              const fb = fallbackRes?.results?.[0];
              if (fb?.geometry?.location) {
                setCoords({
                  lat: fb.geometry.location.lat(),
                  lng: fb.geometry.location.lng(),
                  formattedAddress: location.officeAddress,
                });
              }
            });
        }
      })
      .catch((err: unknown) => {
        console.warn('Google Maps client geocoder lookup notice:', err);
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [geocodingLib, initialCoords, location.mapSearchQuery, location.officeAddress]);

  if (resolving || !coords) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F3F4F6] text-[#202124] gap-2 p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#30343B]" />
        <p className="text-xs font-mono text-[#777777]">
          Locating {location.officeName} via Google Maps Geocoder...
        </p>
      </div>
    );
  }

  return (
    <GoogleMap
      defaultCenter={{ lat: coords.lat, lng: coords.lng }}
      center={{ lat: coords.lat, lng: coords.lng }}
      defaultZoom={16}
      mapId="DEMO_MAP_ID"
      internalUsageAttributionIds={['gmp_git_agentskills_v1']}
      gestureHandling="cooperative"
      streetViewControl={true}
      mapTypeControl={false}
      fullscreenControl={true}
      className="w-full h-full"
    >
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: coords.lat, lng: coords.lng }}
        title={location.officeName}
        onClick={() => setInfoOpen((prev) => !prev)}
      >
        <Pin background="#30343B" borderColor="#202124" glyphColor="#FFFFFF" scale={1.25} />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow anchor={marker} maxWidth={270} onCloseClick={() => setInfoOpen(false)}>
          <div className="p-1 text-[#202124] space-y-1.5 font-sans">
            <div className="font-bold text-xs text-[#202124]">{location.officeName}</div>
            <p className="text-[11px] text-[#777777] leading-snug">{location.officeAddress}</p>
            <div className="pt-1 flex items-center gap-2">
              <a
                href={location.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#30343B] hover:bg-[#202124] text-white text-[11px] font-semibold no-underline"
              >
                <Navigation className="w-3 h-3" />
                <span>Directions</span>
              </a>
              <a
                href={location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30343B] hover:underline"
              >
                <span>View Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export const OfficeLocationMap: React.FC<OfficeLocationMapProps> = ({
  location,
  heightClass = 'h-[360px] sm:h-[420px]',
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [serverCoords, setServerCoords] = useState<ResolvedCoords | null>(
    typeof location.customLat === 'number' && typeof location.customLng === 'number'
      ? {
          lat: location.customLat,
          lng: location.customLng,
          formattedAddress: location.officeAddress,
        }
      : null
  );
  const [quotaBlocked, setQuotaBlocked] = useState(false);

  useEffect(() => {
    const onQuota = () => setQuotaBlocked(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  useEffect(() => {
    if (typeof location.customLat === 'number' && typeof location.customLng === 'number') {
      setServerCoords({
        lat: location.customLat,
        lng: location.customLng,
        formattedAddress: location.officeAddress,
      });
      return;
    }

    let cancelled = false;
    fetch(`/api/public/geocode-office?address=${encodeURIComponent(location.mapSearchQuery || location.officeAddress)}`)
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        return res.ok && contentType.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (!cancelled && data && typeof data.lat === 'number' && typeof data.lng === 'number') {
          setServerCoords({
            lat: data.lat,
            lng: data.lng,
            formattedAddress: data.formattedAddress || location.officeAddress,
          });
        }
      })
      .catch(() => {
        // Fallback smoothly to client Google Maps JS Geocoder
      });

    return () => {
      cancelled = true;
    };
  }, [location.customLat, location.customLng, location.mapSearchQuery, location.officeAddress]);

  if (!apiKey || quotaBlocked) {
    return (
      <div
        className={`w-full ${heightClass} rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] p-6 flex flex-col items-center justify-center text-center gap-4`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#30343B] shadow-xs">
          <MapPin className="w-6 h-6" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h4 className="text-base font-bold text-[#202124]">{location.officeName}</h4>
          <p className="text-xs text-[#777777] leading-relaxed">{location.officeAddress}</p>
          <p className="text-[11px] font-mono text-[#30343B] font-medium">{location.landmarkNote}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={location.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Get Directions</span>
          </a>
          <a
            href={location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#E5E7EB]/60 text-[#202124] text-xs font-semibold border border-[#E5E7EB] transition-colors"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm bg-[#F3F4F6]`}>
      <APIProvider apiKey={apiKey} libraries={['marker', 'geocoding']} language="en" region="BD">
        <InnerMapScene location={location} initialCoords={serverCoords} />
      </APIProvider>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Navigation,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import { LocationConfig } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';
import { OfficeLocationMap } from '../OfficeLocationMap';

interface LocationManagementViewProps {
  onLocationUpdated?: () => void;
}

export const LocationManagementView: React.FC<LocationManagementViewProps> = ({
  onLocationUpdated,
}) => {
  const [location, setLocation] = useState<LocationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      try {
        const res = await adminFetch('/api/admin/location');
        if (res.ok) {
          const data = await res.json();
          setLocation(data.location);
        }
      } catch (err) {
        console.error('Failed to load office location config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || saving) return;

    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/location', {
        method: 'PUT',
        body: JSON.stringify(location),
      });
      if (res.ok) {
        const data = await res.json();
        setLocation(data.location);
        setNotice(
          'Office location, contact desk details, Google Maps links & Chatbot knowledge updated!'
        );
        setTimeout(() => setNotice(null), 4500);
        if (onLocationUpdated) onLocationUpdated();
      }
    } catch (err) {
      console.error('Failed to update office location:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !location) {
    return (
      <div className="py-16 text-center text-xs text-[#777777] font-mono">
        Loading Office Location Configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#30343B]" />
            Office Location & Google Maps Pin Governance
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Update the official Dhaka office address, metro landmark notes, contact desk, and Google Maps pin links across Footer, Contact section, and AI Chatbot.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold disabled:opacity-50 self-start sm:self-auto transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Location & Contact'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left Form (6 cols) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-6 p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4"
        >
          <h3 className="text-sm font-bold text-[#202124]">Official Headquarters Details</h3>

          <div>
            <label className="block font-semibold text-[#202124] uppercase mb-1">Office Title</label>
            <input
              type="text"
              value={location.officeName}
              onChange={(e) => setLocation({ ...location, officeName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#202124] uppercase mb-1">Full Office Address *</label>
            <textarea
              rows={2}
              required
              value={location.officeAddress}
              onChange={(e) => setLocation({ ...location, officeAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Landmark Note</label>
              <input
                type="text"
                value={location.landmarkNote}
                onChange={(e) => setLocation({ ...location, landmarkNote: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">City & Country</label>
              <input
                type="text"
                value={location.cityCountry}
                onChange={(e) => setLocation({ ...location, cityCountry: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Phone Hotline</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-3" />
                <input
                  type="text"
                  value={location.contactPhone}
                  onChange={(e) => setLocation({ ...location, contactPhone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">WhatsApp Desk</label>
              <input
                type="text"
                value={location.contactWhatsApp}
                onChange={(e) => setLocation({ ...location, contactWhatsApp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Official Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-3" />
                <input
                  type="email"
                  value={location.contactEmail}
                  onChange={(e) => setLocation({ ...location, contactEmail: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Working Hours</label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-3" />
                <input
                  type="text"
                  value={location.workingHours}
                  onChange={(e) => setLocation({ ...location, workingHours: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">
                Google Maps Geocoder Query
              </label>
              <input
                type="text"
                value={location.mapSearchQuery}
                onChange={(e) => setLocation({ ...location, mapSearchQuery: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono text-[11px] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  Optional Custom Lat Pin Override
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Auto-geocoded if blank"
                  value={location.customLat ?? ''}
                  onChange={(e) =>
                    setLocation({
                      ...location,
                      customLat: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  Optional Custom Lng Pin Override
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Auto-geocoded if blank"
                  value={location.customLng ?? ''}
                  onChange={(e) =>
                    setLocation({
                      ...location,
                      customLng: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Right Live Google Maps Preview (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202124]">Live Google Maps Pin Preview</h3>
              <div className="flex items-center gap-2">
                <a
                  href={location.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#30343B] hover:bg-[#202124] text-white text-[11px] font-semibold transition-colors"
                >
                  <Navigation className="w-3 h-3" /> Directions
                </a>
                <a
                  href={location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] text-[11px] font-semibold transition-colors"
                >
                  Open Map <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <OfficeLocationMap location={location} heightClass="h-[360px]" />
          </div>

          <div className="p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] text-[#777777]">
            Updates made here synchronize automatically to the public <strong className="text-[#202124]">Find Our Office</strong> map card, corporate footer, and MARVZ AI Assistant answers.
          </div>
        </div>
      </div>
    </div>
  );
};

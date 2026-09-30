import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { firService } from '../../api/firService';
import { MapPin, Loader2, AlertTriangle, ExternalLink, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on priority
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  critical: createCustomIcon('red'),
  high: createCustomIcon('orange'),
  medium: createCustomIcon('blue'),
  low: createCustomIcon('green'),
  default: createCustomIcon('blue')
};

const CrimeMap = ({ height = "400px", theme = "light" }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await firService.getFIRLocations();
      
      const validLocations = res.data.filter(loc => 
        loc.location?.coordinates?.lat && loc.location?.coordinates?.lng
      );
      
      setLocations(validLocations);
    } catch (err) {
      console.error(err);
      setError('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 h-full w-full" style={{ height }}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold tracking-widest uppercase">Initializing Geospatial Link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 h-full w-full" style={{ height }}>
        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-red-600 dark:text-red-400 text-sm font-bold">{error}</p>
      </div>
    );
  }

  const defaultCenter = locations.length > 0 
    ? [locations[0].location.coordinates.lat, locations[0].location.coordinates.lng]
    : [20.5937, 78.9629]; 
    
  const defaultZoom = locations.length > 0 ? 12 : 5;

  // Premium Map Tiles (Esri - No API Key Required)
  const tileUrl = theme === 'dark' 
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

  return (
    <div className="relative w-full h-full z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height, width: '100%' }}
        className="z-0"
        zoomControl={false} // We can disable default zoom control to make it cleaner, or keep it. We'll keep default for now but style is overridden by leaflet.css
      >
        <TileLayer
          key={theme} // Force re-render when theme changes
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url={tileUrl}
        />
        
        {locations.map(loc => (
          <Marker 
            key={loc._id} 
            position={[loc.location.coordinates.lat, loc.location.coordinates.lng]}
            icon={icons[loc.priority] || icons.default}
          >
            {/* Custom styled popup content using Tailwind */}
            <Popup className="custom-popup" closeButton={false}>
              <div className="p-1 min-w-[220px]">
                
                {/* Popup Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm leading-tight pr-2">{loc.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                      FIR #{loc.firNumber.split('-').pop()}
                    </p>
                  </div>
                  <Shield className="w-4 h-4 text-indigo-500 opacity-50 flex-shrink-0" />
                </div>
                
                {/* Badges */}
                <div className="flex gap-2 mb-3">
                  <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-1 rounded-md ${
                    loc.status === 'registered' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' :
                    loc.status === 'investigating' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20' :
                    loc.status === 'closed' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' :
                    'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'
                  }`}>
                    {loc.status}
                  </span>
                  <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-1 rounded-md ${
                    loc.priority === 'critical' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20' :
                    loc.priority === 'high' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20' :
                    'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'
                  }`}>
                    {loc.priority}
                  </span>
                </div>
                
                {/* Location */}
                <div className="flex items-start bg-gray-50 p-2 rounded-lg mb-4 border border-gray-100">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-gray-600 font-medium leading-snug line-clamp-2" title={loc.location.address}>
                    {loc.location.address}
                  </p>
                </div>
                
                {/* Action Button */}
                <Link 
                  to={`/firs/${loc._id}`} 
                  className="flex items-center justify-center w-full text-[11px] bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow active:scale-95"
                >
                  View Complete Dossier <ExternalLink className="w-3 h-3 ml-1.5" strokeWidth={2.5} />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CrimeMap;

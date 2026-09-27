import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { firService } from '../../api/firService';
import { MapPin, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
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

const CrimeMap = ({ height = "400px" }) => {
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
      
      // Filter out invalid coordinates just in case
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
      <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" style={{ height }}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-gray-500 text-sm font-medium">Loading map data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30" style={{ height }}>
        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
      </div>
    );
  }

  // Default center (could be dynamic based on bounds)
  const defaultCenter = locations.length > 0 
    ? [locations[0].location.coordinates.lat, locations[0].location.coordinates.lng]
    : [20.5937, 78.9629]; // Default to India roughly
    
  const defaultZoom = locations.length > 0 ? 12 : 5;

  return (
    <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map(loc => (
          <Marker 
            key={loc._id} 
            position={[loc.location.coordinates.lat, loc.location.coordinates.lng]}
            icon={icons[loc.priority] || icons.default}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{loc.title}</h3>
                <p className="text-xs text-gray-500 mb-2 border-b pb-2">
                  <span className="font-semibold text-gray-700">FIR:</span> {loc.firNumber}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    loc.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                    loc.status === 'investigating' ? 'bg-purple-100 text-purple-800' :
                    loc.status === 'closed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {loc.status}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    loc.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    loc.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {loc.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3 truncate" title={loc.location.address}>
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {loc.location.address}
                </p>
                
                <Link 
                  to={`/firs/${loc._id}`} 
                  className="block text-center text-xs bg-indigo-600 text-white font-semibold py-1.5 rounded hover:bg-indigo-700 transition"
                >
                  View Details <ExternalLink className="w-3 h-3 inline ml-1" />
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

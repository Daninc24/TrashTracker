import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api';

// Fix default marker icon issue in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ReportMap = ({ reports: propReports }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = React.useRef(false); // Use ref to persist across unmounts

  useEffect(() => {
    if (propReports) {
      setReports(propReports);
      setLoading(false);
      fetchedRef.current = true;
    } else if (!fetchedRef.current) {
      api.get('/reports')
        .then(res => {
          setReports(res.data.reports || res.data);
          setLoading(false);
          fetchedRef.current = true;
        })
        .catch(err => {
          setError('Failed to load reports');
          setLoading(false);
        });
    }
  }, [propReports]);

  if (loading) return <div className="flex items-center justify-center h-40"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-2"></span>Loading map...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const center = reports.length > 0
    ? [reports[0].location.coordinates[1], reports[0].location.coordinates[0]]
    : [37.7749, -122.4194];

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map(report => (
          <Marker
            key={report._id}
            position={[report.location.coordinates[1], report.location.coordinates[0]]}
          >
            <Popup>
              <div className="p-2">
                <div className="font-bold text-green-600 mb-1">{report.category}</div>
                <div className="text-sm text-gray-600 mb-2">{report.description}</div>
                <div className="text-xs text-gray-500">
                  Status: <span className={`px-2 py-1 rounded-full text-xs ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    report.status === 'in progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {report.status}
                  </span>
                </div>
                {report.createdAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ReportMap; 
import React, { useState, useEffect } from 'react';
import api from './api';
import MapPicker from './components/MapPicker';
import ReportTemplates from './components/ReportTemplates';
import { useToast } from './components/ToastContext';

const categories = [
  'Illegal Dumping',
  'Overflowing Bin',
  'Litter',
  'Hazardous Waste',
  'Broken Infrastructure',
  'Graffiti',
  'Abandoned Vehicle',
  'Other',
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
];

const severities = [
  { value: 'minor', label: 'Minor', color: 'text-green-500' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-500' },
  { value: 'major', label: 'Major', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
];

const commonTags = [
  'Safety Hazard',
  'Environmental',
  'Public Health',
  'Aesthetic',
  'Infrastructure',
  'Emergency',
  'Recurring Issue',
  'Seasonal',
];

export default function ReportForm({ onSuccess }) {
  const [category, setCategory] = useState(categories[0]);
  const [lat, setLat] = useState(37.7749); // Default to SF
  const [lng, setLng] = useState(-122.4194);
  const [locationLoading, setLocationLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [severity, setSeverity] = useState('moderate');
  const [tags, setTags] = useState([]);
  const [address, setAddress] = useState('');
  const [estimatedCleanupTime, setEstimatedCleanupTime] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const { showToast } = useToast();
  const [error, setError] = useState(null);
  const [anonymous, setAnonymous] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setLocationLoading(false);
        },
        (error) => {
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields
      if (!description.trim()) {
        showToast('Description is required', 'error');
        setLoading(false);
        return;
      }
      
      // Ensure coordinates are numbers
      const lngNum = parseFloat(lng);
      const latNum = parseFloat(lat);
      
      // Validate coordinates
      if (isNaN(lngNum) || isNaN(latNum)) {
        showToast('Invalid coordinates', 'error');
        setLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('category', category);
      formData.append('location', JSON.stringify({ 
        type: 'Point', 
        coordinates: [lngNum, latNum] 
      }));
      formData.append('description', description.trim());
      formData.append('priority', priority);
      formData.append('severity', severity);
      formData.append('tags', JSON.stringify(tags));
      formData.append('address', address.trim());
      if (estimatedCleanupTime) {
        formData.append('estimatedCleanupTime', estimatedCleanupTime);
      }
      
      if (image) {
        formData.append('image', image);
        console.log('Image attached:', image.name, image.size, image.type);
      }
      
      const locationData = { type: 'Point', coordinates: [lngNum, latNum] };
      console.log('Submitting report with data:', {
        category,
        location: locationData,
        description: description.trim(),
        hasImage: !!image
      });
      console.log('Location JSON string:', JSON.stringify(locationData));
      
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (anonymous || !user) {
        delete api.defaults.headers.common['Authorization'];
      }
      
      const res = await api.post('/reports', formData, config);
      
      console.log('Report submitted successfully:', res.data);
      showToast('Report submitted successfully!', 'success');
      
      // Reset form
      setCategory(categories[0]);
      setLat(37.7749);
      setLng(-122.4194);
      setDescription('');
      setImage(null);
      setPriority('medium');
      setSeverity('moderate');
      setTags([]);
      setAddress('');
      setEstimatedCleanupTime('');
      setCustomTag('');
      
      if (onSuccess) onSuccess(res.data.report || res.data);
      
      if (user && user.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Submission failed';
      if (err.response?.status === 422) {
        // Handle validation errors
        if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        e.target.value = '';
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        e.target.value = '';
        return;
      }
      
      setImage(file);
    }
  };

  const handleAddTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleTemplateSelect = (template) => {
    setCategory(template.category);
    setDescription(template.description);
    setPriority(template.priority);
    setSeverity(template.severity);
    setTags(template.tags);
    setEstimatedCleanupTime(template.estimatedCleanupTime.toString());
    setShowTemplates(false);
    showToast(`Template "${template.name}" applied!`, 'success');
  };

  const handleUseMyLocation = () => {
    // Implementation of handleUseMyLocation
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Templates Section */}
      {showTemplates && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <ReportTemplates onSelectTemplate={handleTemplateSelect} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6" aria-label="Report submission form">
        {locationLoading && (
          <div className="text-center text-blue-500 mb-4">Detecting your location...</div>
        )}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Submit a Report</h2>
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {showTemplates ? 'Hide Templates' : '📋 Use Template'}
            </button>
          </div>
          <p className="text-gray-600">Help keep your community clean by reporting issues</p>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block mb-2 font-semibold text-gray-700">Category *</label>
          <select 
            id="category" 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            aria-label="Category"
            required
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        
        <div>
          <label htmlFor="description" className="block mb-2 font-semibold text-gray-700">Description *</label>
          <textarea 
            id="description" 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            aria-label="Description"
            rows="3"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>
      </div>

      {/* Priority and Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="priority" className="block mb-2 font-semibold text-gray-700">Priority</label>
          <select 
            id="priority" 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            value={priority} 
            onChange={e => setPriority(e.target.value)} 
            aria-label="Priority"
          >
            {priorities.map(p => (
              <option key={p.value} value={p.value} className={p.color}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="severity" className="block mb-2 font-semibold text-gray-700">Severity</label>
          <select 
            id="severity" 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            value={severity} 
            onChange={e => setSeverity(e.target.value)} 
            aria-label="Severity"
          >
            {severities.map(s => (
              <option key={s.value} value={s.value} className={s.color}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Address and Estimated Cleanup Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="address" className="block mb-2 font-semibold text-gray-700">Address (optional)</label>
          <input 
            id="address" 
            type="text" 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
            placeholder="Enter street address..."
            aria-label="Address"
          />
        </div>
        
        <div>
          <label htmlFor="estimatedCleanupTime" className="block mb-2 font-semibold text-gray-700">Estimated Cleanup Time (minutes)</label>
          <input 
            id="estimatedCleanupTime" 
            type="number" 
            min="1"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            value={estimatedCleanupTime} 
            onChange={e => setEstimatedCleanupTime(e.target.value)} 
            placeholder="e.g., 30"
            aria-label="Estimated cleanup time"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700">Tags</label>
        <div className="space-y-4">
          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Common Tags */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Common tags:</p>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  disabled={tags.includes(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    tags.includes(tag)
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Tag */}
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              value={customTag} 
              onChange={e => setCustomTag(e.target.value)} 
              placeholder="Add custom tag..."
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="location" className="block mb-2 font-semibold text-gray-700">Pick Location *</label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <MapPicker
            initialPosition={[lat, lng]}
            onChange={([newLat, newLng]) => {
              setLat(newLat);
              setLng(newLng);
            }}
          />
        </div>
        <div className="text-sm text-gray-500 mt-2 flex items-center">
          <span className="mr-4">📍 Lat: {lat.toFixed(5)}</span>
          <span>📍 Lng: {lng.toFixed(5)}</span>
        </div>
      </div>
      
      <div>
        <label htmlFor="image" className="block mb-2 font-semibold text-gray-700">Image (optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
          <input 
            id="image" 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            aria-label="Image upload"
            className="hidden"
          />
          <label htmlFor="image" className="cursor-pointer">
            {image ? (
              <div>
                <div className="mb-4">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt="Preview" 
                    className="mx-auto max-w-full max-h-32 object-contain rounded"
                  />
                </div>
                <p className="text-gray-600 mb-2">{image.name}</p>
                <p className="text-sm text-gray-500">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setImage(null);
                    document.getElementById('image').value = '';
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📷</div>
                <p className="text-gray-600">Click to upload an image</p>
                <p className="text-sm text-gray-500 mt-1">Supports: JPG, PNG, GIF (max 5MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Use My Location
        </button>
        {(!user || anonymous) && (
          <label className="flex items-center ml-4">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
              className="mr-2"
            />
            Submit as Anonymous
          </label>
        )}
      </div>
      
      <div className="flex gap-4 pt-4">
        <button 
          type="submit" 
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors" 
          disabled={loading || !description.trim()} 
          tabIndex={0}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Report'
          )}
        </button>
      </div>
    </form>
    </div>
  );
} 
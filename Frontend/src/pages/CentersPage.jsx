import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const CentersPage = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    zip_code: '',
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await api.get('/centers/');
      setCenters(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch centers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCenter) {
        await api.put(`/centers/${editingCenter.id}/`, formData);
        toast.success('Center updated successfully');
      } else {
        await api.post('/centers/', formData);
        toast.success('Center created successfully');
      }
      setShowModal(false);
      setFormData({ name: '', address: '', phone: '', email: '', city: '', state: '', zip_code: '' });
      fetchCenters();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/centers/${id}/`);
        toast.success('Center deleted');
        fetchCenters();
      } catch (error) {
        toast.error('Failed to delete center');
      }
    }
  };

  const filteredCenters = centers.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Coaching Centers</h1>
        <button
          onClick={() => {
            setEditingCenter(null);
            setFormData({ name: '', address: '', phone: '', email: '', city: '', state: '', zip_code: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus /> <span>Add Center</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search centers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map((center) => (
          <div key={center.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">{center.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingCenter(center);
                    setFormData(center);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(center.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📍 {center.address}</p>
              <p>🏙️ {center.city}, {center.state} {center.zip_code}</p>
              <p>📞 {center.phone}</p>
              <p>✉️ {center.email}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <CenterModal
          center={editingCenter}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

const CenterModal = ({ center, formData, setFormData, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {center ? 'Edit Center' : 'Add New Center'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Center Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="zip_code"
            placeholder="Zip Code"
            value={formData.zip_code}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
          <div className="flex space-x-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {center ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CentersPage;

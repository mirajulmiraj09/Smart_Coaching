import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const TeachingPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class_name: '',
    file_url: '',
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/teaching/');
      setMaterials(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await api.put(`/teaching/${editingMaterial.id}/`, formData);
        toast.success('Material updated successfully');
      } else {
        await api.post('/teaching/', formData);
        toast.success('Material created successfully');
      }
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        subject: '',
        class_name: '',
        file_url: '',
      });
      fetchMaterials();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/teaching/${id}/`);
        toast.success('Material deleted');
        fetchMaterials();
      } catch (error) {
        toast.error('Failed to delete material');
      }
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Teaching Materials</h1>
        <button
          onClick={() => {
            setEditingMaterial(null);
            setFormData({
              title: '',
              description: '',
              subject: '',
              class_name: '',
              file_url: '',
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus /> <span>Add Material</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div key={material.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiBook className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{material.title}</h3>
                  <p className="text-xs text-gray-600">{material.subject}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingMaterial(material);
                    setFormData(material);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{material.description}</p>
            <p className="text-xs text-gray-500">Class: {material.class_name}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <MaterialModal
          material={editingMaterial}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

const MaterialModal = ({ material, formData, setFormData, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {material ? 'Edit Material' : 'Add New Material'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="class_name"
            placeholder="Class"
            value={formData.class_name}
            onChange={handleChange}
            className="input-field"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="input-field"
          />
          <input
            type="url"
            name="file_url"
            placeholder="File URL"
            value={formData.file_url}
            onChange={handleChange}
            className="input-field"
          />
          <div className="flex space-x-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {material ? 'Update' : 'Create'}
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

export default TeachingPage;

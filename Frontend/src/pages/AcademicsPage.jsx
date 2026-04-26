import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const AcademicsPage = () => {
  const [academics, setAcademics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    class_name: '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    fetchAcademics();
  }, []);

  const fetchAcademics = async () => {
    try {
      const response = await api.get('/academics/');
      setAcademics(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch academics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/academics/${editingItem.id}/`, formData);
        toast.success('Updated successfully');
      } else {
        await api.post('/academics/', formData);
        toast.success('Created successfully');
      }
      setShowModal(false);
      setFormData({ class_name: '', subject: '', description: '' });
      fetchAcademics();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/academics/${id}/`);
        toast.success('Deleted successfully');
        fetchAcademics();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const filteredAcademics = academics.filter(item =>
    item.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Academics</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({ class_name: '', subject: '', description: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus /> <span>Add Class</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search academics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAcademics.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{item.class_name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{item.subject}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setFormData(item);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit2 className="inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <AcademicModal
          item={editingItem}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

const AcademicModal = ({ item, formData, setFormData, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {item ? 'Edit Class' : 'Add New Class'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="class_name"
            placeholder="Class Name"
            value={formData.class_name}
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
            required
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
          <div className="flex space-x-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {item ? 'Update' : 'Create'}
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

export default AcademicsPage;

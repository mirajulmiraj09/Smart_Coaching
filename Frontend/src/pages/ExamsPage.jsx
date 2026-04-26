import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    date: '',
    time: '',
    duration_minutes: '',
    total_marks: '',
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams/');
      setExams(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await api.put(`/exams/${editingExam.id}/`, formData);
        toast.success('Exam updated successfully');
      } else {
        await api.post('/exams/', formData);
        toast.success('Exam created successfully');
      }
      setShowModal(false);
      setFormData({
        name: '',
        subject: '',
        date: '',
        time: '',
        duration_minutes: '',
        total_marks: '',
      });
      fetchExams();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/exams/${id}/`);
        toast.success('Exam deleted');
        fetchExams();
      } catch (error) {
        toast.error('Failed to delete exam');
      }
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Exams</h1>
        <button
          onClick={() => {
            setEditingExam(null);
            setFormData({
              name: '',
              subject: '',
              date: '',
              time: '',
              duration_minutes: '',
              total_marks: '',
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus /> <span>Add Exam</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.map((exam) => (
          <div key={exam.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{exam.name}</h3>
                <div className="space-y-1 text-sm text-gray-600 mt-2">
                  <p>Subject: {exam.subject}</p>
                  <p className="flex items-center space-x-2">
                    <FiCalendar className="inline" />
                    {exam.date} at {exam.time}
                  </p>
                  <p>Duration: {exam.duration_minutes} minutes | Total Marks: {exam.total_marks}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingExam(exam);
                    setFormData(exam);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <ExamModal
          exam={editingExam}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

const ExamModal = ({ exam, formData, setFormData, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">
          {exam ? 'Edit Exam' : 'Add New Exam'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Exam Name"
            value={formData.name}
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
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="number"
            name="duration_minutes"
            placeholder="Duration (minutes)"
            value={formData.duration_minutes}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="total_marks"
            placeholder="Total Marks"
            value={formData.total_marks}
            onChange={handleChange}
            className="input-field"
          />
          <div className="flex space-x-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {exam ? 'Update' : 'Create'}
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

export default ExamsPage;

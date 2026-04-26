import React, { useState, useEffect, useCallback } from 'react';
import {
  FiHome, FiBook, FiUsers, FiGrid, FiPlus, FiTrash2,
  FiSearch, FiRefreshCw, FiX, FiCheck, FiAlertTriangle,
  FiChevronRight, FiLayers, FiUserPlus, FiAward, FiBarChart2,
  FiEye, FiEdit, FiMail, FiPhone, FiCalendar, FiClock,
  FiUserX, FiUserCheck, FiUser, FiBookOpen, FiActivity,
} from 'react-icons/fi';
import api from '../../services/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Badge = ({ text, color = 'gray' }) => {
  const map = {
    green:  'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red:    'bg-red-100 text-red-800',
    blue:   'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    gray:   'bg-gray-100 text-gray-600',
    orange: 'bg-orange-100 text-orange-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[color] || map.gray}`}>
      {text}
    </span>
  );
};

const statusColor = (s) => ({
  approved: 'green', pending: 'yellow', rejected: 'red',
  running: 'green', upcoming: 'blue', completed: 'gray',
  active: 'green', dropped: 'red', morning: 'blue',
  evening: 'orange', night: 'purple', day: 'gray',
  regular: 'blue', crash: 'red', online: 'green',
  pass: 'green', fail: 'red',
}[s] || 'gray');

// ─── Modal ─────────────────────────────────────────────────────────────────
const Modal = ({ open, title, onClose, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><FiX size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Confirm ──────────────────────────────────────────────────────────────────
const Confirm = ({ open, msg, onConfirm, onCancel, loading, dangerous = true }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-start space-x-3 mb-4">
          <FiAlertTriangle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${dangerous ? 'text-red-500' : 'text-yellow-500'}`} />
          <p className="text-gray-700">{msg}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2 ${dangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-medium transition disabled:opacity-50`}>
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue:   'border-blue-500 text-blue-600',
    purple: 'border-purple-500 text-purple-600',
    green:  'border-green-500 text-green-600',
    orange: 'border-orange-500 text-orange-600',
  };
  return (
    <div className={`card border-l-4 ${colors[color] || colors.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <Icon className={`w-8 h-8 opacity-20 ${colors[color]?.split(' ')[1]}`} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Overview
// ═══════════════════════════════════════════════════════════════════════════════
const OverviewTab = ({ center }) => {
  const [members, setMembers] = useState({ teachers: [], students: [], total_teachers: 0, total_students: 0 });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!center) return;
    const id = center.coaching_center_id;
    Promise.all([
      api.get(`/centers/${id}/members/`),
      api.get(`/teaching/centers/${id}/courses/`),
    ]).then(([m, c]) => {
      setMembers(m.data.data || {});
      setCourses(c.data.data?.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [center]);

  if (!center) return <div className="card text-center py-12 text-gray-400">No approved center found.</div>;
  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-2xl font-bold">{center.center_name}</h2>
        <p className="text-blue-100 mt-1">{center.location}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-blue-100">
          {center.contact_number && <span className="flex items-center gap-1"><FiPhone className="w-4 h-4" />{center.contact_number}</span>}
          {center.email && <span className="flex items-center gap-1"><FiMail className="w-4 h-4" />{center.email}</span>}
        </div>
        <div className="mt-3"><Badge text={center.access_type} color="green" /></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Courses"  value={courses.length}                 icon={FiBook}     color="blue" />
        <StatCard label="Teachers" value={members.total_teachers || 0}    icon={FiUsers}    color="purple" />
        <StatCard label="Students" value={members.total_students || 0}    icon={FiUsers}    color="green" />
        <StatCard label="Batches"  value={courses.reduce((a, _) => a, 0)} icon={FiLayers}   color="orange" />
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">Active Courses</h3>
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses yet.</p>
        ) : (
          <div className="space-y-2">
            {courses.slice(0, 6).map(c => (
              <div key={c.course_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{c.course_title}</p>
                  <p className="text-xs text-gray-400">{c.duration} weeks · ৳{c.fee}</p>
                </div>
                <FiChevronRight className="text-gray-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Courses → Batches → Students (drill-down)
// ═══════════════════════════════════════════════════════════════════════════════
const CoursesTab = ({ center }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ course_title: '', description: '', fee: '', duration: '' });
  const [selected, setSelected] = useState(null);
  const cid = center?.coaching_center_id;

  const fetchCourses = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    try {
      const res = await api.get(`/teaching/centers/${cid}/courses/`);
      setCourses(res.data.data?.results || []);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  }, [cid]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleAdd = async () => {
    if (!form.course_title || !form.fee || !form.duration) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      await api.post(`/teaching/centers/${cid}/courses/`, form);
      toast.success('Course created!');
      setShowAdd(false);
      setForm({ course_title: '', description: '', fee: '', duration: '' });
      fetchCourses();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  if (!center) return null;
  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Courses ({courses.length})</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center space-x-2 text-sm">
          <FiPlus className="w-4 h-4" /><span>Add Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <FiBook className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No courses yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(c => (
            <div key={c.course_id} className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
              onClick={() => setSelected(c)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{c.course_title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description || 'No description'}</p>
                </div>
                <FiChevronRight className="text-gray-300 flex-shrink-0 ml-2" />
              </div>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center space-x-1"><FiClock className="w-3.5 h-3.5" /><span>{c.duration} weeks</span></span>
                <span className="font-semibold text-blue-600">৳{c.fee}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      <Modal open={showAdd} title="Add New Course" onClose={() => setShowAdd(false)}>
        <div className="space-y-4">
          <Field label="Course Title" required>
            <input className="input-field" value={form.course_title} onChange={e => setForm(p => ({ ...p, course_title: e.target.value }))} placeholder="e.g. HSC Science Batch" />
          </Field>
          <Field label="Description">
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fee (৳)" required>
              <input className="input-field" type="number" value={form.fee} onChange={e => setForm(p => ({ ...p, fee: e.target.value }))} placeholder="5000" />
            </Field>
            <Field label="Duration (weeks)" required>
              <input className="input-field" type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="12" />
            </Field>
          </div>
          <div className="flex space-x-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Create Course'}</button>
          </div>
        </div>
      </Modal>

      {selected && <CourseDetailModal course={selected} center={center} onClose={() => setSelected(null)} />}
    </div>
  );
};

// ── Course Detail: Batches + Subjects ─────────────────────────────────────────
const CourseDetailModal = ({ course, center, onClose }) => {
  const [tab, setTab] = useState('batches');
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [batchForm, setBatchForm] = useState({
    batch_name: '', batch_code: '', batch_type: 'regular',
    class_shift: 'morning', start_date: '', end_date: '', max_students: 30,
  });
  const [subjectForm, setSubjectForm] = useState({ subject_name: '', subject_code: '' });
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [assignModal, setAssignModal] = useState(null); // subject to assign teacher

  const reload = useCallback(async () => {
    try {
      const [b, s] = await Promise.all([
        api.get(`/teaching/courses/${course.course_id}/batches/`),
        api.get(`/teaching/courses/${course.course_id}/subjects/`),
      ]);
      setBatches(b.data.data?.results || []);
      setSubjects(s.data.data?.results || []);
    } catch {} finally { setLoading(false); }
  }, [course.course_id]);

  useEffect(() => { reload(); }, [reload]);

  const addBatch = async () => {
    setSaving(true);
    try {
      await api.post(`/teaching/courses/${course.course_id}/batches/`, batchForm);
      toast.success('Batch created!');
      setShowBatchForm(false);
      reload();
    } catch (e) { toast.error(Object.values(e.response?.data || {})[0]?.[0] || 'Failed'); }
    finally { setSaving(false); }
  };

  const addSubject = async () => {
    setSaving(true);
    try {
      await api.post(`/teaching/courses/${course.course_id}/subjects/`, subjectForm);
      toast.success('Subject created!');
      setShowSubjectForm(false);
      reload();
    } catch (e) { toast.error(Object.values(e.response?.data || {})[0]?.[0] || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{course.course_title}</h2>
            <p className="text-sm text-gray-400">{course.duration} weeks · ৳{course.fee}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><FiX size={20} /></button>
        </div>

        <div className="flex border-b px-5">
          {[['batches', 'Batches'], ['subjects', 'Subjects & Teachers']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? <Loading /> : tab === 'batches' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{batches.length} batches</p>
                <button onClick={() => setShowBatchForm(true)} className="btn-primary text-sm flex items-center space-x-1">
                  <FiPlus className="w-4 h-4" /><span>Add Batch</span>
                </button>
              </div>

              {batches.length === 0 ? <p className="text-gray-400 text-center py-8">No batches yet</p> : batches.map(b => (
                <div key={b.batch_id}
                  className="border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedBatch(b)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{b.batch_name}</p>
                      <p className="text-xs text-gray-400">{b.batch_code} · {b.class_shift} · {b.batch_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge text={b.status} color={statusColor(b.status)} />
                      <FiChevronRight className="text-gray-300 w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span><FiCalendar className="inline w-3 h-3 mr-1" />{b.start_date} → {b.end_date}</span>
                    <span className={`font-medium ${b.is_full ? 'text-red-500' : 'text-green-600'}`}>
                      {b.enrolled_count}/{b.max_students} students {b.is_full && '(FULL)'}
                    </span>
                  </div>
                </div>
              ))}

              {showBatchForm && (
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3 mt-3">
                  <h4 className="font-semibold text-gray-700">New Batch</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-field text-sm" placeholder="Batch name *" value={batchForm.batch_name} onChange={e => setBatchForm(p => ({ ...p, batch_name: e.target.value }))} />
                    <input className="input-field text-sm" placeholder="Batch code *" value={batchForm.batch_code} onChange={e => setBatchForm(p => ({ ...p, batch_code: e.target.value }))} />
                    <select className="input-field text-sm" value={batchForm.batch_type} onChange={e => setBatchForm(p => ({ ...p, batch_type: e.target.value }))}>
                      <option value="regular">Regular</option><option value="crash">Crash</option><option value="online">Online</option>
                    </select>
                    <select className="input-field text-sm" value={batchForm.class_shift} onChange={e => setBatchForm(p => ({ ...p, class_shift: e.target.value }))}>
                      <option value="morning">Morning</option><option value="day">Day</option><option value="evening">Evening</option><option value="night">Night</option>
                    </select>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Date *</label>
                      <input className="input-field text-sm" type="date" value={batchForm.start_date} onChange={e => setBatchForm(p => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Date *</label>
                      <input className="input-field text-sm" type="date" value={batchForm.end_date} onChange={e => setBatchForm(p => ({ ...p, end_date: e.target.value }))} />
                    </div>
                    <input className="input-field text-sm" type="number" placeholder="Max students" value={batchForm.max_students} onChange={e => setBatchForm(p => ({ ...p, max_students: e.target.value }))} />
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setShowBatchForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                    <button onClick={addBatch} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Saving...' : 'Create Batch'}</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Subjects tab */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{subjects.length} subjects</p>
                <button onClick={() => setShowSubjectForm(true)} className="btn-primary text-sm flex items-center space-x-1">
                  <FiPlus className="w-4 h-4" /><span>Add Subject</span>
                </button>
              </div>

              {subjects.length === 0 ? <p className="text-gray-400 text-center py-8">No subjects yet</p> : subjects.map(s => (
                <div key={s.subject_id} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{s.subject_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.subject_code}</p>
                    </div>
                    {/* Assign Teacher button always visible */}
                    <button
                      onClick={() => setAssignModal(s)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors ml-2"
                    >
                      <FiUserPlus className="w-3 h-3" /> Assign Teacher
                    </button>
                  </div>

                  {/* Teacher info */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    {s.teacher_name ? (
                      <span className="text-sm font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                        👤 {s.teacher_name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No teacher assigned</span>
                    )}
                    {s.assigned_date && <span className="text-xs text-gray-400 ml-auto">Assigned: {s.assigned_date}</span>}
                  </div>
                </div>
              ))}

              {showSubjectForm && (
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3 mt-3">
                  <h4 className="font-semibold text-gray-700">New Subject</h4>
                  <input className="input-field text-sm" placeholder="Subject name *" value={subjectForm.subject_name} onChange={e => setSubjectForm(p => ({ ...p, subject_name: e.target.value }))} />
                  <input className="input-field text-sm" placeholder="Subject code * (e.g. PHY-101)" value={subjectForm.subject_code} onChange={e => setSubjectForm(p => ({ ...p, subject_code: e.target.value }))} />
                  <div className="flex space-x-2">
                    <button onClick={() => setShowSubjectForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                    <button onClick={addSubject} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? 'Saving...' : 'Create Subject'}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Batch Students Modal */}
      {selectedBatch && (
        <BatchStudentsModal batch={selectedBatch} center={center} onClose={() => setSelectedBatch(null)} />
      )}

      {/* Assign Teacher Modal */}
      {assignModal && (
        <AssignTeacherModal
          subject={assignModal}
          center={center}
          batches={batches}
          onClose={() => setAssignModal(null)}
          onDone={() => { setAssignModal(null); reload(); }}
        />
      )}
    </div>
  );
};

// ── Assign Teacher Modal (from subject context) ────────────────────────────────
const AssignTeacherModal = ({ subject, center, batches, onClose, onDone }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/centers/${center.coaching_center_id}/members/`)
      .then(r => setTeachers(r.data.data?.teachers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [center.coaching_center_id]);

  const assign = async () => {
    if (!selectedTeacher || !selectedBatch) return toast.error('Select teacher and batch');
    setSaving(true);
    try {
      await api.post('/teaching/assignments/teachers/', {
        coaching_center: center.coaching_center_id,
        course: subject.course,
        batch: parseInt(selectedBatch),
        subject: subject.subject_id,
        teacher: parseInt(selectedTeacher),
      });
      toast.success('Teacher assigned successfully!');
      onDone();
    } catch (e) {
      const err = e.response?.data;
      const msg = err?.detail || err?.teacher?.[0] || err?.batch?.[0] || Object.values(err || {})[0]?.[0] || 'Assignment failed';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-bold text-gray-800">Assign Teacher</h3>
            <p className="text-xs text-gray-400 mt-0.5">Subject: {subject.subject_name} ({subject.subject_code})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><FiX size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {loading ? <Loading /> : (
            <>
              <Field label="Select Teacher" required>
                <select className="input-field" value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}>
                  <option value="">-- Select a teacher --</option>
                  {teachers.length === 0 ? (
                    <option disabled>No teachers available. Add teachers first.</option>
                  ) : teachers.map(t => (
                    <option key={t.user_id} value={t.user_id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </Field>

              <Field label="Select Batch" required>
                <select className="input-field" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                  <option value="">-- Select a batch --</option>
                  {batches.length === 0 ? (
                    <option disabled>No batches available</option>
                  ) : batches.map(b => (
                    <option key={b.batch_id} value={b.batch_id}>{b.batch_name} ({b.batch_code})</option>
                  ))}
                </select>
              </Field>

              {teachers.length === 0 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <FiAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Go to the Teachers tab to add teachers to your center first.
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button onClick={assign} disabled={saving || !selectedTeacher || !selectedBatch} className="btn-primary flex-1">
                  {saving ? 'Assigning...' : 'Assign Teacher'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Batch Students Modal — full details with stats ────────────────────────────
const BatchStudentsModal = ({ batch, center, onClose }) => {
  const { user } = useAuthStore();
  const canManage = ['coaching_admin', 'coaching_manager', 'coaching_staff', 'teacher'].includes(user?.role_name || user?.role);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null); // for details panel
  const [banTarget, setBanTarget] = useState(null);
  const [banning, setBanning] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/academics/batches/${batch.batch_id}/students/`);
      const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.results || []);
      setStudents(list);
    } catch {} finally { setLoading(false); }
  }, [batch.batch_id]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const enrollStudent = async () => {
    if (!studentEmail.trim()) return toast.error('Enter student email or ID');
    setEnrolling(true);
    try {
      // Try numeric ID first, then search by email via center members
      const isId = /^\d+$/.test(studentEmail.trim());
      if (isId) {
        await api.post(`/academics/batches/${batch.batch_id}/enroll/`, { student: parseInt(studentEmail) });
      } else {
        // Find student by email from center members
        const mem = await api.get(`/centers/${center.coaching_center_id}/members/`);
        const all = mem.data.data?.students || [];
        const found = all.find(s => s.email?.toLowerCase() === studentEmail.toLowerCase());
        if (!found) { toast.error('Student not found in this center'); setEnrolling(false); return; }
        await api.post(`/academics/batches/${batch.batch_id}/enroll/`, { student: found.user_id });
      }
      toast.success('Student enrolled!');
      setStudentEmail('');
      fetchStudents();
    } catch (e) { toast.error(e.response?.data?.non_field_errors?.[0] || e.response?.data?.detail || 'Enrollment failed'); }
    finally { setEnrolling(false); }
  };

  const banStudent = async () => {
    if (!banTarget) return;
    setBanning(true);
    try {
      await api.post(`/academics/enrollments/${banTarget.enrollment_id}/remove/`);
      toast.success(`${banTarget.student_name} removed from batch`);
      setBanTarget(null);
      if (selectedStudent?.enrollment_id === banTarget.enrollment_id) setSelectedStudent(null);
      fetchStudents();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
    finally { setBanning(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{batch.batch_name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>{batch.batch_code}</span>
              <Badge text={batch.status} color={statusColor(batch.status)} />
              <Badge text={batch.class_shift} color={statusColor(batch.class_shift)} />
              <Badge text={batch.batch_type} color={statusColor(batch.batch_type)} />
              <span className={`font-semibold ${batch.is_full ? 'text-red-500' : 'text-green-600'}`}>
                {batch.enrolled_count}/{batch.max_students} enrolled
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><FiX size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — student list */}
          <div className="w-full md:w-1/2 flex flex-col border-r">
            {/* Enroll bar */}
            {canManage && (
              <div className="p-4 border-b bg-gray-50">
                <p className="text-xs text-gray-500 mb-2 font-medium">Enroll Student (email or user ID)</p>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1 text-sm"
                    placeholder="student@email.com or user ID"
                    value={studentEmail}
                    onChange={e => setStudentEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && enrollStudent()}
                  />
                  <button onClick={enrollStudent} disabled={enrolling || batch.is_full}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 whitespace-nowrap">
                    {enrolling ? '...' : '+ Enroll'}
                  </button>
                </div>
                {batch.is_full && <p className="text-xs text-red-500 mt-1">Batch is full</p>}
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? <div className="p-6"><Loading /></div> : students.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <FiUsers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No students enrolled</p>
                </div>
              ) : students.map(s => (
                <div
                  key={s.enrollment_id}
                  onClick={() => setSelectedStudent(s)}
                  className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer transition-colors ${selectedStudent?.enrollment_id === s.enrollment_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {s.student_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.student_name}</p>
                      <p className="text-xs text-gray-400">{s.student_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge text={s.enrollment_status} color={statusColor(s.enrollment_status)} />
                    {canManage && s.enrollment_status === 'active' && (
                      <button
                        onClick={e => { e.stopPropagation(); setBanTarget(s); }}
                        title="Remove from batch"
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiUserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Student Detail Panel */}
          <div className="hidden md:flex flex-col w-1/2">
            {!selectedStudent ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center">
                <FiUser className="w-14 h-14 mb-3 opacity-30" />
                <p className="text-sm">Click a student to see their full details</p>
              </div>
            ) : (
              <StudentDetailPanel student={selectedStudent} batch={batch} />
            )}
          </div>
        </div>
      </div>

      {/* Ban confirm */}
      <Confirm
        open={!!banTarget}
        msg={`Remove "${banTarget?.student_name}" from this batch? They can be re-enrolled later.`}
        onConfirm={banStudent}
        onCancel={() => setBanTarget(null)}
        loading={banning}
        dangerous
      />
    </div>
  );
};

// ── Student Detail Panel ───────────────────────────────────────────────────────
const StudentDetailPanel = ({ student, batch }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch exam results for this student in this batch
    Promise.all([
      api.get(`/exams/batches/${batch.batch_id}/`).catch(() => ({ data: { data: [] } })),
    ]).then(([exams]) => {
      const examList = Array.isArray(exams.data) ? exams.data :
        (exams.data?.data?.results || exams.data?.results || exams.data?.data || []);
      setStats({
        totalExams: examList.length,
        attendedExams: examList.filter(e => e.status === 'completed').length,
      });
    }).finally(() => setLoading(false));
  }, [student.student, batch.batch_id]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Student header */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 border-b">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {student.student_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-lg">{student.student_name}</h4>
            <p className="text-sm text-gray-500">{student.student_email}</p>
            <div className="mt-1"><Badge text={student.enrollment_status} color={statusColor(student.enrollment_status)} /></div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Enrollment info */}
        <div>
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Enrollment Info</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">Enrolled</p>
              <p className="font-semibold text-gray-700 mt-0.5">{student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString('en-BD') : '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">Status</p>
              <p className="font-semibold text-gray-700 mt-0.5 capitalize">{student.enrollment_status}</p>
            </div>
          </div>
        </div>

        {/* Batch info */}
        <div>
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Batch Info</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Batch</span>
              <span className="font-medium text-gray-800">{batch.batch_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Shift</span>
              <span className="font-medium text-gray-800 capitalize">{batch.class_shift}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Type</span>
              <span className="font-medium text-gray-800 capitalize">{batch.batch_type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-800">{batch.start_date} → {batch.end_date}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-xs text-gray-400">Loading stats...</div>
        ) : stats && (
          <div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Academic Activity</h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalExams}</p>
                <p className="text-xs text-blue-500 mt-0.5">Total Exams</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.attendedExams}</p>
                <p className="text-xs text-green-500 mt-0.5">Completed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Teachers — with Assign Teacher to Subject inline
// ═══════════════════════════════════════════════════════════════════════════════
const TeachersTab = ({ center }) => {
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null); // view assignments
  const cid = center?.coaching_center_id;

  const reload = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    try {
      const [m, a] = await Promise.all([
        api.get(`/centers/${cid}/members/`),
        api.get(`/teaching/centers/${cid}/assignments/`),
      ]);
      setTeachers(m.data.data?.teachers || []);
      setAssignments(a.data.data?.results || []);
    } catch {} finally { setLoading(false); }
  }, [cid]);

  useEffect(() => { reload(); }, [reload]);

  const addTeacher = async () => {
    if (!email.trim()) return toast.error('Enter email');
    setAdding(true);
    try {
      await api.post(`/centers/${cid}/members/add-teacher/`, { email });
      toast.success('Teacher added!');
      setEmail(''); setShowAdd(false); reload();
    } catch (e) { toast.error(e.response?.data?.detail || e.response?.data?.email?.[0] || 'Failed'); }
    finally { setAdding(false); }
  };

  const removeTeacher = async () => {
    setRemoving(true);
    try {
      await api.delete(`/centers/${cid}/members/${removeTarget.user_id}/remove/`);
      toast.success('Teacher removed');
      setRemoveTarget(null); reload();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
    finally { setRemoving(false); }
  };

  // Group assignments by teacher
  const assignmentsByTeacher = (teacherId) =>
    assignments.filter(a => a.teacher === teacherId || a.teacher?.user_id === teacherId);

  if (!center) return null;
  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Teachers ({teachers.length})</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center space-x-1">
          <FiPlus className="w-4 h-4" /><span>Add Teacher</span>
        </button>
      </div>

      {showAdd && (
        <div className="card border-2 border-blue-200 bg-blue-50 space-y-3">
          <h4 className="font-semibold text-gray-700">Add Teacher by Email</h4>
          <p className="text-xs text-gray-500">The user must already be registered with teacher role.</p>
          <div className="flex gap-2">
            <input className="input-field flex-1 text-sm" placeholder="teacher@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTeacher()} />
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm px-3">Cancel</button>
            <button onClick={addTeacher} disabled={adding} className="btn-primary text-sm px-4">{adding ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <FiUsers className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No teachers yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map(t => {
            const ta = assignmentsByTeacher(t.user_id);
            const expanded = selectedTeacher === t.user_id;
            return (
              <div key={t.user_id} className="card border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {t.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                      {ta.length} subject{ta.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setSelectedTeacher(expanded ? null : t.user_id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View assignments"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRemoveTarget(t)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove teacher"
                    >
                      <FiUserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded — show subjects assigned to this teacher */}
                {expanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Assigned Subjects</p>
                    {ta.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No subjects assigned yet</p>
                    ) : (
                      <div className="space-y-2">
                        {ta.map(a => (
                          <div key={a.assignment_id} className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-sm font-semibold text-purple-800">{a.subject_name}</p>
                              <p className="text-xs text-purple-500">{a.batch_name}</p>
                            </div>
                            <Badge text="active" color="green" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Confirm
        open={!!removeTarget}
        msg={`Remove "${removeTarget?.name}" from this center?`}
        onConfirm={removeTeacher}
        onCancel={() => setRemoveTarget(null)}
        loading={removing}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Students
// ═══════════════════════════════════════════════════════════════════════════════
const StudentsTab = ({ center }) => {
  const { user } = useAuthStore();
  const canManage = ['coaching_admin', 'coaching_manager', 'coaching_staff', 'teacher'].includes(user?.role_name || user?.role);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const cid = center?.coaching_center_id;

  const reload = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    try {
      const r = await api.get(`/centers/${cid}/members/`);
      setStudents(r.data.data?.students || []);
    } catch {} finally { setLoading(false); }
  }, [cid]);

  useEffect(() => { reload(); }, [reload]);

  const addStudent = async () => {
    if (!email.trim()) return toast.error('Enter email');
    setAdding(true);
    try {
      await api.post(`/centers/${cid}/members/add-student/`, { email });
      toast.success('Student added!');
      setEmail(''); setShowAdd(false); reload();
    } catch (e) { toast.error(e.response?.data?.detail || e.response?.data?.email?.[0] || 'Failed'); }
    finally { setAdding(false); }
  };

  const removeStudent = async () => {
    setRemoving(true);
    try {
      await api.delete(`/centers/${cid}/members/${removeTarget.user_id}/remove/`);
      toast.success('Student removed');
      setRemoveTarget(null); reload();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
    finally { setRemoving(false); }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!center) return null;
  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Students ({students.length})</h2>
        {canManage && (
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center space-x-1">
            <FiPlus className="w-4 h-4" /><span>Add Student</span>
          </button>
        )}
      </div>

      {showAdd && (
        <div className="card border-2 border-blue-200 bg-blue-50 space-y-3">
          <h4 className="font-semibold text-gray-700">Add Student by Email</h4>
          <div className="flex gap-2">
            <input className="input-field flex-1 text-sm" placeholder="student@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStudent()} />
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm px-3">Cancel</button>
            <button onClick={addStudent} disabled={adding} className="btn-primary text-sm px-4">{adding ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      )}

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input className="input-field pl-9 text-sm" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <FiUsers className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>{search ? 'No results' : 'No students yet'}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                {canManage && <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-semibold text-sm text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{s.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">{s.phone || '—'}</td>
                  {canManage && (
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setRemoveTarget(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <FiUserX className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Confirm
        open={!!removeTarget}
        msg={`Remove "${removeTarget?.name}" from this coaching center?`}
        onConfirm={removeStudent}
        onCancel={() => setRemoveTarget(null)}
        loading={removing}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Assign Teacher (standalone — all assignments overview)
// ═══════════════════════════════════════════════════════════════════════════════
const AssignTeacherTab = ({ center }) => {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ teacher: '', course: '', batch: '', subject: '' });
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const cid = center?.coaching_center_id;

  const reload = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    try {
      const [m, c, a] = await Promise.all([
        api.get(`/centers/${cid}/members/`),
        api.get(`/teaching/centers/${cid}/courses/`),
        api.get(`/teaching/centers/${cid}/assignments/`),
      ]);
      setTeachers(m.data.data?.teachers || []);
      setCourses(c.data.data?.results || []);
      setAssignments(a.data.data?.results || []);
    } catch {} finally { setLoading(false); }
  }, [cid]);

  useEffect(() => { reload(); }, [reload]);

  // When course changes → load batches + subjects
  useEffect(() => {
    if (!form.course) { setBatches([]); setSubjects([]); return; }
    Promise.all([
      api.get(`/teaching/courses/${form.course}/batches/`),
      api.get(`/teaching/courses/${form.course}/subjects/`),
    ]).then(([b, s]) => {
      setBatches(b.data.data?.results || []);
      setSubjects(s.data.data?.results || []);
    }).catch(() => {});
    setForm(p => ({ ...p, batch: '', subject: '' }));
  }, [form.course]);

  const assign = async () => {
    if (!form.teacher || !form.course || !form.batch || !form.subject) return toast.error('Fill all fields');
    setSaving(true);
    try {
      await api.post('/teaching/assignments/teachers/', {
        coaching_center: cid,
        course: parseInt(form.course),
        batch: parseInt(form.batch),
        subject: parseInt(form.subject),
        teacher: parseInt(form.teacher),
      });
      toast.success('Teacher assigned!');
      setForm({ teacher: '', course: '', batch: '', subject: '' });
      reload();
    } catch (e) {
      const err = e.response?.data;
      const msg = err?.detail || err?.teacher?.[0] || err?.batch?.[0] || err?.subject?.[0] || Object.values(err || {})[0]?.[0] || 'Failed';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  if (!center) return null;
  if (loading) return <Loading />;

  const selClass = "input-field text-sm";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Assign Teacher to Subject</h2>

      {/* Form card */}
      <div className="card border-2 border-blue-100 space-y-4">
        <h3 className="font-bold text-gray-700 text-base">New Assignment</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Teacher" required>
            <select className={selClass} value={form.teacher} onChange={e => setForm(p => ({ ...p, teacher: e.target.value }))}>
              <option value="">Select teacher...</option>
              {teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.name} ({t.email})</option>)}
            </select>
          </Field>

          <Field label="Course" required>
            <select className={selClass} value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}>
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_title}</option>)}
            </select>
          </Field>

          <Field label="Batch" required>
            <select className={selClass} value={form.batch} onChange={e => setForm(p => ({ ...p, batch: e.target.value }))} disabled={!form.course}>
              <option value="">Select batch...</option>
              {batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.batch_name} ({b.batch_code})</option>)}
            </select>
          </Field>

          <Field label="Subject" required>
            <select className={selClass} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} disabled={!form.course}>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name} ({s.subject_code})</option>)}
            </select>
          </Field>
        </div>

        <button onClick={assign} disabled={saving} className="btn-primary w-full">
          {saving ? 'Assigning...' : 'Assign Teacher'}
        </button>
      </div>

      {/* Assignments table */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3">All Assignments ({assignments.length})</h3>
        {assignments.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <FiAward className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No assignments yet</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Teacher', 'Subject', 'Batch', 'Assigned'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.assignment_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{a.teacher_name}</p>
                      <p className="text-xs text-gray-400">{a.teacher_email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{a.subject_name}</td>
                    <td className="px-4 py-3"><Badge text={a.batch_name} color="blue" /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {a.assigned_at ? new Date(a.assigned_at).toLocaleDateString('en-BD') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
const CoachingAdminDashboard = () => {
  const { user } = useAuthStore();
  const [center, setCenter] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/centers/mine/')
      .then(r => setCenter(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'overview',  label: 'Overview',        icon: FiHome },
    { key: 'courses',   label: 'Courses & Batches',icon: FiBook },
    { key: 'teachers',  label: 'Teachers',         icon: FiUsers },
    { key: 'students',  label: 'Students',         icon: FiUserPlus },
    { key: 'assign',    label: 'Assign Teacher',   icon: FiAward },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.role_name === 'teacher' ? '👨‍🏫' : '🏫'} {center?.center_name || 'Coaching Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full capitalize">
          {user?.role_name?.replace(/_/g, ' ') || 'Staff'}
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview'  && <OverviewTab center={center} />}
        {activeTab === 'courses'   && <CoursesTab center={center} />}
        {activeTab === 'teachers'  && <TeachersTab center={center} />}
        {activeTab === 'students'  && <StudentsTab center={center} />}
        {activeTab === 'assign'    && <AssignTeacherTab center={center} />}
      </div>
    </div>
  );
};

export default CoachingAdminDashboard;



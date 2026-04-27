
import React, { useState, useEffect, useCallback } from 'react';
import {
  FiHome, FiBook, FiUsers, FiGrid, FiPlus, FiTrash2,
  FiSearch, FiX, FiAlertTriangle, FiChevronRight, FiUserPlus,
  FiPhone, FiMail, FiCalendar, FiClock, FiArrowLeft,
  FiCheckCircle, FiSlash, FiAward, FiBarChart2, FiUser,
  FiRefreshCw, FiTag, FiLayers,
} from 'react-icons/fi';
import api from '../../services/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

// ─── Tiny Helpers ─────────────────────────────────────────────────────────────
const Badge = ({ text, color = 'gray' }) => {
  const map = {
    green:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border border-amber-200',
    red:    'bg-rose-100 text-rose-700 border border-rose-200',
    blue:   'bg-blue-100 text-blue-700 border border-blue-200',
    purple: 'bg-violet-100 text-violet-700 border border-violet-200',
    gray:   'bg-gray-100 text-gray-500 border border-gray-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[color] || map.gray}`}>
      {text}
    </span>
  );
};

const statusColor = s => ({ approved:'green', active:'green', running:'green', pending:'yellow', upcoming:'blue', completed:'gray', rejected:'red', dropped:'red' }[s] || 'gray');

const Modal = ({ open, title, onClose, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition"><FiX size={16}/></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <FiAlertTriangle className="text-red-500 w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-800">{title}</p>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium transition disabled:opacity-50 ${confirmClass || 'bg-red-500 hover:bg-red-600'}`}>
            {loading ? 'Processing...' : confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 hover:bg-white';

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
const OverviewTab = ({ center }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const cid = center?.coaching_center_id;

  useEffect(() => {
    if (!cid) return;
    Promise.all([
      api.get(`/centers/${cid}/members/`),
      api.get(`/teaching/centers/${cid}/courses/`),
      api.get(`/teaching/centers/${cid}/assignments/`),
    ]).then(([m, c, a]) => {
      setData({
        members: m.data.data,
        courses: c.data.data?.results || [],
        assignments: a.data.data?.results || [],
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [cid]);

  if (!center) return <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-amber-700">⚠ No approved coaching center found.</div>;
  if (loading) return <Loading />;

  const stats = [
    { label: 'Courses',     value: data.courses.length,              icon: FiBook,     color: 'blue' },
    { label: 'Teachers',    value: data.members?.total_teachers || 0, icon: FiUsers,    color: 'purple' },
    { label: 'Students',    value: data.members?.total_students || 0, icon: FiUsers,    color: 'green' },
    { label: 'Assignments', value: data.assignments.length,          icon: FiLayers,   color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Center card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Your Center</p>
        <h2 className="text-2xl font-bold">{center.center_name}</h2>
        <div className="flex flex-wrap gap-4 mt-3 text-blue-100 text-sm">
          {center.location && <span className="flex items-center gap-1">📍 {center.location}</span>}
          {center.contact_number && <span className="flex items-center gap-1"><FiPhone className="w-3.5 h-3.5"/>{center.contact_number}</span>}
          {center.email && <span className="flex items-center gap-1"><FiMail className="w-3.5 h-3.5"/>{center.email}</span>}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              color === 'blue' ? 'bg-blue-100' : color === 'purple' ? 'bg-violet-100' : color === 'green' ? 'bg-emerald-100' : 'bg-orange-100'
            }`}>
              <Icon className={`w-5 h-5 ${color === 'blue' ? 'text-blue-600' : color === 'purple' ? 'text-violet-600' : color === 'green' ? 'text-emerald-600' : 'text-orange-600'}`} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Teacher assignments overview */}
      {data.assignments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Teacher Assignments</h3>
          <div className="space-y-2">
            {data.assignments.slice(0, 6).map(a => (
              <div key={a.assignment_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.teacher.name}</p>
                    <p className="text-xs text-gray-400">{a.subject.name} · {a.batch.name}</p>
                  </div>
                </div>
                <Badge text={a.course.title} color="blue" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COURSES TAB
// ═══════════════════════════════════════════════════════════════════════════════
const CoursesTab = ({ center }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ course_title: '', description: '', fee: '', duration: '' });
  const cid = center?.coaching_center_id;

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get(`/teaching/centers/${cid}/courses/`); setCourses(r.data.data?.results || []); }
    catch { toast.error('Failed to load courses'); } finally { setLoading(false); }
  }, [cid]);

  useEffect(() => { if (cid) fetch(); }, [fetch, cid]);

  const add = async () => {
    if (!form.course_title || !form.fee || !form.duration) return toast.error('Fill required fields');
    setSaving(true);
    try { await api.post(`/teaching/centers/${cid}/courses/`, form); toast.success('Course created!'); setShowAdd(false); setForm({ course_title:'', description:'', fee:'', duration:'' }); fetch(); }
    catch(e) { toast.error(e.response?.data?.detail || 'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  if (selected) return <CourseDetailView course={selected} center={center} onBack={() => { setSelected(null); fetch(); }} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Courses <span className="text-gray-400 font-normal text-base">({courses.length})</span></h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm">
          <FiPlus className="w-4 h-4"/><span>Add Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <FiBook className="w-10 h-10 text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-400">No courses yet. Add your first course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(c => (
            <div key={c.course_id} onClick={() => setSelected(c)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">{c.course_title}</h3>
                <FiChevronRight className="text-gray-300 group-hover:text-blue-500 transition flex-shrink-0"/>
              </div>
              {c.description && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{c.description}</p>}
              <div className="flex items-center space-x-3 text-sm">
                <span className="flex items-center space-x-1 text-gray-500"><FiClock className="w-3.5 h-3.5"/><span>{c.duration} weeks</span></span>
                <span className="font-bold text-blue-600">৳{c.fee}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} title="Add New Course" onClose={() => setShowAdd(false)}>
        <div className="space-y-4">
          <Field label="Course Title" required><input className={inputCls} value={form.course_title} onChange={e=>setForm(p=>({...p,course_title:e.target.value}))} placeholder="e.g. HSC Science 2025"/></Field>
          <Field label="Description"><textarea className={inputCls+' resize-none'} rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Short description..."/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fee (৳)" required><input className={inputCls} type="number" value={form.fee} onChange={e=>setForm(p=>({...p,fee:e.target.value}))} placeholder="5000"/></Field>
            <Field label="Duration (weeks)" required><input className={inputCls} type="number" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} placeholder="12"/></Field>
          </div>
          <div className="flex space-x-3 pt-2">
            <button onClick={()=>setShowAdd(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={add} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">{saving?'Creating...':'Create Course'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Course Detail (Batches + Subjects) ────────────────────────────────────────
const CourseDetailView = ({ course, center, onBack }) => {
  const [tab, setTab] = useState('batches');
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBatch, setShowBatch] = useState(false);
  const [showSubject, setShowSubject] = useState(false);
  const [showAssign, setShowAssign] = useState(null); // subject obj
  const [saving, setSaving] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [batchForm, setBatchForm] = useState({ batch_name:'', batch_code:'', batch_type:'regular', class_shift:'morning', start_date:'', end_date:'', max_students:30 });
  const [subjectForm, setSubjectForm] = useState({ subject_name:'', subject_code:'' });
  const [assignTeacher, setAssignTeacher] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s, t] = await Promise.all([
        api.get(`/teaching/courses/${course.course_id}/batches/`),
        api.get(`/teaching/courses/${course.course_id}/subjects/with-teachers/`),
        api.get(`/centers/${center.coaching_center_id}/members/?role=teacher`),
      ]);
      setBatches(b.data.data?.results || []);
      setSubjects(s.data.data?.results || []);
      setTeachers(t.data.data?.teachers || []);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  }, [course.course_id, center.coaching_center_id]);

  useEffect(() => { loadData(); }, [loadData]);

  const addBatch = async () => {
    setSaving(true);
    try { await api.post(`/teaching/courses/${course.course_id}/batches/`, batchForm); toast.success('Batch created!'); setShowBatch(false); loadData(); }
    catch(e) { toast.error(Object.values(e.response?.data||{})[0]?.[0]||'Failed'); } finally { setSaving(false); }
  };

  const addSubject = async () => {
    if (!subjectForm.subject_name || !subjectForm.subject_code) return toast.error('Fill required fields');
    setSaving(true);
    try { await api.post(`/teaching/courses/${course.course_id}/subjects/`, subjectForm); toast.success('Subject created!'); setShowSubject(false); setSubjectForm({ subject_name:'', subject_code:'' }); loadData(); }
    catch(e) { toast.error(Object.values(e.response?.data||{})[0]?.[0]||'Failed'); } finally { setSaving(false); }
  };

  const doAssignTeacher = async (subject, batchId) => {
    if (!assignTeacher) return toast.error('Please select a teacher');
    if (!batchId)       return toast.error('Please select a batch');

    const payload = {
      coaching_center: center.coaching_center_id,
      course:          course.course_id,
      batch:           parseInt(batchId),
      subject:         subject.subject_id,
      teacher:         parseInt(assignTeacher),
    };

    setSaving(true);
    try {
      await api.post('/teaching/assignments/teachers/', payload);
      toast.success(`Teacher assigned to ${subject.subject_name}!`);
      setShowAssign(null);
      setAssignTeacher('');
      setAssignBatch('');
      loadData();
    } catch(e) {
      const errData = e.response?.data;
      const msg = errData?.detail
        || errData?.message
        || Object.values(errData || {}).flat().filter(v => typeof v === 'string').join(' ')
        || 'Assignment failed';
      toast.error(msg);
      console.error('Assign error:', errData);
    } finally { setSaving(false); }
  };

  const [assignBatch, setAssignBatch] = useState('');

  if (selectedBatch) return <BatchDetailView batch={selectedBatch} center={center} onBack={() => setSelectedBatch(null)} />;

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition"><FiArrowLeft className="w-4 h-4"/></button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{course.course_title}</h2>
          <p className="text-sm text-gray-400">{course.duration} weeks · ৳{course.fee}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[['batches','Batches'],['subjects','Subjects & Teachers']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab===k ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>{l}</button>
        ))}
      </div>

      {loading ? <Loading /> : tab === 'batches' ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowBatch(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <FiPlus className="w-4 h-4"/><span>Add Batch</span>
            </button>
          </div>
          {batches.length === 0 ? <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">No batches yet</div> :
            batches.map(b => (
              <div key={b.batch_id} onClick={() => setSelectedBatch(b)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition">{b.batch_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.batch_code} · {b.class_shift} shift · {b.batch_type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge text={b.status} color={statusColor(b.status)}/>
                    <FiChevronRight className="text-gray-300 group-hover:text-blue-500 transition"/>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                  <span><FiCalendar className="inline w-3 h-3 mr-1"/>{b.start_date} → {b.end_date}</span>
                  <span className="font-semibold text-gray-600">{b.enrolled_count}/{b.max_students} students</span>
                  {b.is_full && <Badge text="Full" color="red"/>}
                </div>
              </div>
            ))
          }
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowSubject(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <FiPlus className="w-4 h-4"/><span>Add Subject</span>
            </button>
          </div>
          {subjects.length === 0 ? <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">No subjects yet</div> :
            subjects.map(s => (
              <div key={s.subject_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{s.subject_name}</p>
                    <p className="text-xs text-gray-400">{s.subject_code}</p>
                  </div>
                  <button onClick={() => { setShowAssign(s); setAssignTeacher(''); setAssignBatch(''); }}
                    className="flex items-center space-x-1 text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1.5 rounded-lg font-medium transition">
                    <FiUserPlus className="w-3.5 h-3.5"/><span>Assign Teacher</span>
                  </button>
                </div>
                {s.assignments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No teacher assigned yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {s.assignments.map(a => (
                      <div key={a.assignment_id} className="flex items-center justify-between bg-violet-50 rounded-xl px-3 py-2 text-xs">
                        <span className="font-medium text-violet-800">{a.teacher_name}</span>
                        <span className="text-violet-500">{a.batch_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {/* Add Batch Modal */}
      <Modal open={showBatch} title="Add Batch" onClose={() => setShowBatch(false)} wide>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Field label="Batch Name" required><input className={inputCls} value={batchForm.batch_name} onChange={e=>setBatchForm(p=>({...p,batch_name:e.target.value}))} placeholder="e.g. HSC Batch A"/></Field></div>
          <Field label="Batch Code" required><input className={inputCls} value={batchForm.batch_code} onChange={e=>setBatchForm(p=>({...p,batch_code:e.target.value}))} placeholder="BATCH-2025-A"/></Field>
          <Field label="Max Students"><input className={inputCls} type="number" value={batchForm.max_students} onChange={e=>setBatchForm(p=>({...p,max_students:e.target.value}))}/></Field>
          <Field label="Type">
            <select className={inputCls} value={batchForm.batch_type} onChange={e=>setBatchForm(p=>({...p,batch_type:e.target.value}))}>
              <option value="regular">Regular</option><option value="crash">Crash</option><option value="online">Online</option>
            </select>
          </Field>
          <Field label="Shift">
            <select className={inputCls} value={batchForm.class_shift} onChange={e=>setBatchForm(p=>({...p,class_shift:e.target.value}))}>
              <option value="morning">Morning</option><option value="day">Day</option><option value="evening">Evening</option><option value="night">Night</option>
            </select>
          </Field>
          <Field label="Start Date" required><input className={inputCls} type="date" value={batchForm.start_date} onChange={e=>setBatchForm(p=>({...p,start_date:e.target.value}))}/></Field>
          <Field label="End Date" required><input className={inputCls} type="date" value={batchForm.end_date} onChange={e=>setBatchForm(p=>({...p,end_date:e.target.value}))}/></Field>
        </div>
        <div className="flex space-x-3 mt-5">
          <button onClick={()=>setShowBatch(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={addBatch} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">{saving?'Creating...':'Create Batch'}</button>
        </div>
      </Modal>

      {/* Add Subject Modal */}
      <Modal open={showSubject} title="Add Subject" onClose={() => setShowSubject(false)}>
        <div className="space-y-4">
          <Field label="Subject Name" required><input className={inputCls} value={subjectForm.subject_name} onChange={e=>setSubjectForm(p=>({...p,subject_name:e.target.value}))} placeholder="e.g. Physics"/></Field>
          <Field label="Subject Code" required><input className={inputCls} value={subjectForm.subject_code} onChange={e=>setSubjectForm(p=>({...p,subject_code:e.target.value}))} placeholder="e.g. PHY-101"/></Field>
          <div className="flex space-x-3">
            <button onClick={()=>setShowSubject(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={addSubject} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">{saving?'Creating...':'Create'}</button>
          </div>
        </div>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal open={!!showAssign} title={`Assign Teacher — ${showAssign?.subject_name}`} onClose={() => setShowAssign(null)}>
        <div className="space-y-4">
          <Field label="Select Batch" required>
            <select className={inputCls} value={assignBatch} onChange={e => setAssignBatch(e.target.value)}>
              <option value="">Choose batch...</option>
              {batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>)}
            </select>
          </Field>
          <Field label="Select Teacher" required>
            <select className={inputCls} value={assignTeacher} onChange={e => setAssignTeacher(e.target.value)}>
              <option value="">Choose teacher...</option>
              {teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.name}</option>)}
            </select>
          </Field>
          <div className="flex space-x-3">
            <button onClick={() => setShowAssign(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={() => doAssignTeacher(showAssign, assignBatch)} disabled={saving} className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">{saving?'Assigning...':'Assign'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ── Batch Detail View (Students with stats) ───────────────────────────────────
const BatchDetailView = ({ batch, center, onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [banTarget, setBanTarget] = useState(null);
  const [banning, setBanning] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/academics/batches/${batch.batch_id}/students/detail/`);
      setStudents(r.data.data?.students || []);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  }, [batch.batch_id]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const enrollStudent = async () => {
    if (!enrollEmail.trim()) return toast.error('Enter student email');
    setEnrolling(true);
    try {
      // Find student by looking up members
      const res = await api.get(`/centers/${center.coaching_center_id}/members/?role=student`);
      const students_list = res.data.data?.students || [];
      const found = students_list.find(s => s.email === enrollEmail.trim());
      if (!found) return toast.error('Student not found in center. Add them first.');
      await api.post(`/academics/batches/${batch.batch_id}/enroll/`, { student: found.user_id });
      toast.success('Student enrolled!');
      setEnrollEmail('');
      loadStudents();
    } catch(e) { toast.error(e.response?.data?.non_field_errors?.[0] || e.response?.data?.detail || 'Failed'); }
    finally { setEnrolling(false); }
  };

  const doBan = async () => {
    setBanning(true);
    try {
      const isBanned = banTarget.enrollment_status === 'dropped';
      await api.post(`/academics/enrollments/${banTarget.enrollment_id}/${isBanned ? 'unban' : 'ban'}/`);
      toast.success(isBanned ? 'Student unbanned.' : 'Student banned.');
      setBanTarget(null);
      loadStudents();
    } catch { toast.error('Failed'); } finally { setBanning(false); }
  };

  if (selected) return <StudentProfileView student={selected} batch={batch} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition"><FiArrowLeft className="w-4 h-4"/></button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{batch.batch_name}</h2>
          <p className="text-sm text-gray-400">{batch.batch_code} · {batch.class_shift} · <Badge text={batch.status} color={statusColor(batch.status)}/></p>
        </div>
      </div>

      {/* Enroll student */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Enroll Student</p>
        <div className="flex space-x-2">
          <input className={inputCls+' flex-1'} placeholder="Student email address" value={enrollEmail} onChange={e=>setEnrollEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&enrollStudent()}/>
          <button onClick={enrollStudent} disabled={enrolling} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex-shrink-0">
            {enrolling ? '...' : 'Enroll'}
          </button>
        </div>
      </div>

      {/* Students list */}
      {loading ? <Loading /> : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 text-center text-gray-400"><FiUsers className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>No students enrolled yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Student','Contact','Status','Exams Attended','Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map(s => (
                <tr key={s.enrollment_id} className={`hover:bg-gray-50 transition ${s.enrollment_status==='dropped'?'opacity-60':''}`}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{s.student.name}</p>
                    <p className="text-xs text-gray-400">{s.student.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{s.student.phone || '—'}</td>
                  <td className="px-5 py-4"><Badge text={s.enrollment_status} color={statusColor(s.enrollment_status)}/></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${s.stats.attendance_pct}%`}}/>
                      </div>
                      <span className="text-xs text-gray-500">{s.stats.exams_attended}/{s.stats.total_exams}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => setSelected(s)} title="View profile" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"><FiEye className="w-4 h-4"/></button>
                      <button
                        onClick={() => setBanTarget(s)}
                        title={s.enrollment_status==='dropped'?'Unban':'Ban'}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${s.enrollment_status==='dropped'?'hover:bg-green-50 text-gray-400 hover:text-green-600':'hover:bg-red-50 text-gray-400 hover:text-red-600'}`}>
                        {s.enrollment_status==='dropped'?<FiCheckCircle className="w-4 h-4"/>:<FiSlash className="w-4 h-4"/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            {students.filter(s=>s.enrollment_status==='active').length} active · {students.filter(s=>s.enrollment_status==='dropped').length} banned
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!banTarget}
        title={banTarget?.enrollment_status==='dropped' ? 'Unban Student' : 'Ban Student'}
        message={banTarget?.enrollment_status==='dropped'
          ? `Re-activate ${banTarget?.student?.name} in this batch?`
          : `Ban ${banTarget?.student?.name} from this batch? They will lose access.`}
        confirmLabel={banTarget?.enrollment_status==='dropped' ? 'Unban' : 'Ban'}
        confirmClass={banTarget?.enrollment_status==='dropped' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
        onConfirm={doBan}
        onCancel={() => setBanTarget(null)}
        loading={banning}
      />
    </div>
  );
};

// ── Student Profile View ───────────────────────────────────────────────────────
const FiEye = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;

const StudentProfileView = ({ student: enrollment, batch, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/academics/students/${enrollment.student.user_id}/batch/${batch.batch_id}/profile/`)
      .then(r => setProfile(r.data.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [enrollment.student.user_id, batch.batch_id]);

  if (loading) return <Loading />;

  const s = profile?.student || enrollment.student;
  const stats = profile?.stats || enrollment.stats;
  const results = profile?.exam_results || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition"><FiArrowLeft className="w-4 h-4"/></button>
        <h2 className="text-xl font-bold text-gray-800">Student Profile</h2>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FiUser className="w-7 h-7 text-blue-600"/>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{s.name}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{s.email}</p>
            {s.phone && <p className="text-sm text-gray-400">{s.phone}</p>}
          </div>
          <Badge text={enrollment.enrollment_status} color={statusColor(enrollment.enrollment_status)}/>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.exams_attended}</p>
            <p className="text-xs text-gray-400 mt-0.5">Exams Attended</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total_exams}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Exams</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${stats.attendance_pct >= 75 ? 'text-emerald-600' : stats.attendance_pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{stats.attendance_pct}%</p>
            <p className="text-xs text-gray-400 mt-0.5">Attendance</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="bg-gray-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${stats.attendance_pct >= 75 ? 'bg-emerald-500' : stats.attendance_pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{width:`${stats.attendance_pct}%`}}/>
          </div>
        </div>
      </div>

      {/* Exam results */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">Exam Results</h3>
        {results.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No exam records yet</p>
        ) : (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={r.result_id || i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.exam_title}</p>
                  <p className="text-xs text-gray-400">{r.subject}</p>
                </div>
                <div className="text-right">
                  {r.score !== null && <p className="font-bold text-gray-800">{r.score}</p>}
                  {r.result_status && <Badge text={r.result_status} color={r.result_status==='pass'?'green':'red'}/>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const TeachersTab = ({ center }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [search, setSearch] = useState('');
  const cid = center?.coaching_center_id;

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get(`/centers/${cid}/members/?role=teacher`); setTeachers(r.data.data?.teachers || []); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  }, [cid]);

  useEffect(() => { if (cid) load(); }, [load, cid]);

  const add = async () => {
    if (!email.trim()) return toast.error('Enter email');
    setSaving(true);
    try { await api.post(`/centers/${cid}/members/add-teacher/`, { email }); toast.success('Teacher added!'); setEmail(''); setShowAdd(false); load(); }
    catch(e) { toast.error(e.response?.data?.email?.[0] || e.response?.data?.detail || 'Failed'); } finally { setSaving(false); }
  };

  const remove = async () => {
    setRemoving(true);
    try { await api.delete(`/centers/${cid}/members/${removeTarget.user_id}/remove/`); toast.success('Teacher removed.'); setRemoveTarget(null); load(); }
    catch { toast.error('Failed'); } finally { setRemoving(false); }
  };

  const filtered = teachers.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Teachers <span className="text-gray-400 font-normal text-base">({teachers.length})</span></h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm">
          <FiUserPlus className="w-4 h-4"/><span>Add Teacher</span>
        </button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-3 text-gray-400 w-4 h-4"/>
        <input className={inputCls+' pl-10'} placeholder="Search teachers..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400"><FiUsers className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>No teachers yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name','Email','Phone','Joined',''].map(h=><th key={h} className={`px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h===''?'text-right':'text-left'}`}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.membership_id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-semibold text-gray-800">{t.name}</td>
                  <td className="px-5 py-4 text-gray-400">{t.email}</td>
                  <td className="px-5 py-4 text-gray-400">{t.phone||'—'}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(t.joined_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={()=>setRemoveTarget(t)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition ml-auto"><FiTrash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAdd} title="Add Teacher" onClose={()=>setShowAdd(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Enter the email of a registered teacher to add them to your center.</p>
          <Field label="Teacher Email" required><input className={inputCls} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="teacher@example.com"/></Field>
          <div className="flex space-x-3">
            <button onClick={()=>setShowAdd(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={add} disabled={saving} className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">{saving?'Adding...':'Add Teacher'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!removeTarget} title="Remove Teacher" message={`Remove ${removeTarget?.name} from your center?`} confirmLabel="Remove" onConfirm={remove} onCancel={()=>setRemoveTarget(null)} loading={removing}/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const StudentsTab = ({ center }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [search, setSearch] = useState('');
  const cid = center?.coaching_center_id;

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get(`/centers/${cid}/members/?role=student`); setStudents(r.data.data?.students || []); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  }, [cid]);

  useEffect(() => { if (cid) load(); }, [load, cid]);

  const add = async () => {
    if (!email.trim()) return toast.error('Enter email');
    setSaving(true);
    try { await api.post(`/centers/${cid}/members/add-student/`, { email }); toast.success('Student added!'); setEmail(''); setShowAdd(false); load(); }
    catch(e) { toast.error(e.response?.data?.email?.[0] || e.response?.data?.detail || 'Failed'); } finally { setSaving(false); }
  };

  const remove = async () => {
    setRemoving(true);
    try { await api.delete(`/centers/${cid}/members/${removeTarget.user_id}/remove/`); toast.success('Removed.'); setRemoveTarget(null); load(); }
    catch { toast.error('Failed'); } finally { setRemoving(false); }
  };

  const filtered = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Students <span className="text-gray-400 font-normal text-base">({students.length})</span></h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm">
          <FiUserPlus className="w-4 h-4"/><span>Add Student</span>
        </button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-3 text-gray-400 w-4 h-4"/>
        <input className={inputCls+' pl-10'} placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400"><FiUsers className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>No students yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name','Email','Phone','Joined',''].map(h=><th key={h} className={`px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h===''?'text-right':'text-left'}`}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.membership_id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-semibold text-gray-800">{s.name}</td>
                  <td className="px-5 py-4 text-gray-400">{s.email}</td>
                  <td className="px-5 py-4 text-gray-400">{s.phone||'—'}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(s.joined_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={()=>setRemoveTarget(s)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition ml-auto"><FiTrash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAdd} title="Add Student" onClose={()=>setShowAdd(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Enter the email of a registered student to add them to your center.</p>
          <Field label="Student Email" required><input className={inputCls} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com"/></Field>
          <div className="flex space-x-3">
            <button onClick={()=>setShowAdd(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={add} disabled={saving} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">{saving?'Adding...':'Add Student'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!removeTarget} title="Remove Student" message={`Remove ${removeTarget?.name} from your center?`} confirmLabel="Remove" onConfirm={remove} onCancel={()=>setRemoveTarget(null)} loading={removing}/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { key: 'overview',  label: 'Overview',  icon: FiHome },
  { key: 'courses',   label: 'Courses',   icon: FiBook },
  { key: 'teachers',  label: 'Teachers',  icon: FiUsers },
  { key: 'students',  label: 'Students',  icon: FiUsers },
];

const CoachingAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/centers/mine/').then(r => setCenter(r.data.data)).catch(() => setCenter(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Coaching Dashboard</h1>
        {center
          ? <p className="text-gray-400 text-sm mt-0.5">{center.center_name} · {center.location}</p>
          : <p className="text-amber-600 text-sm mt-0.5 flex items-center space-x-1"><FiAlertTriangle className="w-4 h-4"/><span>No approved center found. Contact system admin.</span></p>
        }
      </div>

      {/* Tab bar */}
      <div className="flex space-x-1 border-b border-gray-100 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}>
            <Icon className="w-4 h-4"/><span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview'  && <OverviewTab  center={center} />}
      {activeTab === 'courses'   && <CoursesTab   center={center} />}
      {activeTab === 'teachers'  && <TeachersTab  center={center} />}
      {activeTab === 'students'  && <StudentsTab  center={center} />}
    </div>
  );
};

export default CoachingAdminDashboard;
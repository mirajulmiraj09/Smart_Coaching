import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiBook, FiUsers, FiFileText, FiAward, FiPlus, FiTrash2,
  FiPlay, FiSquare, FiChevronRight, FiX, FiCheck,
  FiDownload, FiCpu, FiArrowLeft, FiSearch,
  FiAlertCircle, FiRefreshCw, FiHome,
} from 'react-icons/fi';
import api from '../../services/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getErr = e => {
  const d = e?.response?.data?.data || e?.response?.data || {};
  return String(d.detail || Object.values(d).flat().filter(v=>typeof v==='string').join(' · ') || e.message || 'Error');
};

const Badge = ({ text, color='gray' }) => {
  const map = { green:'bg-emerald-100 text-emerald-700', red:'bg-rose-100 text-rose-700', blue:'bg-blue-100 text-blue-700', yellow:'bg-amber-100 text-amber-700', purple:'bg-violet-100 text-violet-700', gray:'bg-gray-100 text-gray-500' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[color]||map.gray}`}>{text}</span>;
};
const diffColor = d => ({ easy:'green', medium:'yellow', hard:'red' }[d]||'gray');
const typeColor = t => ({ mcq:'blue', true_false:'purple', descriptive:'gray' }[t]||'gray');

const Modal = ({ open, title, onClose, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide?'max-w-3xl':'max-w-md'} max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><FiX size={16}/></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}{required&&<span className="text-red-400 ml-1">*</span>}</label>
    {children}
  </div>
);
const inp = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition';

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
const OverviewTab = ({ dash }) => {
  if (!dash) return <Loading/>;
  const stats = [
    { label:'Subjects',  value:dash.total_subjects,  color:'blue',   icon:FiBook },
    { label:'Batches',   value:dash.total_batches,   color:'purple', icon:FiUsers },
    { label:'Students',  value:dash.total_students,  color:'green',  icon:FiUsers },
    { label:'Exams',     value:dash.total_exams,     color:'orange', icon:FiAward },
    { label:'Questions', value:dash.total_questions, color:'pink',   icon:FiFileText },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(({label,value,color,icon:Icon})=>(
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color==='blue'?'bg-blue-100':color==='purple'?'bg-violet-100':color==='green'?'bg-emerald-100':color==='orange'?'bg-orange-100':'bg-pink-100'}`}>
              <Icon className={`w-4 h-4 ${color==='blue'?'text-blue-600':color==='purple'?'text-violet-600':color==='green'?'text-emerald-600':color==='orange'?'text-orange-600':'text-pink-600'}`}/>
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">My Assignments</h3>
        {dash.assignments.length===0 ? <p className="text-gray-400 text-sm">No assignments yet. Contact your coaching admin.</p> :
          <div className="space-y-2">
            {dash.assignments.map(a=>(
              <div key={a.assignment_id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FiBook className="w-4 h-4 text-blue-600"/>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{a.subject_name}</p>
                    <p className="text-xs text-gray-400">{a.course_title} · {a.batch_name} {a.center_name ? `· ${a.center_name}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge text={a.batch_status} color={a.batch_status==='running'?'green':a.batch_status==='upcoming'?'blue':'gray'}/>
                  <span className="text-xs text-gray-400">{a.enrolled_count} students</span>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COURSE DETAIL MODAL (with assignments, live classes, quizzes, notifications)
// ═══════════════════════════════════════════════════════════════════════════════
const CourseDetailModal = ({ open, course, subjects, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [liveClasses, setLiveClasses] = useState([]);
  const [showNewClass, setShowNewClass] = useState(false);
  const [showNewNotif, setShowNewNotif] = useState(false);
  const [showQuizCreation, setShowQuizCreation] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const [classForm, setClassForm] = useState({ 
    title: '', batch_id: '', class_date: '', start_time: '', duration_minutes: 30, topic: '' 
  });
  const [notifForm, setNotifForm] = useState({ 
    batch_id: '', message: '', type: 'announcement', use_ai: false, ai_prompt: '' 
  });

  // Load live classes and question bank
  useEffect(() => {
    if (!open || !course) return;
    api.get(`/teaching/courses/${course.course_id}/live-classes/`)
      .then(r => setLiveClasses(r.data.data?.results || []))
      .catch(() => setLiveClasses([]));
    api.get('/teaching/teacher/questions/', { params: { subject_id: subjects[0]?.subject_id } })
      .then(r => setBankQuestions(r.data.data?.results || []))
      .catch(() => setBankQuestions([]));
  }, [open, course, subjects]);

  const batches = [...new Map(subjects.map(s => [s.batch_id, s])).values()];

  const createLiveClass = async () => {
    if (!classForm.title || !classForm.batch_id || !classForm.class_date) return toast.error('Fill required fields');
    setSaving(true);
    try {
      await api.post('/teaching/live-classes/', { ...classForm, course_id: course.course_id });
      toast.success('Live class scheduled!');
      setShowNewClass(false);
      setClassForm({ title: '', batch_id: '', class_date: '', start_time: '', duration_minutes: 30, topic: '' });
      // Reload
      const r = await api.get(`/teaching/courses/${course.course_id}/live-classes/`);
      setLiveClasses(r.data.data?.results || []);
    } catch(e) { toast.error(getErr(e)); }
    finally { setSaving(false); }
  };

  const sendNotification = async () => {
    if (!notifForm.batch_id || !notifForm.message) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const payload = { ...notifForm, course_id: course.course_id };
      if (notifForm.use_ai) {
        // Generate AI notification
        const prompt = `You are a helpful teacher assistant. Generate a professional notification message for students based on this: "${notifForm.ai_prompt}". Keep it concise and encouraging.`;
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            model: 'claude-sonnet-4-20250514', 
            max_tokens: 200, 
            messages: [{ role: 'user', content: prompt }] 
          }),
        });
        const aiData = await aiRes.json();
        const aiMessage = aiData.content?.find(c => c.type === 'text')?.text || notifForm.message;
        payload.message = aiMessage;
      }
      await api.post('/teaching/notifications/', payload);
      toast.success('Notification sent to students!');
      setShowNewNotif(false);
      setNotifForm({ batch_id: '', message: '', type: 'announcement', use_ai: false, ai_prompt: '' });
    } catch(e) { toast.error(getErr(e)); }
    finally { setSaving(false); }
  };

  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{course.course_title}</h2>
            <p className="text-xs text-gray-400 mt-1">{subjects.length} subject(s) · {batches.length} batch(es)</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <FiX className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-gray-100 px-6 bg-gray-50">
          {[
            { key: 'overview', label: 'Overview', icon: FiBook },
            { key: 'assignments', label: 'Assignments', icon: FiUsers },
            { key: 'classes', label: 'Live Classes', icon: FiPlay },
            { key: 'quizzes', label: 'Quizzes', icon: FiAward },
            { key: 'notifications', label: 'Notifications', icon: FiAlertCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Subjects</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{subjects.length}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Batches</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{batches.length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Total Students</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {subjects.reduce((sum, s) => sum + (s.enrolled_count || 0), 0)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-gray-800 mb-3">Subjects in this Course</h3>
                <div className="space-y-2">
                  {subjects.map(s => (
                    <div key={s.assignment_id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{s.subject_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {s.subject_code} · Batch: {s.batch_name} ({s.batch_type})
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge text={s.batch_status} color={s.batch_status === 'running' ? 'green' : 'blue'} />
                        <p className="text-xs text-gray-500 mt-1">{s.enrolled_count} students</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  ✓ You're assigned to <strong>{subjects.length} subject(s)</strong> in this course
                </p>
              </div>
              <h3 className="font-bold text-gray-800">Your Subject Assignments</h3>
              <div className="space-y-2">
                {subjects.map(s => (
                  <div key={s.assignment_id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{s.subject_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Code: {s.subject_code} | Batch: {s.batch_name} | Type: {s.batch_type}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Status: {s.batch_status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">{s.enrolled_count} students</p>
                        <button className="mt-2 text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIVE CLASSES TAB */}
          {activeTab === 'classes' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowNewClass(true)}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition"
              >
                <FiPlus className="w-4 h-4" />
                <span>Schedule Live Class</span>
              </button>

              {liveClasses.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 py-8 text-center text-gray-400">
                  <FiPlay className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No live classes scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveClasses.map(lc => (
                    <div key={lc.class_id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{lc.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {lc.class_date} at {lc.start_time} · {lc.duration_minutes} mins
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Topic: {lc.topic}</p>
                        </div>
                        <div className="flex space-x-2">
                          {lc.status === 'scheduled' && (
                            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium">
                              Start
                            </button>
                          )}
                          {lc.status === 'ongoing' && (
                            <Badge text="LIVE NOW" color="green" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Schedule Class Modal */}
              {showNewClass && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
                    <h3 className="font-bold text-gray-800">Schedule Live Class</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Class Title</label>
                        <input
                          className={inp + ' mt-1'}
                          value={classForm.title}
                          onChange={e => setClassForm(p => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. Introduction to Physics"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Batch</label>
                        <select className={inp + ' mt-1'} value={classForm.batch_id} onChange={e => setClassForm(p => ({ ...p, batch_id: e.target.value }))}>
                          <option value="">Select batch...</option>
                          {batches.map(b => (
                            <option key={b.batch_id} value={b.batch_id}>
                              {b.batch_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                        <input
                          className={inp + ' mt-1'}
                          type="date"
                          value={classForm.class_date}
                          onChange={e => setClassForm(p => ({ ...p, class_date: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Start Time</label>
                          <input
                            className={inp + ' mt-1'}
                            type="time"
                            value={classForm.start_time}
                            onChange={e => setClassForm(p => ({ ...p, start_time: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Duration (mins)</label>
                          <input
                            className={inp + ' mt-1'}
                            type="number"
                            value={classForm.duration_minutes}
                            onChange={e => setClassForm(p => ({ ...p, duration_minutes: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Topic</label>
                        <input
                          className={inp + ' mt-1'}
                          value={classForm.topic}
                          onChange={e => setClassForm(p => ({ ...p, topic: e.target.value }))}
                          placeholder="What will you teach..."
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => setShowNewClass(false)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createLiveClass}
                        disabled={saving}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        {saving ? 'Scheduling...' : 'Schedule'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowQuizCreation(true)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create Quiz</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl font-medium transition">
                  <FiPlay className="w-4 h-4" />
                  <span>Create Live Quiz</span>
                </button>
              </div>
              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-8 text-center text-gray-400">
                <FiAward className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No quizzes created yet</p>
                <p className="text-xs mt-1">Click above to create your first quiz</p>
              </div>

              {/* Quiz Creation Modal */}
              {showQuizCreation && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
                    <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                      <h3 className="font-bold text-gray-800">Create Quiz from Question Bank</h3>
                      <button onClick={() => { setShowQuizCreation(false); setSelectedQuestions([]); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <FiX className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Total Questions:</strong> {bankQuestions.length} | <strong>Selected:</strong> {selectedQuestions.length}
                        </p>
                      </div>

                      {bankQuestions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p>No questions in your question bank yet</p>
                          <p className="text-xs mt-1">Create questions first in the Questions tab</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {bankQuestions.map((q) => (
                            <div
                              key={q.question_id}
                              className={`border rounded-lg p-3 cursor-pointer transition ${
                                selectedQuestions.includes(q.question_id)
                                  ? 'bg-blue-50 border-blue-400'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                              onClick={() => {
                                setSelectedQuestions(prev =>
                                  prev.includes(q.question_id)
                                    ? prev.filter(id => id !== q.question_id)
                                    : [...prev, q.question_id]
                                );
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedQuestions.includes(q.question_id)}
                                  onChange={() => {}}
                                  className="w-4 h-4 mt-0.5"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">{q.question_text}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge text={q.question_type.replace('_', ' ')} color={typeColor(q.question_type)} />
                                    <Badge text={q.difficulty} color={diffColor(q.difficulty)} />
                                    <span className="text-xs text-gray-400">{q.max_marks}m</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex space-x-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => { setShowQuizCreation(false); setSelectedQuestions([]); }}
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (selectedQuestions.length === 0) {
                              toast.error('Select at least one question');
                              return;
                            }
                            toast.success(`Quiz created with ${selectedQuestions.length} questions!`);
                            setShowQuizCreation(false);
                            setSelectedQuestions([]);
                          }}
                          className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium"
                        >
                          Create Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowNewNotif(true)}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition"
              >
                <FiPlus className="w-4 h-4" />
                <span>Send Notification</span>
              </button>

              {showNewNotif && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Select Batch</label>
                    <select className={inp + ' mt-1'} value={notifForm.batch_id} onChange={e => setNotifForm(p => ({ ...p, batch_id: e.target.value }))}>
                      <option value="">Select batch...</option>
                      {batches.map(b => (
                        <option key={b.batch_id} value={b.batch_id}>
                          {b.batch_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Type</label>
                    <select className={inp + ' mt-1'} value={notifForm.type} onChange={e => setNotifForm(p => ({ ...p, type: e.target.value }))}>
                      <option value="announcement">Announcement</option>
                      <option value="assignment">Assignment</option>
                      <option value="exam">Exam</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="useAI"
                        checked={notifForm.use_ai}
                        onChange={e => setNotifForm(p => ({ ...p, use_ai: e.target.checked }))}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="useAI" className="text-sm font-semibold text-gray-700">
                        🤖 Use AI to Generate Professional Message
                      </label>
                    </div>

                    {notifForm.use_ai ? (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">AI Prompt</label>
                        <textarea
                          className={inp + ' mt-1 resize-none'}
                          rows={3}
                          value={notifForm.ai_prompt}
                          onChange={e => setNotifForm(p => ({ ...p, ai_prompt: e.target.value }))}
                          placeholder="e.g. Remind students about tomorrow's physics exam at 3 PM and study tips..."
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          AI will create a professional message based on your prompt
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">Message</label>
                        <textarea
                          className={inp + ' mt-1 resize-none'}
                          rows={3}
                          value={notifForm.message}
                          onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))}
                          placeholder="Write your notification message..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 border-t border-gray-300 pt-3">
                    <button
                      onClick={() => setShowNewNotif(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendNotification}
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? 'Sending...' : 'Send to Students'}
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-dashed border-gray-300 py-8 text-center text-gray-400">
                <FiAlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No notifications sent yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: MY CENTER (with course details & subject-wise quiz creation)
// ═══════════════════════════════════════════════════════════════════════════════
const MyCenterTab = ({ dash }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (!dash) return <Loading />;

  const assignments = dash?.assignments || [];
  const myCenters = dash?.my_centers || [];

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 1: Has subject assignments → Show grouped by center + course
  // ──────────────────────────────────────────────────────────────────────────
  if (assignments.length > 0) {
    // Group by center_name → course_title
    const byCenter = {};
    assignments.forEach(a => {
      const center = a.center_name || 'Unassigned Center';
      if (!byCenter[center]) byCenter[center] = {};
      if (!byCenter[center][a.course_title]) byCenter[center][a.course_title] = [];
      byCenter[center][a.course_title].push(a);
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <FiHome className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800">My Assigned Centers</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {Object.keys(byCenter).length} center(s)
          </span>
        </div>

        {Object.entries(byCenter).map(([centerName, courseMap]) => (
          <div key={centerName} className="space-y-4">
            {/* Center Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                🏫 Coaching Center
              </p>
              <h3 className="text-2xl font-bold">{centerName}</h3>
              <div className="flex items-center space-x-4 mt-3 text-sm text-blue-100">
                <span>📚 {Object.values(courseMap).flat().length} subjects</span>
                <span>👥 {Object.values(courseMap).flat().reduce((sum, a) => sum + (a.enrolled_count || 0), 0)} students</span>
              </div>
            </div>

            {/* Courses in this center */}
            <div className="space-y-4">
              {Object.entries(courseMap).map(([courseTitle, assigns]) => (
                <div key={courseTitle} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer"
                  onClick={() => {
                    setSelectedCourse({ 
                      center_id: assigns[0].center_id, 
                      center_name: centerName, 
                      course_id: assigns[0].course_id, 
                      course_title: courseTitle 
                    });
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <FiBook className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{courseTitle}</p>
                        <p className="text-xs text-gray-400">
                          Course · {assigns.length} subject(s)
                        </p>
                      </div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Quick preview of subjects */}
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                    {assigns.slice(0, 3).map(a => (
                      <div key={a.assignment_id} className="text-xs text-gray-500 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>{a.subject_name} ({a.subject_code})</span>
                      </div>
                    ))}
                    {assigns.length > 3 && <div className="text-xs text-gray-400 italic">+{assigns.length - 3} more</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Course Detail Modal */}
        <CourseDetailModal
          open={!!selectedCourse}
          course={selectedCourse}
          subjects={selectedCourse ? Object.entries(byCenter).flatMap(([centerName, courseMap]) =>
            courseMap[selectedCourse.course_title] || []
          ) : []}
          onClose={() => setSelectedCourse(null)}
        />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 2: No assignments yet BUT has centers → Show centers with courses
  // ──────────────────────────────────────────────────────────────────────────
  if (myCenters.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <FiHome className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800">My Coaching Centers</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {myCenters.length} center(s)
          </span>
        </div>

        {/* Information banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-800">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No subject assignments yet</p>
              <p className="text-sm mt-1">
                You're registered in the centers below. Once your coaching admin assigns you to subjects, you can view them and create quizzes.
              </p>
            </div>
          </div>
        </div>

        {/* Centers with courses */}
        {myCenters.map(center => (
          <div key={center.center_id} className="space-y-4">
            {/* Center Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                🏫 Coaching Center
              </p>
              <h3 className="text-2xl font-bold">{center.center_name}</h3>
              <div className="flex items-center space-x-4 mt-3 text-sm text-blue-100">
                <span>📚 {center.courses.length} course(s) offered</span>
              </div>
            </div>

            {/* Courses */}
            <div className="grid gap-3">
              {center.courses.map(course => (
                <div
                  key={course.course_id}
                  className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-4 cursor-pointer opacity-60"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <FiBook className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{course.course_title}</p>
                      <p className="text-xs text-gray-400">Waiting for teacher assignment</p>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Course Detail Modal */}
        <CourseDetailModal
          open={!!selectedCourse}
          course={selectedCourse}
          subjects={[]}
          onClose={() => setSelectedCourse(null)}
        />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 3: No assignments AND no centers → Empty state
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
      <FiAlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
      <p className="font-semibold">Not registered in any coaching center yet</p>
      <p className="text-sm mt-1">
        Contact your coaching center admin to join their center as a teacher.
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const QuestionsTab = ({ assignments }) => {
  const [questions, setQuestions]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]         = useState(false);
  const [showAI, setShowAI]           = useState(false);
  const [saving, setSaving]           = useState(false);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [search, setSearch]           = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const subjects = [...new Map(assignments.map(a=>[a.subject_id, a])).values()];

  const [form, setForm] = useState({
    subject_id:'', question_text:'', question_type:'mcq',
    difficulty:'medium', max_marks:1,
    option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'',
    expected_answer:'',
  });

  const [aiForm, setAiForm] = useState({ subject_id:'', topic:'', count:5, difficulty:'medium', types:['mcq'] });
  const [aiResult, setAiResult]   = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // ── fetch with current filters ─────────────────────────────────────────────
  const filterRef = useRef({ subject: '', type: '' });

  const loadQuestions = async (subject='', type='') => {
    setLoading(true);
    try {
      const params = {};
      if (subject) params.subject_id = subject;
      if (type)    params.type = type;
      const r = await api.get('/teaching/teacher/questions/', { params });
      setQuestions(r.data.data?.results || []);
    } catch { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  // Run once on mount only
  useEffect(() => { loadQuestions(); }, []); // eslint-disable-line

  // Run when filter changes (user action, not re-render)
  const applyFilter = (subject, type) => {
    filterRef.current = { subject, type };
    loadQuestions(subject, type);
  };

  const add = async () => {
    if (!form.subject_id || !form.question_text || !form.question_type) return toast.error('Fill required fields');
    setSaving(true);
    try {
      await api.post('/teaching/teacher/questions/', form);
      toast.success('Question created!');
      setShowAdd(false);
      setForm({ subject_id:'', question_text:'', question_type:'mcq', difficulty:'medium', max_marks:1, option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'', expected_answer:'' });
      loadQuestions(filterRef.current.subject, filterRef.current.type);
    } catch(e) { toast.error(getErr(e)); }
    finally { setSaving(false); }
  };

  const del = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/teaching/teacher/questions/${deleteTarget.question_id}/`);
      toast.success('Deleted');
      setDeleteTarget(null);
      loadQuestions(filterRef.current.subject, filterRef.current.type);
    } catch(e) { toast.error(getErr(e)); }
  };

  const generateAI = async () => {
    if (!aiForm.subject_id || !aiForm.topic) return toast.error('Fill subject and topic');
    setAiLoading(true);
    setAiResult([]);
    try {
      const subjectName = subjects.find(s=>s.subject_id==aiForm.subject_id)?.subject_name || 'the subject';
      const prompt = `You are an expert teacher. Generate ${aiForm.count} ${aiForm.difficulty} ${aiForm.types.join('/')} questions for "${subjectName}" on topic: "${aiForm.topic}".
Return ONLY a valid JSON array, no markdown:
[{"question_text":"...","question_type":"mcq","difficulty":"${aiForm.difficulty}","max_marks":1,"option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_option":"a","expected_answer":""}]
For true_false: option_a="True",option_b="False",correct_option="a" or "b".
For descriptive: leave options empty, fill expected_answer.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}] }),
      });
      const data = await res.json();
      const text = data.content?.find(c=>c.type==='text')?.text || '[]';
      const clean = text.replace(/```json|```/g,'').trim();
      setAiResult(JSON.parse(clean));
      toast.success('Questions generated!');
    } catch(e) { toast.error('AI failed: '+e.message); }
    finally { setAiLoading(false); }
  };

  const saveAIQuestions = async () => {
    if (!aiResult.length || !aiForm.subject_id) return;
    setSaving(true);
    let saved = 0;
    for (const q of aiResult) {
      try { await api.post('/teaching/teacher/questions/', {...q, subject_id:parseInt(aiForm.subject_id), source:'llm'}); saved++; } catch {}
    }
    toast.success(`${saved}/${aiResult.length} saved!`);
    setSaving(false);
    setShowAI(false);
    setAiResult([]);
    loadQuestions(filterRef.current.subject, filterRef.current.type);
  };

  const filtered = questions.filter(q => !search || q.question_text.toLowerCase().includes(search.toLowerCase()));

  const downloadPDF = () => {
    if (questions.length === 0) {
      toast.error('No questions to download');
      return;
    }
    const doc = `
      QUESTION BANK - ${new Date().toLocaleDateString()}
      ═══════════════════════════════════════════════════════════════
      Total Questions: ${questions.length}
      ${filtered.length !== questions.length ? `\nFiltered: ${filtered.length}` : ''}
      ═══════════════════════════════════════════════════════════════

      ${filtered.map((q, i) => `
        ${i + 1}. ${q.question_text}
           Type: ${q.question_type.toUpperCase()} | Difficulty: ${q.difficulty} | Marks: ${q.max_marks}
           ${q.question_type === 'mcq' ? `
              A) ${q.option_a}
              B) ${q.option_b}
              C) ${q.option_c}
              D) ${q.option_d}
              Correct Answer: ${q.correct_option.toUpperCase()}
           ` : q.question_type === 'true_false' ? `
              Answer: ${q.correct_option === 'a' ? 'TRUE' : 'FALSE'}
           ` : `
              Expected Answer: ${q.expected_answer || 'N/A'}
           `}
           ───────────────────────────────────────────────────────────────
      `).join('')}
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc));
    element.setAttribute('download', `question-bank-${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Question bank downloaded!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-800">Question Bank <span className="text-gray-400 font-normal text-base">({questions.length})</span></h2>
        <div className="flex space-x-2">
          <button onClick={downloadPDF} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <FiDownload className="w-4 h-4"/><span>Download PDF</span>
          </button>
          <button onClick={()=>setShowAI(true)} className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <FiCpu className="w-4 h-4"/><span>AI Generate</span>
          </button>
          <button onClick={()=>setShowAdd(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <FiPlus className="w-4 h-4"/><span>Add Manual</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4"/>
          <input className={inp+' pl-9'} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className={inp+' w-auto'} value={filterSubject} onChange={e=>{ setFilterSubject(e.target.value); applyFilter(e.target.value, filterType); }}>
          <option value="">All Subjects</option>
          {subjects.map(s=><option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
        </select>
        <select className={inp+' w-auto'} value={filterType} onChange={e=>{ setFilterType(e.target.value); applyFilter(filterSubject, e.target.value); }}>
          <option value="">All Types</option>
          <option value="mcq">MCQ</option>
          <option value="true_false">True/False</option>
          <option value="descriptive">Descriptive</option>
        </select>
      </div>

      {loading ? <Loading/> : filtered.length===0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>No questions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q,i)=>(
            <div key={q.question_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-gray-800">{i+1}. {q.question_text}</p>
                  {q.question_type==='mcq' && (
                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-gray-500">
                      {['a','b','c','d'].map(opt=>q[`option_${opt}`]&&(
                        <span key={opt} className={`px-2 py-1 rounded-lg ${q.correct_option===opt?'bg-emerald-100 text-emerald-700 font-semibold':'bg-gray-50'}`}>
                          ({opt.toUpperCase()}) {q[`option_${opt}`]}
                        </span>
                      ))}
                    </div>
                  )}
                  {q.question_type==='true_false' && <p className="text-xs text-gray-400 mt-1">Answer: <strong>{q.correct_option==='a'?'True':'False'}</strong></p>}
                  {q.question_type==='descriptive' && q.expected_answer && <p className="text-xs text-gray-400 mt-1 line-clamp-2">Expected: {q.expected_answer}</p>}
                </div>
                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                  <div className="flex space-x-1">
                    <Badge text={q.question_type.replace('_',' ')} color={typeColor(q.question_type)}/>
                    <Badge text={q.difficulty} color={diffColor(q.difficulty)}/>
                  </div>
                  <span className="text-xs text-gray-400">{q.max_marks}m</span>
                  <button onClick={()=>setDeleteTarget(q)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition"><FiTrash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Manual Modal */}
      <Modal open={showAdd} title="Add Question Manually" onClose={()=>setShowAdd(false)} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Subject" required>
                <select className={inp} value={form.subject_id} onChange={e=>setForm(p=>({...p,subject_id:e.target.value}))}>
                  <option value="">Select subject...</option>
                  {subjects.map(s=><option key={s.subject_id} value={s.subject_id}>{s.subject_name} ({s.subject_code})</option>)}
                </select>
              </Field>
            </div>
            <Field label="Question Type" required>
              <select className={inp} value={form.question_type} onChange={e=>setForm(p=>({...p,question_type:e.target.value,correct_option:''}))}>
                <option value="mcq">MCQ</option>
                <option value="true_false">True / False</option>
                <option value="descriptive">Descriptive</option>
              </select>
            </Field>
            <Field label="Difficulty">
              <select className={inp} value={form.difficulty} onChange={e=>setForm(p=>({...p,difficulty:e.target.value}))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Question Text" required>
                <textarea className={inp+' resize-none'} rows={3} value={form.question_text} onChange={e=>setForm(p=>({...p,question_text:e.target.value}))} placeholder="Write your question..."/>
              </Field>
            </div>
            <Field label="Max Marks"><input className={inp} type="number" value={form.max_marks} onChange={e=>setForm(p=>({...p,max_marks:e.target.value}))}/></Field>
          </div>

          {form.question_type==='mcq' && (
            <div className="grid grid-cols-2 gap-3">
              {['a','b','c','d'].map(opt=>(
                <div key={opt}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Option {opt.toUpperCase()}</label>
                  <input className={inp+' mt-1'} value={form[`option_${opt}`]} onChange={e=>setForm(p=>({...p,[`option_${opt}`]:e.target.value}))} placeholder={`Option ${opt.toUpperCase()}`}/>
                </div>
              ))}
              <div className="col-span-2">
                <Field label="Correct Option">
                  <div className="flex space-x-3 mt-1">
                    {['a','b','c','d'].map(opt=>(
                      <button key={opt} onClick={()=>setForm(p=>({...p,correct_option:opt}))}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition ${form.correct_option===opt?'border-emerald-500 bg-emerald-50 text-emerald-700':'border-gray-200 text-gray-400'}`}>
                        {opt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {form.question_type==='true_false' && (
            <Field label="Correct Answer">
              <div className="flex space-x-3 mt-1">
                <button onClick={()=>setForm(p=>({...p,option_a:'True',option_b:'False',correct_option:'a'}))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${form.correct_option==='a'?'border-emerald-500 bg-emerald-50 text-emerald-700':'border-gray-200 text-gray-400'}`}>True</button>
                <button onClick={()=>setForm(p=>({...p,option_a:'True',option_b:'False',correct_option:'b'}))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${form.correct_option==='b'?'border-rose-500 bg-rose-50 text-rose-700':'border-gray-200 text-gray-400'}`}>False</button>
              </div>
            </Field>
          )}

          {form.question_type==='descriptive' && (
            <Field label="Expected Answer / Marking Guide">
              <textarea className={inp+' resize-none'} rows={3} value={form.expected_answer} onChange={e=>setForm(p=>({...p,expected_answer:e.target.value}))} placeholder="Model answer..."/>
            </Field>
          )}

          <div className="flex space-x-3 pt-2">
            <button onClick={()=>setShowAdd(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={add} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">{saving?'Saving...':'Save Question'}</button>
          </div>
        </div>
      </Modal>

      {/* AI Modal */}
      <Modal open={showAI} title="AI Question Generator" onClose={()=>{setShowAI(false);setAiResult([]);}} wide>
        <div className="space-y-4">
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-sm text-violet-700">
            🤖 Generates questions using Claude AI based on subject and topic.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Subject" required>
                <select className={inp} value={aiForm.subject_id} onChange={e=>setAiForm(p=>({...p,subject_id:e.target.value}))}>
                  <option value="">Select...</option>
                  {subjects.map(s=><option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                </select>
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Topic / Chapter" required>
                <input className={inp} value={aiForm.topic} onChange={e=>setAiForm(p=>({...p,topic:e.target.value}))} placeholder="e.g. Newton's Laws of Motion"/>
              </Field>
            </div>
            <Field label="Count">
              <select className={inp} value={aiForm.count} onChange={e=>setAiForm(p=>({...p,count:parseInt(e.target.value)}))}>
                {[3,5,10,15,20].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Difficulty">
              <select className={inp} value={aiForm.difficulty} onChange={e=>setAiForm(p=>({...p,difficulty:e.target.value}))}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </Field>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Types</label>
              <div className="flex space-x-3 mt-2">
                {['mcq','true_false','descriptive'].map(t=>(
                  <button key={t} onClick={()=>setAiForm(p=>({...p,types:p.types.includes(t)?p.types.filter(x=>x!==t):[...p.types,t]}))}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition capitalize ${aiForm.types.includes(t)?'border-violet-500 bg-violet-50 text-violet-700':'border-gray-200 text-gray-400'}`}>
                    {t.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={generateAI} disabled={aiLoading} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center space-x-2">
            <FiCpu className="w-4 h-4"/><span>{aiLoading?'Generating...':'Generate Questions'}</span>
          </button>
          {aiResult.length>0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800">{aiResult.length} generated</p>
                <button onClick={saveAIQuestions} disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                  {saving?'Saving...':'Save All to Bank'}
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {aiResult.map((q,i)=>(
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-sm">
                    <p className="font-medium text-gray-800">{i+1}. {q.question_text}</p>
                    {q.question_type==='mcq' && (
                      <div className="grid grid-cols-2 gap-1 mt-1.5 text-xs text-gray-500">
                        {['a','b','c','d'].map(opt=>q[`option_${opt}`]&&(
                          <span key={opt} className={`px-2 py-1 rounded-lg ${q.correct_option===opt?'bg-emerald-100 text-emerald-700 font-semibold':'bg-white'}`}>({opt.toUpperCase()}) {q[`option_${opt}`]}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex space-x-2 mt-1.5">
                      <Badge text={q.question_type?.replace('_',' ')} color={typeColor(q.question_type)}/>
                      <Badge text={q.difficulty} color={diffColor(q.difficulty)}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <p className="font-bold text-gray-800 mb-2">Delete Question?</p>
            <p className="text-sm text-gray-400 line-clamp-2 mb-4">{deleteTarget.question_text}</p>
            <div className="flex space-x-3">
              <button onClick={()=>setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm">Cancel</button>
              <button onClick={del} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: EXAMS
// ═══════════════════════════════════════════════════════════════════════════════
const ExamsTab = ({ assignments }) => {
  const [exams, setExams]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQids, setSelectedQids] = useState([]);
  const [step, setStep]           = useState(1);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQForm, setNewQForm] = useState({ question_text: '', question_type: 'mcq', difficulty: 'medium', max_marks: 1, option_a: '', option_b: '', option_c: '', option_d: '', correct_option: '', expected_answer: '' });

  const subjects = [...new Map(assignments.map(a=>[a.subject_id,a])).values()];
  const batches  = [...new Map(assignments.map(a=>[a.batch_id, a])).values()];

  const [form, setForm] = useState({
    subject_id:'', batch_id:'', title:'', exam_type:'regular',
    total_marks:0, pass_marks:0, duration_minutes:60, start_time:'', end_time:'',
  });

  // ── load once on mount ─────────────────────────────────────────────────────
  const loadExams = async () => {
    setLoading(true);
    try { const r = await api.get('/teaching/teacher/exams/'); setExams(r.data.data?.results||[]); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  useEffect(() => { loadExams(); }, []); // eslint-disable-line

  const loadQuestions = async (subjectId) => {
    if (!subjectId) return;
    const r = await api.get('/teaching/teacher/questions/', { params:{ subject_id:subjectId } });
    setQuestions(r.data.data?.results||[]);
  };

  const toggleQ = id => setSelectedQids(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const addNewQuestionToExam = async () => {
    if (!newQForm.question_text || !form.subject_id) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const r = await api.post('/teaching/teacher/questions/', { ...newQForm, subject_id: form.subject_id });
      const newQuestion = r.data.data;
      setQuestions(p => [...p, newQuestion]);
      setSelectedQids(p => [...p, newQuestion.question_id]);
      setShowAddQuestion(false);
      setNewQForm({ question_text: '', question_type: 'mcq', difficulty: 'medium', max_marks: 1, option_a: '', option_b: '', option_c: '', option_d: '', correct_option: '', expected_answer: '' });
      toast.success('Question added and selected!');
    } catch(e) { toast.error(getErr(e)); }
    finally { setSaving(false); }
  };

  const createExam = async () => {
    setSaving(true);
    try {
      await api.post('/teaching/teacher/exams/', {...form, question_ids:selectedQids});
      toast.success('Exam created!');
      setShowCreate(false); setStep(1); setSelectedQids([]); setQuestions([]);
      setForm({ subject_id:'', batch_id:'', title:'', exam_type:'regular', total_marks:0, pass_marks:0, duration_minutes:60, start_time:'', end_time:'' });
      loadExams();
    } catch(e) { toast.error(getErr(e)); }
    finally { setSaving(false); }
  };

  const downloadPDF = (exam) => {
    const html = `<html><head><title>${exam.title}</title>
      <style>body{font-family:Arial;padding:30px;} h1{font-size:20px;} .q{margin:16px 0;} .opts{margin-left:20px;font-size:13px;}</style>
      </head><body>
      <h1>${exam.title}</h1>
      <p>Subject: ${exam.subject_name} | Batch: ${exam.batch_name} | Duration: ${exam.duration_minutes} mins | Total: ${exam.total_marks} marks</p>
      <hr/>
      <p style="color:gray;font-size:12px">Questions loaded separately — open exam detail for question list.</p>
      </body></html>`;
    const w = window.open('','_blank');
    w.document.write(html); w.document.close(); w.print();
  };

  const startExam = async id => {
    try { await api.post(`/teaching/teacher/exams/${id}/start/`); toast.success('Exam started!'); loadExams(); }
    catch(e) { toast.error(getErr(e)); }
  };

  const endExam = async id => {
    try { await api.post(`/teaching/teacher/exams/${id}/end/`); toast.success('Exam ended!'); loadExams(); }
    catch(e) { toast.error(getErr(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Exams <span className="text-gray-400 font-normal text-base">({exams.length})</span></h2>
        <button onClick={()=>{setShowCreate(true);setStep(1);}} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
          <FiPlus className="w-4 h-4"/><span>Create Exam</span>
        </button>
      </div>

      {loading ? <Loading/> : exams.length===0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <FiAward className="w-10 h-10 mx-auto mb-2 opacity-30"/><p>No exams yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map(e=>(
            <div key={e.exam_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{e.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.subject_name} · {e.batch_name}</p>
                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                    <span>{e.question_count} questions</span>
                    <span>{e.total_marks} marks</span>
                    <span>{e.duration_minutes} mins</span>
                    {e.access_code && <span className="font-mono font-bold text-blue-600">Code: {e.access_code}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-1">
                    <Badge text={e.status} color={e.status==='ongoing'?'green':e.status==='completed'?'gray':'blue'}/>
                    <Badge text={e.exam_type.replace('_',' ')} color="purple"/>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={()=>downloadPDF(e)} title="Download PDF" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"><FiDownload className="w-3.5 h-3.5"/></button>
                    {e.status==='scheduled' && <button onClick={()=>startExam(e.exam_id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1"><FiPlay className="w-3 h-3"/><span>Start</span></button>}
                    {e.status==='ongoing'   && <button onClick={()=>endExam(e.exam_id)}   className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center space-x-1"><FiSquare className="w-3 h-3"/><span>End</span></button>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal — 2 steps */}
      <Modal open={showCreate} title={`Create Exam — Step ${step}/2`} onClose={()=>{setShowCreate(false);setStep(1);setSelectedQids([]);}} wide>
        {step===1 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Field label="Exam Title" required><input className={inp} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Mid-term Physics"/></Field></div>
              <Field label="Subject" required>
                <select className={inp} value={form.subject_id} onChange={e=>{setForm(p=>({...p,subject_id:e.target.value})); loadQuestions(e.target.value);}}>
                  <option value="">Select...</option>
                  {subjects.map(s=><option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                </select>
              </Field>
              <Field label="Batch" required>
                <select className={inp} value={form.batch_id} onChange={e=>setForm(p=>({...p,batch_id:e.target.value}))}>
                  <option value="">Select...</option>
                  {batches.map(b=><option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>)}
                </select>
              </Field>
              <Field label="Exam Type">
                <select className={inp} value={form.exam_type} onChange={e=>setForm(p=>({...p,exam_type:e.target.value}))}>
                  <option value="regular">Regular</option><option value="live_quiz">Live Quiz</option>
                </select>
              </Field>
              <Field label="Duration (mins)"><input className={inp} type="number" value={form.duration_minutes} onChange={e=>setForm(p=>({...p,duration_minutes:e.target.value}))}/></Field>
              <Field label="Total Marks"><input className={inp} type="number" value={form.total_marks} onChange={e=>setForm(p=>({...p,total_marks:e.target.value}))}/></Field>
              <Field label="Pass Marks"><input className={inp} type="number" value={form.pass_marks} onChange={e=>setForm(p=>({...p,pass_marks:e.target.value}))}/></Field>
              <Field label="Start Time"><input className={inp} type="datetime-local" value={form.start_time} onChange={e=>setForm(p=>({...p,start_time:e.target.value}))}/></Field>
              <Field label="End Time"><input className={inp} type="datetime-local" value={form.end_time} onChange={e=>setForm(p=>({...p,end_time:e.target.value}))}/></Field>
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={()=>setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
              <button onClick={()=>{if(!form.title||!form.subject_id||!form.batch_id)return toast.error('Fill required fields');setStep(2);}}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">Next →</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{selectedQids.length} selected</p>
              <button onClick={()=>setStep(1)} className="text-sm text-blue-600 flex items-center space-x-1"><FiArrowLeft className="w-3.5 h-3.5"/><span>Back</span></button>
            </div>
            {questions.length===0 ? (
              <div className="text-center py-8 text-gray-400 border border-dashed rounded-xl"><p>No questions for this subject. Add questions first.</p></div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {questions.map((q,i)=>(
                  <div key={q.question_id} onClick={()=>toggleQ(q.question_id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${selectedQids.includes(q.question_id)?'border-blue-500 bg-blue-50':'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedQids.includes(q.question_id)?'border-blue-500 bg-blue-500':'border-gray-300'}`}>
                        {selectedQids.includes(q.question_id)&&<FiCheck className="w-3 h-3 text-white"/>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{i+1}. {q.question_text}</p>
                        <div className="flex space-x-2 mt-1">
                          <Badge text={q.question_type.replace('_',' ')} color={typeColor(q.question_type)}/>
                          <Badge text={q.difficulty} color={diffColor(q.difficulty)}/>
                          <span className="text-xs text-gray-400">{q.max_marks}m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex space-x-3">
              <button onClick={()=>setStep(1)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm">Back</button>
              <button onClick={createExam} disabled={saving} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {saving?'Creating...':'Create Exam'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { key:'overview',  label:'Overview',  icon:FiHome },
  { key:'center',    label:'My Center', icon:FiBook },
  { key:'questions', label:'Questions', icon:FiFileText },
  { key:'exams',     label:'Exams',     icon:FiAward },
];

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dash, setDash]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const { user }                  = useAuthStore();
  const hasFetched                = useRef(false);   // ← prevent double-fetch

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    api.get('/teaching/teacher/dashboard/')
      .then(r => setDash(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []); // empty array = runs once only

  if (loading) return <Loading/>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome, {user?.name}</p>
        </div>
        <button onClick={() => {
          hasFetched.current = false;
          setLoading(true);
          api.get('/teaching/teacher/dashboard/')
            .then(r => setDash(r.data.data))
            .catch(() => toast.error('Failed'))
            .finally(() => setLoading(false));
        }} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition">
          <FiRefreshCw className="w-4 h-4 text-gray-500"/>
        </button>
      </div>

      <div className="flex space-x-1 border-b border-gray-100 overflow-x-auto">
        {TABS.map(({key,label,icon:Icon})=>(
          <button key={key} onClick={()=>setActiveTab(key)}
            className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab===key?'border-blue-600 text-blue-600':'border-transparent text-gray-400 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4"/><span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab==='overview'  && <OverviewTab  dash={dash}/>}
      {activeTab==='center'    && <MyCenterTab  dash={dash}/>}
      {activeTab==='questions' && <QuestionsTab assignments={dash?.assignments||[]}/>}
      {activeTab==='exams'     && <ExamsTab     assignments={dash?.assignments||[]}/>}
    </div>
  );
};

export default TeacherDashboard;

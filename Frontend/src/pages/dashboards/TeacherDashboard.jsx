import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import {
  FiBook, FiUsers, FiFileText, FiAward, FiPlus, FiTrash2,
  FiEye, FiPlay, FiSquare, FiChevronRight, FiX, FiCheck,
  FiBell, FiRefreshCw, FiAlertCircle,
} from 'react-icons/fi';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getErr = (e) => {
  const d = e?.response?.data?.data || e?.response?.data || {};
  return String(d.detail || Object.values(d).flat().filter(v => typeof v === 'string').join(' · ') || e.message || 'Something went wrong.');
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green:  'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    pink:   'bg-pink-50 text-pink-600 border-pink-100',
  };
  return (
    <div className={`rounded-xl border p-5 flex items-center gap-4 bg-white ${colors[color]}`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
};

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] flex flex-col`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
      </div>
      <div className="overflow-y-auto flex-1 p-6">{children}</div>
    </div>
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, color = 'gray' }) => {
  const c = { gray: 'bg-gray-100 text-gray-600', green: 'bg-green-100 text-green-700', blue: 'bg-blue-100 text-blue-700', orange: 'bg-orange-100 text-orange-700', red: 'bg-red-100 text-red-600' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c[color] || c.gray}`}>{label}</span>;
};

const statusColor = (s) => ({ scheduled: 'blue', ongoing: 'green', completed: 'gray' }[s] || 'gray');
const diffColor = (d) => ({ easy: 'green', medium: 'orange', hard: 'red' }[d] || 'gray');

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDash = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/teaching/teacher/dashboard/');
      setDash(res.data.data);
    } catch (e) {
      toast.error(getErr(e));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDash(); }, [loadDash]);

  const tabs = [
    { id: 'overview',   label: 'Overview',        icon: FiBook },
    { id: 'students',   label: 'Students',         icon: FiUsers },
    { id: 'questions',  label: 'Question Bank',    icon: FiFileText },
    { id: 'exams',      label: 'Exams & Quiz',     icon: FiAward },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, <span className="font-semibold text-blue-600">{user?.name}</span></p>
        </div>
        <button onClick={loadDash} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition">
          <FiRefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats */}
      {dash && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={FiBook}     label="Subjects"   value={dash.total_subjects}  color="blue" />
          <StatCard icon={FiFileText} label="Batches"    value={dash.total_batches}   color="purple" />
          <StatCard icon={FiUsers}    label="Students"   value={dash.total_students}  color="green" />
          <StatCard icon={FiAward}    label="Exams"      value={dash.total_exams}     color="orange" />
          <StatCard icon={FiFileText} label="Questions"  value={dash.total_questions} color="pink" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${tab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">Loading…</div>
      ) : (
        <>
          {tab === 'overview'  && <OverviewTab dash={dash} setTab={setTab} />}
          {tab === 'students'  && <StudentsTab dash={dash} />}
          {tab === 'questions' && <QuestionsTab dash={dash} />}
          {tab === 'exams'     && <ExamsTab dash={dash} />}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
const OverviewTab = ({ dash, setTab }) => {
  if (!dash) return null;
  return (
    <div className="space-y-6">
      {/* Assignments list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">My Subject Assignments</h2>
          <span className="text-xs text-gray-400">{dash.assignments.length} active</span>
        </div>
        {dash.assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No assignments yet. Contact your admin.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {dash.assignments.map(a => (
              <div key={a.assignment_id} className="p-4 flex items-center justify-between flex-wrap gap-3 hover:bg-gray-50 transition">
                <div>
                  <p className="font-semibold text-gray-800">{a.subject_name}
                    <span className="ml-2 text-xs text-gray-400">({a.subject_code})</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{a.course_title} · {a.batch_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500"><FiUsers className="inline mr-1" size={13} />{a.enrolled_count} students</span>
                  <Badge label={a.batch_status} color={a.batch_status === 'running' ? 'green' : a.batch_status === 'upcoming' ? 'blue' : 'gray'} />
                  <Badge label={a.batch_type} color="gray" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'View Students',    tab: 'students',   color: '#2563EB' },
            { label: 'Add Question',     tab: 'questions',  color: '#7C3AED' },
            { label: 'Create Exam',      tab: 'exams',      color: '#059669' },
          ].map(({ label, tab, color }) => (
            <button key={tab} onClick={() => setTab(tab)}
              style={{ background: color }}
              className="text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENTS TAB
// ─────────────────────────────────────────────────────────────────────────────
const StudentsTab = ({ dash }) => {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const batches = dash?.assignments || [];

  const loadStudents = async (batchId) => {
    setSelectedBatch(batchId);
    setLoading(true);
    try {
      const res = await api.get(`/teaching/teacher/batches/${batchId}/students/`);
      setStudents(res.data.data.students || []);
    } catch (e) {
      toast.error(getErr(e));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Batch selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3">Select Batch</h2>
        <div className="flex flex-wrap gap-2">
          {batches.map(a => (
            <button key={a.batch_id} onClick={() => loadStudents(a.batch_id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${selectedBatch === a.batch_id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
              {a.batch_name} <span className="text-xs opacity-70">({a.subject_name})</span>
            </button>
          ))}
          {batches.length === 0 && <p className="text-gray-400 text-sm">No batches assigned.</p>}
        </div>
      </div>

      {/* Students table */}
      {selectedBatch && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Students ({students.length})</h2>
          </div>
          {loading ? <div className="p-8 text-center text-gray-400">Loading…</div> : students.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No students enrolled.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {['#', 'Name', 'Email', 'Phone', 'Exams Taken', 'Attendance'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((s, i) => (
                    <tr key={s.user_id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.email}</td>
                      <td className="px-4 py-3 text-gray-500">{s.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-blue-600">{s.exams_taken}</span>
                        <span className="text-gray-400"> / {s.exams_total}</span>
                      </td>
                      <td className="px-4 py-3">
                        {s.exams_total > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${Math.round((s.exams_taken / s.exams_total) * 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{Math.round((s.exams_taken / s.exams_total) * 100)}%</span>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// QUESTIONS TAB
// ─────────────────────────────────────────────────────────────────────────────
const QuestionsTab = ({ dash }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  const subjects = dash?.assignments || [];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSubject !== 'all') params.set('subject_id', filterSubject);
      if (filterType !== 'all') params.set('type', filterType);
      const res = await api.get(`/teaching/teacher/questions/?${params}`);
      setQuestions(res.data.data.results || []);
    } catch (e) { toast.error(getErr(e)); }
    finally { setLoading(false); }
  }, [filterSubject, filterType]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try {
      await api.delete(`/teaching/teacher/questions/${delTarget.question_id}/`);
      toast.success('Question deleted.');
      setDelTarget(null);
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  const typeLabel = { mcq: 'MCQ', descriptive: 'Descriptive', true_false: 'True/False' };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Subjects</option>
          {[...new Map(subjects.map(a => [a.subject_id, a])).values()].map(a => (
            <option key={a.subject_id} value={a.subject_id}>{a.subject_name}</option>
          ))}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Types</option>
          <option value="mcq">MCQ</option>
          <option value="descriptive">Descriptive (CQ/Short)</option>
          <option value="true_false">True/False</option>
        </select>
        <span className="text-sm text-gray-400 ml-auto">{questions.length} questions</span>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <FiPlus size={15} /> Add Question
        </button>
      </div>

      {/* Questions list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? <div className="p-8 text-center text-gray-400">Loading…</div> : questions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No questions yet. Add your first question!</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {questions.map((q, i) => (
              <div key={q.question_id} className="p-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-400">#{i + 1}</span>
                    <Badge label={typeLabel[q.question_type] || q.question_type} color="blue" />
                    <Badge label={q.difficulty} color={diffColor(q.difficulty)} />
                    <span className="text-xs text-gray-400">{q.subject_name} · {q.max_marks} mark{q.max_marks > 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-gray-800 text-sm font-medium">{q.question_text}</p>
                  {q.question_type === 'mcq' && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {['a', 'b', 'c', 'd'].map(opt => q[`option_${opt}`] && (
                        <span key={opt} className={`text-xs px-2 py-1 rounded ${q.correct_option === opt ? 'bg-green-100 text-green-700 font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                          {opt.toUpperCase()}. {q[`option_${opt}`]}
                          {q.correct_option === opt && <FiCheck className="inline ml-1" size={11} />}
                        </span>
                      ))}
                    </div>
                  )}
                  {(q.question_type === 'descriptive' || q.question_type === 'true_false') && q.expected_answer && (
                    <p className="text-xs text-gray-400 mt-1 italic">Expected: {q.expected_answer}</p>
                  )}
                </div>
                <button onClick={() => setDelTarget(q)} className="text-red-400 hover:text-red-600 flex-shrink-0 p-1">
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddQuestionModal subjects={subjects} onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load(); }} />}
      {delTarget && (
        <Modal title="Delete Question?" onClose={() => setDelTarget(null)}>
          <p className="text-gray-600 mb-4">Are you sure you want to delete this question? This cannot be undone.</p>
          <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg mb-6">{delTarget.question_text}</p>
          <div className="flex gap-3">
            <button onClick={() => setDelTarget(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Add Question Modal ────────────────────────────────────────────────────────
const AddQuestionModal = ({ subjects, onClose, onDone }) => {
  const uniqueSubjects = [...new Map(subjects.map(a => [a.subject_id, a])).values()];
  const [form, setForm] = useState({
    subject_id: uniqueSubjects[0]?.subject_id || '',
    question_text: '',
    question_type: 'mcq',
    difficulty: 'medium',
    max_marks: 1,
    option_a: '', option_b: '', option_c: '', option_d: '',
    correct_option: '',
    expected_answer: '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.question_text.trim()) return toast.error('Question text is required.');
    if (form.question_type === 'mcq' && !form.correct_option) return toast.error('Select the correct option.');
    setLoading(true);
    try {
      await api.post('/teaching/teacher/questions/', form);
      toast.success('Question added!');
      onDone();
    } catch (e) { toast.error(getErr(e)); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Add Question" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Subject *</label>
            <select value={form.subject_id} onChange={e => set('subject_id', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {uniqueSubjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
            <select value={form.question_type} onChange={e => set('question_type', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="mcq">MCQ</option>
              <option value="descriptive">Descriptive (Short / CQ)</option>
              <option value="true_false">True / False</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Difficulty</label>
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Marks</label>
            <input type="number" min="1" value={form.max_marks} onChange={e => set('max_marks', +e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Question Text *</label>
          <textarea value={form.question_text} onChange={e => set('question_text', e.target.value)} rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Write your question here…" />
        </div>

        {/* MCQ options */}
        {form.question_type === 'mcq' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Options (click radio to mark correct) *</label>
            <div className="space-y-2">
              {['a', 'b', 'c', 'd'].map(opt => (
                <div key={opt} className="flex items-center gap-2">
                  <input type="radio" name="correct" value={opt} checked={form.correct_option === opt}
                    onChange={() => set('correct_option', opt)} className="accent-green-600" />
                  <span className="text-xs font-bold text-gray-500 w-5">{opt.toUpperCase()}.</span>
                  <input type="text" value={form[`option_${opt}`]} onChange={e => set(`option_${opt}`, e.target.value)}
                    placeholder={`Option ${opt.toUpperCase()}`}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* True/False */}
        {form.question_type === 'true_false' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Correct Answer *</label>
            <div className="flex gap-3">
              {['True', 'False'].map(v => (
                <button key={v} onClick={() => set('expected_answer', v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${form.expected_answer === v ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Descriptive */}
        {form.question_type === 'descriptive' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Answer / Marking Guide</label>
            <textarea value={form.expected_answer} onChange={e => set('expected_answer', e.target.value)} rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Write expected answer or key points…" />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving…' : 'Add Question'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMS TAB
// ─────────────────────────────────────────────────────────────────────────────
const ExamsTab = ({ dash }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [liveExam, setLiveExam] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/teaching/teacher/exams/');
      setExams(res.data.data.results || []);
    } catch (e) { toast.error(getErr(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startExam = async (examId) => {
    try {
      await api.post(`/teaching/teacher/exams/${examId}/start/`);
      toast.success('Exam started!');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  const endExam = async (examId) => {
    try {
      await api.post(`/teaching/teacher/exams/${examId}/end/`);
      toast.success('Exam ended.');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
        <h2 className="font-bold text-gray-800">My Exams & Quizzes</h2>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <FiPlus size={15} /> Create Exam
        </button>
      </div>

      {/* Exams list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? <div className="p-8 text-center text-gray-400">Loading…</div> : exams.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No exams yet. Create your first exam!</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {exams.map(e => (
              <div key={e.exam_id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-gray-50 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-gray-800">{e.title}</p>
                    <Badge label={e.exam_type === 'live_quiz' ? 'Live Quiz' : 'Regular'} color={e.exam_type === 'live_quiz' ? 'orange' : 'blue'} />
                    <Badge label={e.status} color={statusColor(e.status)} />
                  </div>
                  <p className="text-sm text-gray-500">{e.subject_name} · {e.batch_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {e.question_count} questions · {e.total_marks} marks · {e.duration_minutes} min
                    {e.access_code && <span className="ml-2 font-mono bg-gray-100 px-2 py-0.5 rounded">Code: {e.access_code}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {e.status === 'scheduled' && (
                    <button onClick={() => startExam(e.exam_id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">
                      <FiPlay size={12} /> Start
                    </button>
                  )}
                  {e.status === 'ongoing' && (
                    <>
                      {e.exam_type === 'live_quiz' && (
                        <button onClick={() => setLiveExam(e)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">
                          <FiEye size={12} /> Live View
                        </button>
                      )}
                      <button onClick={() => endExam(e.exam_id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600">
                        <FiSquare size={12} /> End
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateExamModal dash={dash} onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); load(); }} />}
      {liveExam && <LiveQuizModal exam={liveExam} onClose={() => setLiveExam(null)} />}
    </div>
  );
};

// ── Create Exam Modal ─────────────────────────────────────────────────────────
const CreateExamModal = ({ dash, onClose, onDone }) => {
  const assignments = dash?.assignments || [];
  const [form, setForm] = useState({
    subject_id: assignments[0]?.subject_id || '',
    batch_id: assignments[0]?.batch_id || '',
    title: '',
    exam_type: 'regular',
    total_marks: 100,
    pass_marks: 40,
    duration_minutes: 60,
    start_time: '',
    question_ids: [],
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const availableAssignment = assignments.find(a => a.subject_id === +form.subject_id);

  useEffect(() => {
    if (!form.subject_id) return;
    api.get(`/teaching/teacher/questions/?subject_id=${form.subject_id}`)
      .then(r => setQuestions(r.data.data.results || []))
      .catch(() => {});
  }, [form.subject_id]);

  useEffect(() => {
    if (availableAssignment) set('batch_id', availableAssignment.batch_id);
  }, [form.subject_id]);

  const toggleQ = (qid) => {
    set('question_ids', form.question_ids.includes(qid)
      ? form.question_ids.filter(id => id !== qid)
      : [...form.question_ids, qid]);
  };

  const submit = async () => {
    if (!form.title.trim()) return toast.error('Title required.');
    if (form.question_ids.length === 0) return toast.error('Select at least one question.');
    setLoading(true);
    try {
      await api.post('/teaching/teacher/exams/', form);
      toast.success('Exam created!');
      onDone();
    } catch (e) { toast.error(getErr(e)); }
    finally { setLoading(false); }
  };

  const uniqueSubjects = [...new Map(assignments.map(a => [a.subject_id, a])).values()];

  return (
    <Modal title="Create Exam / Quiz" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Subject *</label>
            <select value={form.subject_id} onChange={e => set('subject_id', +e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {uniqueSubjects.map(a => <option key={a.subject_id} value={a.subject_id}>{a.subject_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
            <select value={form.exam_type} onChange={e => set('exam_type', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="regular">Regular Exam</option>
              <option value="live_quiz">Live Quiz</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Chapter 5 Quiz, Mid-term Exam"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Total Marks</label>
            <input type="number" value={form.total_marks} onChange={e => set('total_marks', +e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pass Marks</label>
            <input type="number" value={form.pass_marks} onChange={e => set('pass_marks', +e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (min)</label>
            <input type="number" value={form.duration_minutes} onChange={e => set('duration_minutes', +e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time (optional)</label>
          <input type="datetime-local" value={form.start_time} onChange={e => set('start_time', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Question picker */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Select Questions * <span className="text-blue-600">({form.question_ids.length} selected)</span>
          </label>
          {questions.length === 0 ? (
            <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
              No questions for this subject yet. Add questions in the Question Bank tab first.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-50">
              {questions.map(q => (
                <label key={q.question_id} className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={form.question_ids.includes(q.question_id)}
                    onChange={() => toggleQ(q.question_id)} className="mt-0.5 accent-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{q.question_text}</p>
                    <div className="flex gap-2 mt-0.5">
                      <Badge label={q.question_type} color="blue" />
                      <Badge label={q.difficulty} color={diffColor(q.difficulty)} />
                      <span className="text-xs text-gray-400">{q.max_marks} mark{q.max_marks > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating…' : 'Create Exam'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Live Quiz Modal ───────────────────────────────────────────────────────────
const LiveQuizModal = ({ exam, onClose }) => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/exams/${exam.exam_id}/answers/`);
        const answers = res.data || [];
        // Group by student
        const map = {};
        answers.forEach(a => {
          if (!map[a.student]) map[a.student] = { name: a.student_name || `Student ${a.student}`, count: 0 };
          map[a.student].count++;
        });
        setParticipants(Object.values(map));
      } catch { setParticipants([]); }
    };
    load();
    const interval = setInterval(load, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [exam.exam_id]);

  return (
    <Modal title={`Live Quiz — ${exam.title}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <div>
            <p className="font-semibold text-green-800">Quiz is LIVE</p>
            <p className="text-sm text-green-600">Access Code: <span className="font-mono font-bold">{exam.access_code}</span></p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600 mb-2">
            Participants ({participants.length}) — auto-refreshes every 5s
          </p>
          {participants.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Waiting for students to join…</div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  <span className="text-xs text-gray-500">{p.count} answered</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">Share the access code with students to join the quiz</p>
      </div>
    </Modal>
  );
};

export default TeacherDashboard;
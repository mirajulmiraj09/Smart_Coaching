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
// TAB: MY CENTER
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: MY CENTER
// ═══════════════════════════════════════════════════════════════════════════════
const MyCenterTab = ({ dash }) => {
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
                <div key={courseTitle} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center space-x-3 mb-4">
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

                  {/* Subjects/Batches */}
                  <div className="space-y-2">
                    {assigns.map(a => (
                      <div
                        key={a.assignment_id}
                        className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 rounded-xl px-4 py-3.5 transition-colors border border-gray-100"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-semibold text-gray-800">
                              {a.subject_name}
                            </p>
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                              {a.subject_code}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Batch: <span className="font-medium text-gray-700">{a.batch_name}</span> (
                            {a.batch_type})
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Enrollment</p>
                            <p className="font-semibold text-blue-600">{a.enrolled_count} students</p>
                          </div>
                          <Badge
                            text={a.batch_status}
                            color={
                              a.batch_status === 'running'
                                ? 'green'
                                : a.batch_status === 'upcoming'
                                ? 'blue'
                                : 'gray'
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
                You're registered in the centers below, but your coaching admin hasn't assigned you to any
                subjects yet. Ask them to go to: <strong>Courses → Subjects → Assign Teacher</strong>
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
                  className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-4"
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-800">Question Bank <span className="text-gray-400 font-normal text-base">({questions.length})</span></h2>
        <div className="flex space-x-2">
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

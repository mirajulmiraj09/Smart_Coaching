import React, { useState, useEffect, useCallback } from 'react';
import {
  FiHome, FiBook, FiAward, FiBarChart2, FiBell, FiUser,
  FiSearch, FiMapPin, FiPhone, FiMail, FiClock, FiCalendar,
  FiChevronRight, FiCheck, FiX, FiAlertTriangle, FiRefreshCw,
  FiLayers, FiGrid, FiTrendingUp, FiStar, FiZap, FiCheckCircle,
  FiArrowLeft, FiFilter,
} from 'react-icons/fi';
import api from '../../services/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const unwrap = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data?.results)) return d.data.results;
  if (Array.isArray(d?.results)) return d.results;
  if (d?.data) return d.data;
  return d || {};
};

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (s) => s ? new Date(s).toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Badge = ({ text, color = 'gray' }) => {
  const map = {
    green: 'bg-green-100 text-green-800', yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800', blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800', gray: 'bg-gray-100 text-gray-600',
    orange: 'bg-orange-100 text-orange-800', cyan: 'bg-cyan-100 text-cyan-800',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[color] || map.gray}`}>{text}</span>;
};

const statusColor = (s) => ({
  approved: 'green', pending: 'yellow', rejected: 'red',
  running: 'green', upcoming: 'blue', completed: 'gray',
  active: 'green', dropped: 'red', scheduled: 'blue',
  ongoing: 'orange', pass: 'green', fail: 'red',
  morning: 'cyan', evening: 'purple', day: 'blue', night: 'gray',
  regular: 'blue', crash: 'red', online: 'green',
  exam: 'purple', result: 'green', system: 'blue', quiz: 'orange', fee: 'red',
}[s] || 'gray');

const Empty = ({ icon: Icon = FiBook, title = 'Nothing here yet', sub = '' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <Icon className="w-12 h-12 mb-3 opacity-30" />
    <p className="font-semibold text-gray-500">{title}</p>
    {sub && <p className="text-sm mt-1">{sub}</p>}
  </div>
);

const Modal = ({ open, title, onClose, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><FiX size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW / HOME TAB
// ═══════════════════════════════════════════════════════════════════════════════
const OverviewTab = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/academics/student/dashboard/'),
      api.get('/academics/student/enrollments/'),
      api.get('/academics/student/exams/?status=scheduled'),
    ]).then(([s, e, ex]) => {
      setStats(unwrap(s)?.data || unwrap(s));
      const enrolls = Array.isArray(unwrap(e)?.results) ? unwrap(e).results : [];
      setRecentEnrollments(enrolls.slice(0, 3));
      const exams = Array.isArray(unwrap(ex)?.results) ? unwrap(ex).results : [];
      setUpcomingExams(exams.slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const statCards = [
    { label: 'Enrolled Batches', value: stats?.enrolled_courses ?? 0, icon: FiBook, color: 'blue', tab: 'enrollments' },
    { label: 'Upcoming Exams', value: stats?.upcoming_exams ?? 0, icon: FiCalendar, color: 'purple', tab: 'exams' },
    { label: 'Ongoing Exams', value: stats?.ongoing_exams ?? 0, icon: FiZap, color: 'orange', tab: 'exams' },
    { label: 'Avg Score', value: `${stats?.average_score ?? 0}%`, icon: FiBarChart2, color: 'green', tab: 'results' },
  ];

  const colorMap = {
    blue: 'from-blue-500 to-blue-600', purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-400 to-orange-500', green: 'from-green-500 to-green-600',
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">Welcome back 👋</p>
            <h2 className="text-2xl font-bold mt-1">{user?.name || 'Student'}</h2>
            <p className="text-blue-100 text-sm mt-1">Keep up the great work! You're enrolled in {stats?.enrolled_courses ?? 0} course{stats?.enrolled_courses !== 1 ? 's' : ''}.</p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-full bg-white bg-opacity-20 items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
        </div>
        {stats?.unread_notifications > 0 && (
          <button onClick={() => onNavigate('notifications')} className="mt-4 inline-flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            <FiBell className="w-4 h-4" /> {stats.unread_notifications} unread notification{stats.unread_notifications !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
          <button key={c.label} onClick={() => onNavigate(c.tab)}
            className="text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[c.color]} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">My Courses</h3>
            <button onClick={() => onNavigate('enrollments')} className="text-blue-600 text-xs font-semibold hover:text-blue-700">View all →</button>
          </div>
          {recentEnrollments.length === 0 ? (
            <Empty icon={FiBook} title="No enrollments yet" sub="Browse centers to enroll" />
          ) : recentEnrollments.map(e => (
            <div key={e.enrollment_id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FiBook className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{e.course?.course_title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.center?.center_name} · {e.batch?.batch_name}</p>
                </div>
              </div>
              <Badge text={e.enrollment_status} color={statusColor(e.enrollment_status)} />
            </div>
          ))}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Upcoming Exams</h3>
            <button onClick={() => onNavigate('exams')} className="text-purple-600 text-xs font-semibold hover:text-purple-700">View all →</button>
          </div>
          {upcomingExams.length === 0 ? (
            <Empty icon={FiAward} title="No upcoming exams" sub="Check back later" />
          ) : upcomingExams.map(ex => (
            <div key={ex.exam_id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <FiAward className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{ex.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ex.subject_name} · {fmtDateTime(ex.start_time)}</p>
                </div>
              </div>
              <Badge text={ex.status} color={statusColor(ex.status)} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Browse Centers', icon: FiMapPin, tab: 'centers', color: 'blue' },
            { label: 'My Exams', icon: FiAward, tab: 'exams', color: 'purple' },
            { label: 'My Results', icon: FiTrendingUp, tab: 'results', color: 'green' },
            { label: 'Notifications', icon: FiBell, tab: 'notifications', color: 'orange' },
          ].map(a => (
            <button key={a.label} onClick={() => onNavigate(a.tab)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group">
              <a.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BROWSE CENTERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const CentersTab = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCenter, setSelectedCenter] = useState(null); // → courses page

  const load = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/academics/student/centers/${q ? `?search=${q}` : ''}`);
      const data = unwrap(res);
      setCenters(Array.isArray(data?.results) ? data.results : []);
    } catch { toast.error('Failed to load centers'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  if (selectedCenter) {
    return <CenterCoursesPage center={selectedCenter} onBack={() => setSelectedCenter(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Coaching Centers</h2>
        <span className="text-sm text-gray-400">{centers.length} centers</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="input-field pl-9 text-sm" placeholder="Search by name or location…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary px-5 text-sm">Search</button>
        {search && <button type="button" onClick={() => { setSearch(''); load(); }} className="btn-secondary px-3 text-sm"><FiX /></button>}
      </form>

      {loading ? <Loading /> : centers.length === 0 ? (
        <Empty icon={FiMapPin} title="No centers found" sub="Try a different search" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centers.map(c => (
            <div key={c.coaching_center_id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              onClick={() => setSelectedCenter(c)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-base leading-tight">{c.center_name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                    <FiMapPin className="w-3 h-3" /> {c.location || '—'}
                  </div>
                </div>
                <Badge text={c.access_type} color={c.access_type === 'free' ? 'green' : 'blue'} />
              </div>

              {c.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  {c.contact_number && <span className="flex items-center gap-1"><FiPhone className="w-3 h-3" />{c.contact_number}</span>}
                  {c.email && <span className="flex items-center gap-1"><FiMail className="w-3 h-3" />{c.email}</span>}
                </div>
                <span className="font-semibold text-blue-600 flex items-center gap-1">
                  {c.course_count} course{c.course_count !== 1 ? 's' : ''} <FiChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Center Courses page ───────────────────────────────────────────────────────
const CenterCoursesPage = ({ center, onBack }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollTarget, setEnrollTarget] = useState(null); // course to enroll

  useEffect(() => {
    api.get(`/academics/student/centers/${center.coaching_center_id}/courses/`)
      .then(r => { const d = unwrap(r); setCourses(Array.isArray(d?.results) ? d.results : []); })
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, [center.coaching_center_id]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <FiArrowLeft className="w-4 h-4" /> Back to centers
        </button>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
          <h2 className="text-xl font-bold">{center.center_name}</h2>
          <div className="flex items-center gap-4 mt-2 text-blue-100 text-sm flex-wrap">
            {center.location && <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{center.location}</span>}
            {center.contact_number && <span className="flex items-center gap-1"><FiPhone className="w-3.5 h-3.5" />{center.contact_number}</span>}
          </div>
        </div>
      </div>

      <h3 className="font-bold text-gray-700">Available Courses ({courses.length})</h3>

      {loading ? <Loading /> : courses.length === 0 ? (
        <Empty icon={FiBook} title="No courses available" sub="This center hasn't added courses yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(c => (
            <div key={c.course_id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-800">{c.course_title}</h4>
              {c.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="font-bold text-blue-600 text-lg">৳{c.fee}</span>
                <span className="text-gray-400 flex items-center gap-1"><FiClock className="w-3.5 h-3.5" />{c.duration} weeks</span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <span className={`text-xs font-medium ${c.active_batch_count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {c.active_batch_count} active batch{c.active_batch_count !== 1 ? 'es' : ''}
                </span>
                <button
                  onClick={() => setEnrollTarget(c)}
                  disabled={c.active_batch_count === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {enrollTarget && (
        <EnrollModal course={enrollTarget} onClose={() => setEnrollTarget(null)} />
      )}
    </div>
  );
};

// ── Enroll Modal (3-step: course → batch → confirm) ───────────────────────────
const EnrollModal = ({ course, onClose }) => {
  const [step, setStep] = useState(1); // 1=info, 2=batch, 3=done
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/academics/student/courses/${course.course_id}/batches/`)
      .then(r => {
        const d = unwrap(r);
        setBatches(Array.isArray(d?.results) ? d.results : []);
      })
      .catch(() => toast.error('Failed to load batches'))
      .finally(() => setLoading(false));
  }, [course.course_id]);

  const doEnroll = async () => {
    if (!selectedBatch) return;
    setEnrolling(true);
    try {
      const res = await api.post(`/academics/student/batches/${selectedBatch.batch_id}/enroll/`);
      const d = unwrap(res);
      setResult(d?.data || d);
      setStep(3);
      toast.success('Enrolled successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.detail || 'Enrollment failed');
    } finally { setEnrolling(false); }
  };

  return (
    <Modal open title={step === 3 ? '🎉 Enrolled!' : `Enroll — ${course.course_title}`} onClose={onClose} wide>
      {/* Step indicators */}
      {step < 3 && (
        <div className="flex items-center gap-2 mb-6">
          {[['1', 'Course Info'], ['2', 'Select Batch'], ['3', 'Confirm']].map(([n, lbl], i) => (
            <React.Fragment key={n}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{step > i + 1 ? '✓' : n}</div>
                <span className="hidden sm:inline">{lbl}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 rounded ${step > i + 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step 1: Course Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-gray-800 text-lg">{course.course_title}</h4>
            {course.description && <p className="text-sm text-gray-600 mt-2">{course.description}</p>}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-600">৳{course.fee}</p>
                <p className="text-xs text-gray-400 mt-0.5">Course Fee</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{course.duration}</p>
                <p className="text-xs text-gray-400 mt-0.5">Weeks Duration</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 flex items-start gap-2">
            <FiAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Make sure you've reviewed the course details before enrolling. Enrollment may be subject to the coaching center's approval.
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => setStep(2)} className="btn-primary flex-1">Select Batch →</button>
          </div>
        </div>
      )}

      {/* Step 2: Select Batch */}
      {step === 2 && (
        <div className="space-y-4">
          {loading ? <Loading /> : batches.length === 0 ? (
            <Empty icon={FiLayers} title="No available batches" sub="All batches are full or closed" />
          ) : (
            <div className="space-y-3">
              {batches.map(b => (
                <div key={b.batch_id}
                  onClick={() => !b.is_full && !b.already_enrolled && setSelectedBatch(b)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    b.already_enrolled ? 'border-green-300 bg-green-50 cursor-default' :
                    b.is_full ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' :
                    selectedBatch?.batch_id === b.batch_id ? 'border-blue-500 bg-blue-50' :
                    'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{b.batch_name}</p>
                        {b.already_enrolled && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-semibold">✓ Enrolled</span>}
                        {b.is_full && !b.already_enrolled && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">FULL</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{b.batch_code}</p>
                    </div>
                    {selectedBatch?.batch_id === b.batch_id && !b.already_enrolled && (
                      <FiCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <Badge text={b.class_shift} color={statusColor(b.class_shift)} />
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <Badge text={b.batch_type} color={statusColor(b.batch_type)} />
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-gray-700">{b.enrolled_count}/{b.max_students}</p>
                      <p className="text-xs text-gray-400">seats</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <FiCalendar className="w-3 h-3" /> {b.start_date} → {b.end_date}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1"><FiArrowLeft className="inline mr-1" />Back</button>
            <button onClick={doEnroll} disabled={!selectedBatch || enrolling || selectedBatch?.already_enrolled}
              className="btn-primary flex-1">{enrolling ? 'Enrolling...' : 'Confirm Enrollment'}</button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && result && (
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Successfully Enrolled!</h3>
            <p className="text-gray-500 text-sm mt-1">You've been enrolled in the following batch</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Course</span>
              <span className="font-semibold text-gray-800">{result.course_title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Batch</span>
              <span className="font-semibold text-gray-800">{result.batch_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Center</span>
              <span className="font-semibold text-gray-800">{result.center_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <Badge text={result.enrollment_status} color="green" />
            </div>
          </div>
          <button onClick={onClose} className="btn-primary w-full">Done</button>
        </div>
      )}
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MY ENROLLMENTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const EnrollmentsTab = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/academics/student/enrollments/');
      const d = unwrap(res);
      setEnrollments(Array.isArray(d?.results) ? d.results : []);
    } catch { toast.error('Failed to load enrollments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? enrollments : enrollments.filter(e => e.enrollment_status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">My Enrollments</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'dropped', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
        ))}
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <Empty icon={FiBook} title={filter === 'all' ? 'No enrollments yet' : `No ${filter} enrollments`}
          sub={filter === 'all' ? 'Browse centers and enroll in a course' : ''} />
      ) : (
        <div className="space-y-4">
          {filtered.map(e => (
            <div key={e.enrollment_id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{e.course?.course_title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{e.center?.center_name}</p>
                </div>
                <Badge text={e.enrollment_status} color={statusColor(e.enrollment_status)} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Batch</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5 truncate">{e.batch?.batch_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Shift</p>
                  <Badge text={e.batch?.class_shift} color={statusColor(e.batch?.class_shift)} />
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Type</p>
                  <Badge text={e.batch?.batch_type} color={statusColor(e.batch?.batch_type)} />
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Batch Status</p>
                  <Badge text={e.batch?.status} color={statusColor(e.batch?.status)} />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{e.batch?.start_date} → {e.batch?.end_date}</span>
                <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />Enrolled: {fmtDate(e.enrolled_at)}</span>
                <span className="ml-auto font-semibold text-blue-600">৳{e.course?.fee}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const ExamsTab = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter !== 'all' ? `/academics/student/exams/?status=${filter}` : '/academics/student/exams/';
      const res = await api.get(url);
      const d = unwrap(res);
      setExams(Array.isArray(d?.results) ? d.results : []);
    } catch { toast.error('Failed to load exams'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    total: exams.length,
    scheduled: exams.filter(e => e.status === 'scheduled').length,
    ongoing: exams.filter(e => e.status === 'ongoing').length,
    completed: exams.filter(e => e.status === 'completed').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">My Exams</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Total', counts.total, 'gray'], ['Scheduled', counts.scheduled, 'blue'], ['Ongoing', counts.ongoing, 'orange'], ['Completed', counts.completed, 'green']].map(([lbl, n, c]) => (
          <div key={lbl} className={`rounded-xl p-3 text-center ${c === 'orange' ? 'bg-orange-50' : c === 'blue' ? 'bg-blue-50' : c === 'green' ? 'bg-green-50' : 'bg-gray-50'}`}>
            <p className={`text-2xl font-bold ${c === 'orange' ? 'text-orange-600' : c === 'blue' ? 'text-blue-600' : c === 'green' ? 'text-green-600' : 'text-gray-600'}`}>{n}</p>
            <p className="text-xs text-gray-500 font-medium">{lbl}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'scheduled', 'ongoing', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
        ))}
      </div>

      {loading ? <Loading /> : exams.length === 0 ? (
        <Empty icon={FiAward} title="No exams found" sub="Exams will appear here when your teacher schedules them" />
      ) : (
        <div className="space-y-4">
          {exams.map(ex => (
            <div key={ex.exam_id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800">{ex.title}</h3>
                    <Badge text={ex.status} color={statusColor(ex.status)} />
                    <Badge text={ex.exam_type?.replace('_', ' ')} color="purple" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{ex.subject_name} · {ex.batch_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Total Marks</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{ex.total_marks}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Pass Marks</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{ex.pass_marks}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Duration</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{ex.duration_minutes} min</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">Starts</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{fmtDateTime(ex.start_time)}</p>
                </div>
              </div>

              {/* Show result if completed */}
              {ex.my_result && (
                <div className={`mt-3 pt-3 border-t border-gray-100 flex items-center justify-between ${ex.my_result.result_status === 'pass' ? 'text-green-700' : 'text-red-700'}`}>
                  <span className="text-sm font-semibold">Your Result:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{ex.my_result.total_marks_obtained}/{ex.my_result.total_marks}</span>
                    <span className="text-sm font-bold">({ex.my_result.percentage}%)</span>
                    {ex.my_result.grade && <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">{ex.my_result.grade}</span>}
                    <Badge text={ex.my_result.result_status} color={statusColor(ex.my_result.result_status)} />
                  </div>
                </div>
              )}

              {ex.host_teacher && (
                <p className="text-xs text-gray-400 mt-2">👨‍🏫 {ex.host_teacher}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const ResultsTab = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/academics/student/results/')
      .then(r => { const d = unwrap(r); setResults(Array.isArray(d?.results) ? d.results : []); })
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  const passed = results.filter(r => r.result_status === 'pass').length;
  const avgPct = results.length > 0
    ? (results.reduce((acc, r) => acc + parseFloat(r.percentage || 0), 0) / results.length).toFixed(1)
    : 0;

  const gradeColor = (g) => ({
    'A+': 'bg-green-100 text-green-800', A: 'bg-green-100 text-green-800',
    'A-': 'bg-green-100 text-green-700', B: 'bg-blue-100 text-blue-700',
    C: 'bg-yellow-100 text-yellow-700', D: 'bg-orange-100 text-orange-700',
    F: 'bg-red-100 text-red-700',
  }[g] || 'bg-gray-100 text-gray-600');

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-800">My Results</h2>

      {/* Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{results.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Exams</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{passed}</p>
            <p className="text-xs text-gray-500 mt-0.5">Passed</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{avgPct}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Avg Score</p>
          </div>
        </div>
      )}

      {loading ? <Loading /> : results.length === 0 ? (
        <Empty icon={FiTrendingUp} title="No results yet" sub="Your exam results will appear here after they're published" />
      ) : (
        <div className="space-y-4">
          {results.map(r => (
            <div key={r.result_id} className={`bg-white rounded-xl border-2 p-5 hover:shadow-md transition-shadow ${r.result_status === 'pass' ? 'border-green-200' : 'border-red-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{r.exam?.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{r.exam?.subject_name} · {r.exam?.batch_name} · {r.exam?.center_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.grade && <span className={`text-sm font-bold px-2 py-1 rounded-lg ${gradeColor(r.grade)}`}>{r.grade}</span>}
                  <Badge text={r.result_status} color={statusColor(r.result_status)} />
                </div>
              </div>

              {/* Score bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Score: {r.total_marks_obtained} / {r.total_marks}</span>
                  <span className="font-bold text-gray-700">{r.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${r.result_status === 'pass' ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(parseFloat(r.percentage), 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />Exam: {fmtDate(r.exam?.start_time)}</span>
                {r.published_at && <span className="flex items-center gap-1"><FiCheck className="w-3 h-3" />Published: {fmtDate(r.published_at)}</span>}
                <Badge text={r.exam?.exam_type?.replace('_', ' ') || '—'} color="purple" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter !== 'all' ? `/academics/student/notifications/?type=${filter}` : '/academics/student/notifications/';
      const res = await api.get(url);
      const d = unwrap(res);
      setNotifications(Array.isArray(d?.results) ? d.results : []);
      setUnreadCount(d?.unread_count || 0);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await api.post(`/academics/student/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, status: 'read' } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await api.post('/academics/student/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
    finally { setMarking(false); }
  };

  const typeIcon = (t) => ({
    exam: '📝', result: '📊', quiz: '⚡', fee: '💰', system: 'ℹ️',
  }[t] || '🔔');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={marking}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50">
            Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'exam', 'result', 'quiz', 'fee', 'system'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? 'All' : `${typeIcon(f)} ${f}`}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : notifications.length === 0 ? (
        <Empty icon={FiBell} title="No notifications" sub="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.notification_id}
              onClick={() => n.status === 'unread' && markRead(n.notification_id)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${n.status === 'unread' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${n.status === 'unread' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge text={n.type} color={statusColor(n.type)} />
                      {n.status === 'unread' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{fmtDateTime(n.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STUDENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('home');
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread count
  useEffect(() => {
    const fetchCount = () => {
      api.get('/academics/student/notifications/')
        .then(r => { const d = unwrap(r); setUnreadCount(d?.unread_count || 0); })
        .catch(() => {});
    };
    fetchCount();
    const iv = setInterval(fetchCount, 60000);
    return () => clearInterval(iv);
  }, []);

  const tabs = [
    { key: 'home',          label: 'Home',        icon: FiHome },
    { key: 'centers',       label: 'Centers',     icon: FiMapPin },
    { key: 'enrollments',   label: 'My Courses',  icon: FiBook },
    { key: 'exams',         label: 'Exams',       icon: FiAward },
    { key: 'results',       label: 'Results',     icon: FiBarChart2 },
    { key: 'notifications', label: 'Alerts',      icon: FiBell, badge: unreadCount },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === key ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            {badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'home'          && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === 'centers'       && <CentersTab />}
        {activeTab === 'enrollments'   && <EnrollmentsTab />}
        {activeTab === 'exams'         && <ExamsTab />}
        {activeTab === 'results'       && <ResultsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  );
};

export default StudentDashboard;
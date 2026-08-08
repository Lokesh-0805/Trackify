import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [profileResponse, teamResponse, assignmentsResponse] = await Promise.all([
          api.get('/api/employees/me'),
          api.get('/api/employees/my-team'),
          api.get('/api/feedback/assignments/pending'),
        ]);

        setProfile(profileResponse.data?.user || null);
        setTeam(teamResponse.data?.team || []);
        setAssignments(assignmentsResponse.data?.assignments || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-slate-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-red-700">Unable to load dashboard</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">Welcome</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{profile?.name || 'Employee'}</h1>
            <p className="mt-2 text-slate-600">Here is your current employee snapshot and your pending review work.</p>
          </div>
          <Link
            to="/employee/history"
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Feedback History
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Employee Information</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>
              <span className="font-medium text-slate-500">Name</span>
              <p className="mt-1">{profile?.name || '—'}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500">Email</span>
              <p className="mt-1">{profile?.email || '—'}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500">Role</span>
              <p className="mt-1">{profile?.role || '—'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">My Team</h2>
          {team.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No direct reports found.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {team.map((member) => (
                <div key={member._id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-600">{member.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Pending Feedback</h2>
          <span className="text-sm text-slate-500">{assignments.length} assignment(s)</span>
        </div>

        {assignments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No pending feedback assignments right now.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-4 py-3 text-slate-700">{assignment.revieweeId?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/employee/feedback/${assignment._id}`}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Give Feedback
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployeeDashboard;

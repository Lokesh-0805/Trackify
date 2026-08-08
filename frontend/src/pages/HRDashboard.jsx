import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const HRDashboard = () => {
  const [pending, setPending] = useState([]);
  const [summary, setSummary] = useState([]);
  const [cycleLabel, setCycleLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [pendingResponse, summaryResponse] = await Promise.all([
          api.get('/api/hr/pending-feedback'),
          api.get('/api/hr/feedback-status'),
        ]);

        setPending(pendingResponse.data?.pending || []);
        setSummary(summaryResponse.data?.summary || []);
        setCycleLabel(summaryResponse.data?.cycle || pendingResponse.data?.cycle || 'Current cycle');
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load HR reporting data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totals = useMemo(() => {
    const totalAssignments = summary.reduce((acc, item) => acc + (item.total || 0), 0);
    const submitted = summary.reduce((acc, item) => acc + (item.submitted || 0), 0);
    const pendingCount = summary.reduce((acc, item) => acc + (item.pending || 0), 0);
    const completionRate = totalAssignments > 0 ? Math.round((submitted / totalAssignments) * 100) : 0;

    return { totalAssignments, submitted, pendingCount, completionRate };
  }, [summary]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-slate-600">Loading HR dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-red-700">Unable to load HR dashboard</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">HR Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{cycleLabel || 'Current Cycle'}</h1>
        <p className="mt-2 text-slate-600">Company feedback progress for the active cycle.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Assignments</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.totalAssignments}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Submitted</p>
          <p className="mt-2 text-2xl font-semibold text-green-700">{totals.submitted}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{totals.pendingCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completion Rate</p>
          <p className="mt-2 text-2xl font-semibold text-blue-700">{totals.completionRate}%</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Feedback Completion Summary</h2>
          <span className="text-sm text-slate-500">Reviewer · Total · Submitted · Pending</span>
        </div>

        {summary.length === 0 ? (
          <p className="text-sm text-slate-600">No feedback summary available for this cycle.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Reviewer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {summary.map((row) => (
                  <tr key={row.reviewer}>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.reviewer}</td>
                    <td className="px-4 py-3 text-slate-700">{row.total}</td>
                    <td className="px-4 py-3 text-slate-700">{row.submitted}</td>
                    <td className="px-4 py-3 text-slate-700">{row.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Pending Feedback</h2>
          <span className="text-sm text-slate-500">Reviewer · Reviewee · Status</span>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-slate-600">No pending feedback assignments for this cycle.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Reviewer</th>
                  <th className="px-4 py-3 font-medium">Reviewee</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {pending.map((item, index) => (
                  <tr key={`${item.reviewer}-${item.reviewee}-${index}`}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.reviewer}</td>
                    <td className="px-4 py-3 text-slate-700">{item.reviewee}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                        {item.status}
                      </span>
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

export default HRDashboard;

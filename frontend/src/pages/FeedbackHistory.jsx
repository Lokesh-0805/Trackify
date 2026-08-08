import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const FeedbackHistory = () => {
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/api/feedback/my-history');
        setHistory(response.data?.history || {});
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load feedback history.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const monthLabels = useMemo(() => Object.keys(history).reverse(), [history]);
  const parameterNames = useMemo(() => {
    const names = monthLabels.flatMap((month) => Object.keys(history[month] || {}));
    return Array.from(new Set(names));
  }, [history, monthLabels]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-slate-600">Loading feedback history…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-red-700">Unable to load feedback history</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (monthLabels.length === 0 || parameterNames.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Performance History</h1>
        <p className="mt-3 text-slate-600">No historical feedback has been shared with you yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Performance History</h1>
        <p className="mt-2 text-sm text-slate-600">Your feedback received across previous months.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Parameter</th>
              {monthLabels.map((month) => (
                <th key={month} className="px-4 py-3 font-medium">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {parameterNames.map((parameter) => (
              <tr key={parameter}>
                <td className="px-4 py-3 font-medium text-slate-800">{parameter}</td>
                {monthLabels.map((month) => {
                  const score = history[month]?.[parameter];
                  return (
                    <td key={`${parameter}-${month}`} className="px-4 py-3 text-slate-700">
                      {typeof score === 'number' ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {score}/5
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackHistory;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FeedbackParameterField from '../components/FeedbackParameterField';
import api from '../services/api';

const parameterNames = [
  'Ownership',
  'Communication',
  'Quality of Work',
  'Teamwork',
  'Problem Solving',
];

const FeedbackFormPlaceholder = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [formState, setFormState] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [assignmentResponse, parametersResponse] = await Promise.all([
            api.get(`/api/feedback/assignments/${assignmentId}`),
            api.get('/api/feedback/parameters'),
        ]);

        setAssignment(assignmentResponse.data?.assignment || null);
        const activeParameters = (parametersResponse.data?.parameters || []).filter((parameter) => parameter.active);
        setParameters(activeParameters);
      } catch (err) {
        setSubmitError(err?.response?.data?.message || 'Unable to load assignment details.');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  useEffect(() => {
    const initialState = {};
    parameterNames.forEach((name) => {
      initialState[name] = { score: 0, comment: '' };
    });
    setFormState(initialState);
  }, []);

  const handleScoreChange = (parameter, score) => {
    setFormState((prev) => ({
      ...prev,
      [parameter]: {
        ...prev[parameter],
        score,
      },
    }));
  };

  const handleCommentChange = (parameter, comment) => {
    setFormState((prev) => ({
      ...prev,
      [parameter]: {
        ...prev[parameter],
        comment,
      },
    }));
  };

  const validate = () => {
    const nextErrors = {};
    parameterNames.forEach((name) => {
      const item = formState[name];
      const score = Number(item?.score);

      if (!Number.isInteger(score) || score < 1 || score > 5) {
        nextErrors[name] = 'Please select a score from 1 to 5.';
      }

      if (!item?.comment?.trim()) {
        nextErrors[name] = nextErrors[name] || 'Please add a comment.';
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (!validate()) {
        return;
      }

      const activeParameters = (parameters || []).filter(
        (parameter) => parameter?.active && parameterNames.includes(parameter.name)
      );
      const parameterMap = new Map(activeParameters.map((parameter) => [parameter.name, parameter._id]));
      const missingParameters = parameterNames.filter((name) => !parameterMap.get(name));

      if (missingParameters.length > 0) {
        setSubmitError('Required feedback parameters are not available right now.');
        return;
      }

      const payload = {
        assignmentId,
        items: parameterNames.map((name) => ({
          parameterId: parameterMap.get(name),
          score: Number(formState[name].score),
          comment: formState[name].comment.trim(),
        })),
      };

      await api.post('/api/feedback', payload);
      setSuccess('Feedback submitted successfully.');
      window.setTimeout(() => navigate('/employee'), 800);
    } catch (err) {
      const backendMessage = err?.response?.data?.message || err?.response?.data?.error || 'Unable to submit feedback.';
      setSubmitError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">Loading assignment…</div>;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Submit Feedback</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review {assignment?.revieweeId?.name || 'the employee'} for this assignment.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {parameterNames.map((name) => (
          <FeedbackParameterField
            key={name}
            label={name}
            value={formState[name] || { score: 0, comment: '' }}
            onChange={(score, comment) => {
              if (typeof score === 'number') {
                handleScoreChange(name, score);
              } else if (typeof comment === 'string') {
                handleCommentChange(name, comment);
              }
            }}
            error={errors[name]}
          />
        ))}

        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/employee')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackFormPlaceholder;

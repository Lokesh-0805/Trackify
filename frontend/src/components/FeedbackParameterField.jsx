const FeedbackParameterField = ({ label, value, onChange, error }) => {
  const stars = [1, 2, 3, 4, 5];

  const score = Number(value?.score ?? 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <label className="text-base font-semibold text-slate-800">{label}</label>
        <div className="flex gap-1">
          {stars.map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="text-2xl text-amber-500"
              aria-label={`${label} score ${star}`}
            >
              {star <= score ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={`${label}-comment`}>
          Why did you give this score?
        </label>
        <textarea
          id={`${label}-comment`}
          value={value.comment}
          onChange={(event) => onChange(null, event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
          placeholder="Share a short explanation for this score"
        />
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
};

export default FeedbackParameterField;

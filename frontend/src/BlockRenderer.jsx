import React from "react";

export default function BlockRenderer({
  title,
  elements,
  answers,
  setAnswers,
  onBack,
  onNext,
  nextLabel,
  disableBack,
}) {
  function update(qid, val) {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  }

  function validate() {
    for (const el of elements) {
      if (el.type === "display") continue;
      if (el.required) {
        const v = answers[el.question_id];
        const empty = v === undefined || v === null || v === "";
        if (empty) return `Missing required: ${el.label}`;
      }
    }
    return null;
  }

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "40px auto",
        padding: 24,
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        background: "white",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>

      {elements.map((el, idx) => {
        if (el.type === "display") {
          return (
            <div key={idx} style={{ whiteSpace: "pre-line", marginBottom: 16 }}>
              {el.text}
            </div>
          );
        }

        if (el.type === "select") {
          return (
            <div key={idx} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                {el.label}
              </label>
              <select
                value={answers[el.question_id] ?? ""}
                onChange={(e) => update(el.question_id, e.target.value)}
                style={{ width: "100%", padding: 10 }}
              >
                <option value="" disabled>
                  Select...
                </option>
                {el.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {el.required ? (
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Required</div>
              ) : null}
            </div>
          );
        }

        if (el.type === "text") {
          return (
            <div key={idx} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                {el.label}
              </label>
              <input
                value={answers[el.question_id] ?? ""}
                onChange={(e) => update(el.question_id, e.target.value)}
                style={{ width: "100%", padding: 10 }}
              />
            </div>
          );
        }

        if (el.type === "number") {
          return (
            <div key={idx} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                {el.label}
              </label>
              <input
                type="number"
                value={answers[el.question_id] ?? ""}
                onChange={(e) =>
                  update(el.question_id, e.target.value === "" ? "" : Number(e.target.value))
                }
                style={{ width: "100%", padding: 10 }}
              />
            </div>
          );
        }

        if (el.type === "slider") {
          const v = answers[el.question_id] ?? el.min ?? 0;
          return (
            <div key={idx} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                {el.label}
              </label>
              <input
                type="range"
                min={el.min}
                max={el.max}
                value={v}
                onChange={(e) => update(el.question_id, Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ marginTop: 6, opacity: 0.8 }}>Value: {v}</div>
            </div>
          );
        }

        return null;
      })}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button
          onClick={onBack}
          disabled={disableBack}
          style={{ padding: "10px 16px", opacity: disableBack ? 0.6 : 1 }}
        >
          Back
        </button>

        <button
          onClick={() => {
            const err = validate();
            if (err) return alert(err);
            onNext();
          }}
          style={{ padding: "10px 16px" }}
        >
          {nextLabel || "Next"}
        </button>
      </div>
    </div>
  );
}

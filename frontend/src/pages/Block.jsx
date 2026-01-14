import React, { useEffect, useMemo, useState } from "react";
import { getInstance, saveAnswers } from "../api.js";

function Field({ el, value, onChange }) {
  if (el.type === "display") {
    return <div style={{ whiteSpace: "pre-line", marginBottom: 16 }}>{el.text}</div>;
  }

  if (el.type === "select") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>{el.label}</label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", padding: 10 }}
        >
          <option value="" disabled>Select...</option>
          {el.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {el.required ? <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Required</div> : null}
      </div>
    );
  }

  if (el.type === "text") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>{el.label}</label>
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", padding: 10 }}
        />
      </div>
    );
  }

  if (el.type === "number") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>{el.label}</label>
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          style={{ width: "100%", padding: 10 }}
        />
      </div>
    );
  }

  if (el.type === "slider") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>{el.label}</label>
        <input
          type="range"
          min={el.min}
          max={el.max}
          value={value ?? el.min}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: 6, opacity: 0.8 }}>Value: {value ?? el.min}</div>
      </div>
    );
  }

  return null;
}

export default function Block({ sessionId, instanceId, onAdvance }) {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const p = await getInstance(sessionId, instanceId);
        if (!mounted) return;
        setPayload(p);
        setAnswers(p.answers || {});
      } catch (e) {
        setErr(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionId, instanceId]);

  const questions = useMemo(() => {
    if (!payload) return [];
    return payload.elements.filter((e) => e.type !== "display");
  }, [payload]);

  function validate() {
    if (!payload) return false;
    for (const el of payload.elements) {
      if (el.type === "display") continue;
      if (el.required) {
        const v = answers[el.question_id];
        const empty = v === undefined || v === null || v === "";
        if (empty) return `Missing required: ${el.label}`;
      }
    }
    return null;
  }

  async function onNext() {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setErr(null);
    const res = await saveAnswers(sessionId, instanceId, answers);
    onAdvance(res);
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (err) return <div style={{ padding: 24, color: "crimson" }}>{err}</div>;
  if (!payload) return <div style={{ padding: 24 }}>No payload</div>;

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 10 }}>
      <h2 style={{ marginTop: 0 }}>{payload.title}</h2>

      {payload.elements.map((el, idx) => (
        <Field
          key={`${el.type}-${idx}-${el.question_id || "display"}`}
          el={el}
          value={el.question_id ? answers[el.question_id] : undefined}
          onChange={(val) => setAnswers((a) => ({ ...a, [el.question_id]: val }))}
        />
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button onClick={onNext} style={{ padding: "10px 16px" }}>
          Next
        </button>
      </div>
    </div>
  );
}

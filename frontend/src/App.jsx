import React, { useEffect, useState } from "react";
import BlockRenderer from "./BlockRenderer.jsx";
import { createSession, getInstance, submitInstance } from "./api.js";

export default function App() {
  const [sessionId, setSessionId] = useState(null);

  // Backend-driven navigation
  const [instanceId, setInstanceId] = useState("intro__1");
  const [history, setHistory] = useState([]);

  // Current instance payload and answers
  const [payload, setPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Create session once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await createSession();
        if (!mounted) return;
        setSessionId(s.session_id);
      } catch (e) {
        if (!mounted) return;
        setErr(String(e));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load current instance whenever instanceId changes
  useEffect(() => {
    if (!sessionId || done) return;

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
        if (!mounted) return;
        setErr(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sessionId, instanceId, done]);

  if (err) {
    return (
      <div style={{ padding: 40, color: "crimson", whiteSpace: "pre-wrap" }}>
        {err}
      </div>
    );
  }

  if (!sessionId) {
    return <div style={{ padding: 40 }}>Creating session…</div>;
  }

  if (done) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Thank you</h2>
        <div>Survey complete.</div>
      </div>
    );
  }

  if (loading || !payload) {
    return <div style={{ padding: 40 }}>Loading…</div>;
  }

  async function onNext() {
    const res = await submitInstance(sessionId, instanceId, answers);

    if (res.done) {
      setDone(true);
      return;
    }

    const nextId = res.next_instance_id;
    if (!nextId) {
      setDone(true);
      return;
    }

    setHistory((h) => [...h, instanceId]);
    setInstanceId(nextId);
  }

  function onBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setInstanceId(prev);
      return h.slice(0, -1);
    });
  }

  // If you want a different label on the last page, you can special-case it later.
  const nextLabel = "Next";

  return (
    <BlockRenderer
      title={payload.title}
      elements={payload.elements}
      answers={answers}
      setAnswers={setAnswers}
      onBack={onBack}
      onNext={onNext}
      nextLabel={nextLabel}
      disableBack={history.length === 0}
    />
  );
}

import React, { useState } from "react";
import Block from "./Block.jsx";

export default function Start({ sessionId }) {
  const [instanceId, setInstanceId] = useState("intro__1");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div style={{ maxWidth: 760, margin: "40px auto", padding: 24 }}>
        <h2>Thank you</h2>
        <p>Survey complete.</p>
      </div>
    );
  }

  return (
    <Block
      sessionId={sessionId}
      instanceId={instanceId}
      onAdvance={(next) => {
        if (!next || next.done) setDone(true);
        else setInstanceId(next.next_instance_id);
      }}
    />
  );
}

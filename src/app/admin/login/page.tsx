"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function AdminLogin() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <main className="admin-login">
      <form action={action} className="admin-card" style={{ maxWidth: 360, margin: "80px auto" }}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Admin sign in</h1>
        <p className="sub" style={{ marginBottom: 20 }}>HealthVoyage content panel</p>
        <label className="field">
          <span>Password</span>
          <input type="password" name="password" autoFocus required />
        </label>
        {state?.error && <p className="form-error">{state.error}</p>}
        <button className="btn" type="submit" disabled={pending} style={{ marginTop: 16, width: "100%" }}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

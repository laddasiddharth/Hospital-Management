"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="bg-danger-50 text-danger-600 p-4 rounded-xl border border-danger-200">
        <p className="font-bold">Invalid Invitation Link</p>
        <p className="text-sm mt-1">This link is missing an invitation token.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const resp = await fetch(`/api/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!resp.ok) {
        let msg = "Failed to set password.";
        try {
          const data = await resp.json();
          msg = data.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-black text-emerald-800 mb-2">Password Set Successfully</h3>
        <p className="text-emerald-600 font-medium">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-danger-50 text-danger-600 p-3 rounded-lg text-sm font-bold border border-danger-200">
          {error}
        </div>
      )}

      <div className="space-y-3 mt-4">
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      <div className="pt-6">
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Set Password & Continue"}
        </Button>
      </div>
    </form>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen grid items-center justify-center p-6 bg-surface-50">
      <div className="w-full max-w-md w-[400px]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-sm mb-4">
            🔐
          </div>
          <h1 className="text-3xl font-black tracking-tight text-surface-900">
            Welcome Aboard
          </h1>
          <p className="text-surface-500 font-medium mt-2">
            Please set a secure password for your account to get started.
          </p>
        </div>

        <div className="glass bg-white p-8 rounded-3xl shadow-xl border border-surface-100">
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            <SetupPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

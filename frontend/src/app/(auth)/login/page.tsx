"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please attempt again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-10 animate-fade-in bg-white shadow-2xl shadow-primary-500/5 block">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary-600 text-white mb-6 shadow-xl shadow-primary-500/20">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-surface-950 tracking-tight">Personnel Portal</h1>
        <p className="text-surface-500 font-bold text-sm mt-2 uppercase tracking-widest">Secure Institutional Access</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-danger-50 border border-danger-100 text-danger-700 text-xs font-black uppercase tracking-widest text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Institutional Email"
          type="email"
          placeholder="doctor@hospital.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label="Access Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full h-14"
          size="lg"
        >
          Authenticate Session
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-10 text-center border-t border-surface-100 pt-8">
        <p className="text-sm font-bold text-surface-400">
          Unregistered personnel?{" "}
          <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-black transition-colors underline decoration-2 underline-offset-4">
            Initialize Enrollment
          </Link>
        </p>
      </div>
    </div>
  );
}

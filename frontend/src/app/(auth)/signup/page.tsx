"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: "patient"
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getPasswordStrength = (
    password: string
  ): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: "", color: "", width: "0%" };
    if (password.length < 6) return { label: "Weak", color: "bg-danger-500", width: "25%" };
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 1) return { label: "Weak", color: "bg-danger-500", width: "25%" };
    if (score === 2) return { label: "Fair", color: "bg-warning-500", width: "50%" };
    if (score === 3) return { label: "Good", color: "bg-primary-500", width: "75%" };
    return { label: "Strong", color: "bg-primary-700", width: "100%" };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass rounded-2xl p-8 text-center animate-scale-in">
        <h2 className="text-xl font-bold text-surface-900 mb-2">Account Created!</h2>
        <p className="text-surface-500 text-sm">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 animate-slide-up shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 mb-4 border border-primary-100">
          <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Create Account</h1>
        <p className="text-surface-500 mt-1.5 text-sm">Join Smart Hospital Network</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-danger-50 text-danger-600 text-sm text-center border border-danger-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-surface-900">
        
        {/* Role Selector hidden, defaults to patient */}

        <Input label="Full Name" type="text" placeholder="John Doe" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} required />
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
        <Input label="Phone (Optional)" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
        
        <div>
          <Input label="Password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
          {form.password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-surface-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }} />
              </div>
              <span className="text-xs text-surface-500 min-w-[3rem]">{strength.label}</span>
            </div>
          )}
        </div>

        <Input label="Confirm Password" type="password" placeholder="Repeat your password" value={form.confirm_password} onChange={(e) => updateField("confirm_password", e.target.value)} required 
               error={form.confirm_password.length > 0 && form.password !== form.confirm_password ? "Passwords do not match" : undefined} />

        <Button type="submit" isLoading={isLoading} className="w-full mt-4" size="lg">Sign Up</Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-surface-600">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 hover:text-primary-800 font-bold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

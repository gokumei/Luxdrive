import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { apiUrl } from "@/lib/apiConfig";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(response.status === 401 ? "INVALID_CREDENTIALS" : "LOGIN_FAILED");
      }

      login(data.user, data.token);

      toast.success(t('auth.login.success'));

      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const message = err.message === "INVALID_CREDENTIALS"
        ? t('auth.login.invalid')
        : t('auth.login.failed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.noAccount')}{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            {t('auth.login.create')}
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-ivory"
          >
            {t('common.email')}
          </label>

          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lunar"
              aria-hidden="true"
            />

            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-obsidian border border-white/10 text-ivory pl-10 pr-4 outline-none focus:border-gold/50"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-ivory"
            >
              {t('auth.login.password')}
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-gold hover:text-gold-light transition-colors"
            >
              {t('auth.login.forgot')}
            </Link>
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lunar"
              aria-hidden="true"
            />

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-obsidian border border-white/10 text-ivory pl-10 pr-4 outline-none focus:border-gold/50"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gold text-obsidian font-medium flex items-center justify-center hover:bg-gold-light transition-colors disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('auth.login.loading')}
            </>
          ) : (
            t('auth.login.submit')
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
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
        throw new Error(
          response.status === 401
            ? "Ungültige E-Mail-Adresse oder ungültiges Passwort"
            : "Anmeldung fehlgeschlagen"
        );
      }

      login(data.user, data.token);

      toast.success("Anmeldung erfolgreich");

      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const message = err.message === "Ungültige E-Mail-Adresse oder ungültiges Passwort"
        ? err.message
        : "Anmeldung fehlgeschlagen";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Willkommen zurück"
      subtitle="Melden Sie sich bei Ihrem Konto an"
      footer={
        <>
          Sie haben noch kein Konto?{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            Konto erstellen
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
            E-Mail
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
              Passwort
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-gold hover:text-gold-light transition-colors"
            >
              Passwort vergessen?
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
              Anmeldung läuft …
            </>
          ) : (
            "Anmelden"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

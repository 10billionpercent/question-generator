"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup, storeToken } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    institutionName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (mode === "login") {
        response = await login({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password,
        });
      } else {
        response = await signup({
          name: formData.name,
          emailOrPhone: formData.emailOrPhone,
          institutionName: formData.institutionName,
          password: formData.password,
        });
      }
      storeToken(response.token);
      console.log("Token saved:", localStorage.getItem("token")); // Debug
      router.push("/assignments");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    router.push("/assignments");
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <img src="/logo.png" alt="VedaAI" />
          </div>
          <h1 className="auth-title">VedaAI</h1>
          <h2 className="auth-subtitle">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="auth-input"
              />
            )}
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email or phone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
              className="auth-input"
            />
            {mode === "signup" && (
              <input
                type="text"
                name="institutionName"
                placeholder="Institution name"
                value={formData.institutionName}
                onChange={handleChange}
                required
                className="auth-input"
              />
            )}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
            />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : "Sign up"}
            </button>
          </form>

          <p className="auth-toggle">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => setMode("signup")}>Sign up</button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")}>Log in</button>
              </>
            )}
          </p>

          <button onClick={handleGuest} className="auth-guest">
            Continue as Guest
          </button>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          padding: 20px;
          font-family: var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
        }

        .auth-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 24px;
          padding: 40px 32px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .auth-logo {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
        }

        .auth-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .auth-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          font-size: 18px;
          font-weight: 500;
          color: #666;
          margin-bottom: 28px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .auth-input {
          width: 100%;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          color: #1a1a1a;
          transition: border 0.2s;
        }

        .auth-input:focus {
          outline: none;
          border-color: #e8470a;
        }

        .auth-input::placeholder {
          color: #aaa;
        }

        .auth-error {
          color: #e53e3e;
          font-size: 14px;
          margin-top: -4px;
        }

        .auth-submit {
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 50px;
          padding: 14px;
          font-size: 16px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 8px;
        }

        .auth-submit:hover:not(:disabled) {
          background: #333;
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-toggle {
          margin-top: 20px;
          font-size: 14px;
          color: #666;
        }

        .auth-toggle button {
          background: none;
          border: none;
          color: #e8470a;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          font-family: inherit;
        }

        .auth-guest {
          width: 100%;
          margin-top: 16px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 50px;
          padding: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #1a1a1a;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
        }

        .auth-guest:hover {
          background: #f5f5f5;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 32px 20px;
          }
        }
      `}</style>
    </>
  );
}

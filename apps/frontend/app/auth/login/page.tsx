"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/services/authService";
import styles from "./login.module.css";

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

  // In login page, handleSubmit becomes:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password,
        });
      } else {
        await signup({
          name: formData.name,
          emailOrPhone: formData.emailOrPhone,
          institutionName: formData.institutionName,
          password: formData.password,
        });
      }
      router.push("/assignments");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    router.push("/assignments");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="VedaAI" />
        </div>
        <h1 className={styles.title}>VedaAI</h1>
        <h2 className={styles.subtitle}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "signup" && (
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
            />
          )}
          <input
            type="text"
            name="emailOrPhone"
            placeholder="Email or phone"
            value={formData.emailOrPhone}
            onChange={handleChange}
            required
            className={styles.input}
          />
          {mode === "signup" && (
            <input
              type="text"
              name="institutionName"
              placeholder="Institution name"
              value={formData.institutionName}
              onChange={handleChange}
              required
              className={styles.input}
            />
          )}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Log in"
                : "Sign up"}
          </button>
        </form>

        <p className={styles.toggle}>
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

        <button onClick={handleGuest} className={styles.guestBtn}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

// ================================================================
// WAFI CAPITAL CRM - Auth Page
// Login, Signup, and Change Password screens
// ================================================================

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { C } from "../utils/constants";
import { Field, inputStyle } from "../components/widgets";

console.log("[AUTH_PAGE] Initializing Auth Page component...");

export function AuthPage({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authError,
  setAuthError,
  authLoading,
  handleAuthSubmit,
  passwordVisible,
  setPasswordVisible,
}) {
  console.log("[AUTH_PAGE] Rendering Auth Page - Mode:", authMode);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.paper, color: C.ink }}>
      <div
        className="w-full max-w-md rounded-xl p-7"
        style={{
          background: "#fff",
          border: `1px solid ${C.line}`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}>
        <div className="text-center mb-5">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.gold500 }}>
            WAFI CAPITAL CRM
          </p>
          <h1
            className="text-2xl font-bold mt-2"
            style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
            {authMode === "setup" ? "Première configuration" : "Connexion"}
          </h1>
          <p className="text-sm mt-2" style={{ color: C.inkSoft }}>
            {authMode === "setup"
              ? "Créez la première organisation et le premier compte administrateur."
              : "Utilisez votre compte pour synchroniser les données avec l'API backend."}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-3">
          <Field label="Nom d'utilisateur">
            <input
              required
              value={authForm.username}
              onChange={(e) =>
                setAuthForm((f) => ({ ...f, username: e.target.value }))
              }
              style={inputStyle}
              autoComplete="username"
            />
          </Field>
          {authMode === "setup" && (
            <Field label="Organisation">
              <input
                required
                value={authForm.organizationName}
                onChange={(e) =>
                  setAuthForm((f) => ({
                    ...f,
                    organizationName: e.target.value,
                  }))
                }
                style={inputStyle}
                autoComplete="organization"
              />
            </Field>
          )}
          {authMode === "setup" && (
            <Field label="Email">
              <input
                required
                type="email"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm((f) => ({ ...f, email: e.target.value }))
                }
                style={inputStyle}
                autoComplete="email"
              />
            </Field>
          )}
          <Field label="Mot de passe">
            <div style={{ position: "relative" }}>
              <input
                required
                type={passwordVisible ? "text" : "password"}
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm((f) => ({ ...f, password: e.target.value }))
                }
                style={{ ...inputStyle, paddingRight: 40 }}
                autoComplete={
                  authMode === "setup" ? "new-password" : "current-password"
                }
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((v) => !v)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 10,
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  color: C.inkSoft,
                }}
                aria-label={
                  passwordVisible
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }>
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          {authError && (
            <div className="text-sm" style={{ color: C.red }}>
              {authError}
            </div>
          )}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: C.navy900,
              color: C.gold400,
              border: "none",
              cursor: "pointer",
              opacity: authLoading ? 0.7 : 1,
            }}>
            {authLoading
              ? "Chargement…"
              : authMode === "setup"
                ? "Créer l'organisation"
                : "Se connecter"}
          </button>
        </form>

        <div className="text-center text-sm mt-4" style={{ color: C.inkSoft }}>
          {authMode === "setup"
            ? "Vous avez déjà un compte ?"
            : "Première fois ici ?"}
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "setup" ? "login" : "setup");
              setAuthError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: C.navy800,
              cursor: "pointer",
              fontWeight: 700,
            }}>
            {authMode === "setup" ? "Se connecter" : "Créer l'organisation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChangePasswordPage({
  username,
  changePasswordForm,
  setChangePasswordForm,
  changePasswordError,
  setChangePasswordError,
  changePasswordLoading,
  handleChangePasswordSubmit,
  passwordVisible,
  setPasswordVisible,
}) {
  console.log(
    "[AUTH_PAGE] Rendering Change Password Page - Username:",
    username,
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.paper, color: C.ink }}>
      <div
        className="w-full max-w-md rounded-xl p-7"
        style={{
          background: "#fff",
          border: `1px solid ${C.line}`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}>
        <div className="text-center mb-5">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.gold500 }}>
            WAFI CAPITAL CRM
          </p>
          <h1
            className="text-2xl font-bold mt-2"
            style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
            Changer votre mot de passe
          </h1>
          <p className="text-sm mt-2" style={{ color: C.inkSoft }}>
            {username
              ? `${username}, votre mot de passe temporaire doit être remplacé avant d'utiliser l'application.`
              : "Votre mot de passe temporaire doit être remplacé avant d'utiliser l'application."}
          </p>
        </div>

        <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
          <Field label="Mot de passe actuel">
            <input
              required
              type={passwordVisible ? "text" : "password"}
              value={changePasswordForm.currentPassword}
              onChange={(e) =>
                setChangePasswordForm((f) => ({
                  ...f,
                  currentPassword: e.target.value,
                }))
              }
              style={inputStyle}
              autoComplete="current-password"
            />
          </Field>
          <Field label="Nouveau mot de passe">
            <input
              required
              type={passwordVisible ? "text" : "password"}
              value={changePasswordForm.newPassword}
              onChange={(e) =>
                setChangePasswordForm((f) => ({
                  ...f,
                  newPassword: e.target.value,
                }))
              }
              style={inputStyle}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirmer le nouveau mot de passe">
            <input
              required
              type={passwordVisible ? "text" : "password"}
              value={changePasswordForm.confirmPassword}
              onChange={(e) =>
                setChangePasswordForm((f) => ({
                  ...f,
                  confirmPassword: e.target.value,
                }))
              }
              style={inputStyle}
              autoComplete="new-password"
            />
          </Field>
          {changePasswordError && (
            <div className="text-sm" style={{ color: C.red }}>
              {changePasswordError}
            </div>
          )}
          <button
            type="submit"
            disabled={changePasswordLoading}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: C.navy900,
              color: C.gold400,
              border: "none",
              cursor: "pointer",
              opacity: changePasswordLoading ? 0.7 : 1,
            }}>
            {changePasswordLoading
              ? "Mise à jour…"
              : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}

console.log("[AUTH_PAGE] Auth Page components loaded successfully");

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { setAuthToken, clearAuthToken } from "./api";
import { signup, login, logout as apiLogout, getCurrentUser, changePassword as apiChangePassword } from "./hooks/useAuth";
import { listApplications, saveApplication, deleteApplication } from "./hooks/useApplications";
import { listUsers, createUser } from "./hooks/useUsers";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Building2,
  Shield,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import "./index.css";

// Import constants and utilities
import {
  C,
  DEFAULT_PROCESSING_DAYS,
  EMPTY_FORM,
  STATUS,
} from "./utils/constants";
import {
  toLocalInputValue,
  toDateInputValue,
  formatDisplayDate,
  formatBytes,
  newId,
  refFor,
  complianceColor,
  computeDeadline,
  normalizeOrganizationName,
  normalizeUserList,
  isAdminUser,
  roleLabel,
  generateAppId,
} from "./utils/helpers";

// Import UI components and widgets
import {
  StatusBadge,
  Field,
  inputStyle,
  RequestModal,
  DetailModal,
} from "./components/widgets";

// Import page components
import { AuthPage, ChangePasswordPage } from "./pages/AuthPage";
import { RegistrePage } from "./pages/RegistrePage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";



// ================================================================
// Main Component
// ================================================================
export default function WafiCRM() {
  const navigate = useNavigate();
  const location = useLocation();

  // App data
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [exchanges, setExchanges] = useState([]);
  const [exDraft, setExDraft] = useState({ date: "", type: "Email", summary: "" });
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  // Auth state
  const [authMode, setAuthMode] = useState("setup");
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: "",
    password: "",
    email: "",
    organizationName: "",
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // User management
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [orgUsers, setOrgUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userForm, setUserForm] = useState({ username: "", email: "" });
  const [userCreateLoading, setUserCreateLoading] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  // ================================================================
  // Helper to handle 428 (password change required)
  // ================================================================
  function handle428() {
    setMustChangePassword(true);
  }

  // ================================================================
  // Session management
  // ================================================================
  function resetSession() {
    clearAuthToken();
    setCurrentUser(null);
    setUsername("");
    setIsAuthenticated(false);
    setOrganizationName("");
    setMustChangePassword(false);
    setApplications([]);
    setAuthError("");
    setChangePasswordError("");
    setOrgUsers([]);
    setUsersError("");
    setTemporaryPassword(null);
    setCanManageUsers(false);
    // Navigation handled by Routes redirect
  }

  async function loadApplications() {
    try {
      const apps = await listApplications();
      setApplications(apps);
    } catch (e) {
      if (e.response?.status === 401) {
        resetSession();
      } else if (e.response?.status === 428) {
        handle428();
      } else {
        setApplications([]);
      }
    }
  }

  function applyUserSession(user, fallbackUsername = "") {
    const nextUsername =
      user?.username ||
      fallbackUsername ||
      localStorage.getItem("wafi_username") ||
      "";
    setCurrentUser(user || null);
    setUsername(nextUsername);
    setOrganizationName(
      normalizeOrganizationName(user, organizationName || ""),
    );
    setIsAuthenticated(true);
    setMustChangePassword(Boolean(user?.mustChangePassword));
    // Navigate to registre only after auth is confirmed
    if (!user?.mustChangePassword) navigate("/registre");
  }

  async function loadUsers(allowProbe = false, userOverride = null) {
    const candidateUser = userOverride || currentUser;
    if (!allowProbe && !isAdminUser(candidateUser) && !canManageUsers) return;
    setUsersLoading(true);
    setUsersError("");
    try {
      const data = await listUsers();
      setCanManageUsers(true);
      setOrgUsers(normalizeUserList(data));
    } catch (e) {
      if (e.response?.status === 401) {
        resetSession();
        return;
      }
      if (e.response?.status === 428) {
        handle428();
        return;
      }
      if (e.response?.status === 403) {
        setCanManageUsers(false);
        if (allowProbe) return;
        setUsersError("Accès refusé : seuls les administrateurs peuvent gérer les utilisateurs.");
        return;
      }
      setUsersError("Impossible de charger les utilisateurs de l'organisation.");
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadCurrentUser() {
    const data = await getCurrentUser();
    const user = data?.user || null;
    applyUserSession(
      user,
      user?.username || localStorage.getItem("wafi_username") || "",
    );
    if (!user?.mustChangePassword) {
      await loadApplications();
      await loadUsers(true, user);
    }
  }

  // ================================================================
  // Auth: init
  // ================================================================
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("wafi_token");
        if (!token) {
          setIsAuthenticated(false);
          setAuthMode("setup");
          setLoading(false);
          return;
        }
        await loadCurrentUser();
      } catch (e) {
        if (e.response?.status === 401) {
          resetSession();
        } else if (e.response?.status === 428) {
          handle428();
        } else {
          setIsAuthenticated(false);
          setApplications([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ================================================================
  // Auth: signup / login
  // ================================================================
  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const data = authMode === "setup"
        ? await signup({
            username: authForm.username.trim(),
            password: authForm.password,
            email: authForm.email.trim(),
            organizationName: authForm.organizationName.trim(),
          })
        : await login({
            username: authForm.username.trim(),
            password: authForm.password,
          });

      const nextUser = data.user || {
        username: data.username || authForm.username,
        organizationName: data.organizationName || authForm.organizationName,
        mustChangePassword: data.mustChangePassword,
      };
      const nextUsername = nextUser.username || authForm.username;
      setAuthToken(data.token, nextUsername);
      applyUserSession(nextUser, nextUsername);

      if (data.mustChangePassword) {
        setMustChangePassword(true);
        setChangePasswordForm({
          currentPassword: authForm.password,
          newPassword: "",
          confirmPassword: "",
        });
        setLoading(false);
        return;
      }

      await loadApplications();
      await loadUsers(true, nextUser);
    } catch (e) {
      if (e.response?.status === 401) {
        setAuthError("Identifiants invalides.");
      } else if (e.response?.status === 409) {
        setAuthError("Ce nom d'utilisateur existe déjà.");
      } else if (e.response?.status === 400) {
        setAuthError("Vérifiez les informations saisies.");
      } else {
        setAuthError("Connexion impossible pour le moment.");
      }
    } finally {
      setAuthLoading(false);
    }
  }

  // ================================================================
  // Auth: change password
  // ================================================================
  async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordError("");

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError("Les nouveaux mots de passe ne correspondent pas.");
      setChangePasswordLoading(false);
      return;
    }

    try {
      const data = await apiChangePassword({
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword,
      });
      if (data?.token) {
        setAuthToken(data.token, username);
      }
      await loadCurrentUser();
      setMustChangePassword(false);
      setChangePasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await loadApplications();
      if (isAdminUser(currentUser || data?.user)) {
        await loadUsers(true, currentUser || data?.user);
      }
    } catch (e) {
      if (e.response?.status === 401) {
        setChangePasswordError("Mot de passe actuel invalide.");
      } else if (e.response?.status === 400) {
        setChangePasswordError("Impossible de changer le mot de passe.");
      } else {
        setChangePasswordError("Le changement de mot de passe a échoué.");
      }
    } finally {
      setChangePasswordLoading(false);
    }
  }

  // ================================================================
  // User management
  // ================================================================
  async function handleCreateUser(e) {
    e.preventDefault();
    setUserCreateLoading(true);
    setUsersError("");
    setTemporaryPassword(null);

    try {
      const data = await createUser({
        username: userForm.username.trim(),
        email: userForm.email.trim(),
      });
      if (data?.temporaryPassword) {
        setTemporaryPassword({
          username: data.username || data.user?.username || userForm.username.trim(),
          password: data.temporaryPassword,
        });
      }
      setUserForm({ username: "", email: "" });
      await loadUsers();
    } catch (e) {
      if (e.response?.status === 401) {
        resetSession();
      } else if (e.response?.status === 403) {
        setCanManageUsers(false);
        setUsersError("Accès refusé : seuls les administrateurs peuvent gérer les utilisateurs.");
      } else {
        setUsersError("Impossible de créer l'utilisateur pour le moment.");
      }
    } finally {
      setUserCreateLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {
      // ok
    } finally {
      resetSession();
      setAuthMode("login");
      navigate("/");
    }
  }

  // ================================================================
  // Application CRUD (modal)
  // ================================================================
  function nextSeq() {
    return applications.reduce((max, a) => Math.max(max, a.seq || 0), 0) + 1;
  }

  function openNew() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      receivedAt: toLocalInputValue(new Date()),
      processingDays: DEFAULT_PROCESSING_DAYS,
    });
    setExchanges([]);
    setExDraft({ date: toDateInputValue(new Date()), type: "Email", summary: "" });
    setSaveError("");
    setModalOpen(true);
  }

  function openEdit(a) {
    setEditingId(a.id);
    setForm({
      typeOfCustomer: a.typeOfCustomer || STATUS.NEW,
      companyName: a.companyName || "",
      contactName: a.contactName || "",
      email: a.email || "",
      phone: a.phone || "",
      attachment: a.attachment || "",
      subject: a.subject || "",
      receivedAt: toLocalInputValue(new Date(a.receivedAt)),
      processingDays: a.processingDays || DEFAULT_PROCESSING_DAYS,
      status: a.status || STATUS.NEW,
      closingDate: a.closingDate ? toDateInputValue(new Date(a.closingDate)) : "",
      notes: a.notes || "",
    });
    setExchanges(JSON.parse(JSON.stringify(a.exchanges || [])));
    setExDraft({ date: toDateInputValue(new Date()), type: "Email", summary: "" });
    setSaveError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  function openDetail(record) {
    setDetailRecord(record);
  }

  function closeDetail() {
    setDetailRecord(null);
  }

  // ================================================================
  // Exchanges
  // ================================================================
  function addExchange() {
    if (!exDraft.summary.trim() || !exDraft.date) return;
    setExchanges((prev) => [
      ...prev,
      {
        date: new Date(exDraft.date).toISOString(),
        type: exDraft.type,
        summary: exDraft.summary.trim(),
      },
    ]);
    setExDraft((d) => ({ ...d, summary: "" }));
  }

  function removeExchange(idx) {
    setExchanges((prev) => prev.filter((_, i) => i !== idx));
  }

  // ================================================================
  // Save / Delete application
  // ================================================================
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const receivedAt = new Date(form.receivedAt);
      if (Number.isNaN(receivedAt.getTime())) {
        setSaveError("La date de réception est invalide.");
        setSaving(false);
        return;
      }

      const appId = editingId || generateAppId();
      const payload = {
        typeOfCustomer: form.typeOfCustomer,
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        attachment: form.attachment.trim(),
        subject: form.subject.trim(),
        receivedAt: receivedAt.toISOString(),
        processingDays: Number(form.processingDays) || DEFAULT_PROCESSING_DAYS,
        status: form.status,
        closingDate: form.closingDate
          ? new Date(form.closingDate).toISOString()
          : null,
        notes: form.notes.trim(),
        exchanges,
        seq: editingId
          ? applications.find((a) => a.id === editingId)?.seq || nextSeq()
          : nextSeq(),
      };

      await saveApplication(appId, payload);

      // Refresh list
      await loadApplications();
      closeModal();
    } catch (e) {
      if (e.response?.status === 401) {
        resetSession();
      } else if (e.response?.status === 428) {
        handle428();
      } else {
        setSaveError("La demande n'a pas pu être enregistrée. Vérifiez la connexion au serveur et réessayez.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingId) return;
    if (!confirm("Supprimer cette demande du registre ?")) return;
    try {
      await deleteApplication(editingId);
      await loadApplications();
      closeModal();
    } catch (e) {
      if (e.response?.status === 401) {
        resetSession();
      } else if (e.response?.status === 428) {
        handle428();
      }
    }
  }

  // ================================================================
  // Derived data
  // ================================================================
  const filtered = applications
    .slice()
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .filter((a) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const hit = [a.contactName, a.companyName, a.subject, a.email].some(
          (v) => (v || "").toLowerCase().includes(q),
        );
        if (!hit) return false;
      }
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (typeFilter !== "all" && a.typeOfCustomer !== typeFilter) return false;
      return true;
    });

  const withColor = applications.map((a) => ({
    a,
    color: complianceColor(a),
    deadline: computeDeadline(a),
  }));
  const green = withColor.filter((x) => x.color === "green");
  const yellow = withColor.filter((x) => x.color === "yellow");
  const red = withColor.filter((x) => x.color === "red");
  const order = { red: 0, yellow: 1, green: 2 };
  const dashboardSorted = withColor
    .slice()
    .sort((a, b) => order[a.color] - order[b.color] || a.deadline - b.deadline);

  const totalCount = applications.length;
  const openCount = applications.filter(
    (a) => a.status === STATUS.IN_PROGRESS || a.status === STATUS.NEW,
  ).length;
  const userIsAdmin = isAdminUser(currentUser) || canManageUsers;
  const organizationLabel =
    organizationName || normalizeOrganizationName(currentUser, "");
  const currentPath = location.pathname.replace(/^\//, "");
  const displayedView = currentPath === "" || currentPath === "users" && !userIsAdmin
    ? "registre"
    : currentPath;

  // ================================================================
  // Render: single stable wrapper — avoids removeChild DOM mismatch
  // ================================================================
  return (
    <div
      className="min-h-screen"
      style={{
        background: C.paper,
        color: C.ink,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center" style={{ color: C.inkSoft }}>
          Chargement du registre…
        </div>
      ) : !isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl p-7" style={{ background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
            <div className="text-center mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold500 }}>WAFI CAPITAL CRM</p>
              <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
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
                <input required value={authForm.username} onChange={(e) => setAuthForm((f) => ({ ...f, username: e.target.value }))} style={inputStyle} autoComplete="username" />
              </Field>
              {authMode === "setup" && (
                <Field label="Organisation">
                  <input required value={authForm.organizationName} onChange={(e) => setAuthForm((f) => ({ ...f, organizationName: e.target.value }))} style={inputStyle} autoComplete="organization" />
                </Field>
              )}
              {authMode === "setup" && (
                <Field label="Email">
                  <input required type="email" value={authForm.email} onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} autoComplete="email" />
                </Field>
              )}
              <Field label="Mot de passe">
                <div style={{ position: "relative" }}>
                  <input required type={passwordVisible ? "text" : "password"} value={authForm.password} onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))} style={{ ...inputStyle, paddingRight: 40 }} autoComplete={authMode === "setup" ? "new-password" : "current-password"} />
                  <button type="button" onClick={() => setPasswordVisible((v) => !v)} style={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", border: "none", background: "transparent", padding: 0, cursor: "pointer", color: C.inkSoft }}>
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
              {authError && <div className="text-sm" style={{ color: C.red }}>{authError}</div>}
              <button type="submit" disabled={authLoading} className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ background: C.navy900, color: C.gold400, border: "none", cursor: "pointer", opacity: authLoading ? 0.7 : 1 }}>
                {authLoading ? "Chargement…" : authMode === "setup" ? "Créer l'organisation" : "Se connecter"}
              </button>
            </form>
            <div className="text-center text-sm mt-4" style={{ color: C.inkSoft }}>
              {authMode === "setup" ? "Vous avez déjà un compte ?" : "Première fois ici ?"}
              <button type="button" onClick={() => { setAuthMode(authMode === "setup" ? "login" : "setup"); setAuthError(""); }} style={{ background: "none", border: "none", color: C.navy800, cursor: "pointer", fontWeight: 700 }}>
                {authMode === "setup" ? "Se connecter" : "Créer l'organisation"}
              </button>
            </div>
          </div>
        </div>
      ) : mustChangePassword ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl p-7" style={{ background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
            <div className="text-center mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold500 }}>WAFI CAPITAL CRM</p>
              <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>Changer votre mot de passe</h1>
              <p className="text-sm mt-2" style={{ color: C.inkSoft }}>
                {username ? `${username}, votre mot de passe temporaire doit être remplacé avant d'utiliser l'application.` : "Votre mot de passe temporaire doit être remplacé avant d'utiliser l'application."}
              </p>
            </div>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <Field label="Mot de passe actuel">
                <input required type={passwordVisible ? "text" : "password"} value={changePasswordForm.currentPassword} onChange={(e) => setChangePasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} style={inputStyle} autoComplete="current-password" />
              </Field>
              <Field label="Nouveau mot de passe">
                <input required type={passwordVisible ? "text" : "password"} value={changePasswordForm.newPassword} onChange={(e) => setChangePasswordForm((f) => ({ ...f, newPassword: e.target.value }))} style={inputStyle} autoComplete="new-password" />
              </Field>
              <Field label="Confirmer le nouveau mot de passe">
                <input required type={passwordVisible ? "text" : "password"} value={changePasswordForm.confirmPassword} onChange={(e) => setChangePasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))} style={inputStyle} autoComplete="new-password" />
              </Field>
              {changePasswordError && <div className="text-sm" style={{ color: C.red }}>{changePasswordError}</div>}
              <button type="submit" disabled={changePasswordLoading} className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ background: C.navy900, color: C.gold400, border: "none", cursor: "pointer", opacity: changePasswordLoading ? 0.7 : 1 }}>
                {changePasswordLoading ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
              </button>
            </form>
          </div>
        </div>
      ) : (
      <div className="max-w-6xl mx-auto px-6 py-7 pb-16">
        {/* Masthead */}
        <div
          className="relative overflow-hidden rounded-xl px-8 py-7 mb-4 flex flex-wrap justify-between items-end gap-6"
          style={{
            background: `linear-gradient(135deg, ${C.navy950}, ${C.navy800})`,
            color: C.paper,
          }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 6,
              background: `linear-gradient(${C.gold400}, ${C.gold500})`,
            }}
          />
          <div>
            <p
              className="text-xs font-bold uppercase mb-1.5"
              style={{ color: C.gold400, letterSpacing: "0.16em" }}>
              WAFI CAPITAL S.A. · SICAV — BRVM
            </p>
            <h1
              className="text-2xl font-bold m-0"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {displayedView === "users"
                ? "Administration des utilisateurs"
                : "Registre des Demandes Clientèle"}
            </h1>
            <p className="text-sm mt-1.5 max-w-lg" style={{ color: "#c7d0de" }}>
              {displayedView === "users"
                ? "Gestion des comptes de l'organisation et partage manuel des mots de passe temporaires."
                : "Suivi des contacts, du délai de traitement statutaire, et de l'historique des échanges."}
            </p>
          </div>
          <div className="flex gap-5 text-right">
            <div>
              <div
                className="text-2xl leading-none"
                style={{ fontFamily: "Georgia, serif", color: C.gold400 }}>
                {totalCount}
              </div>
              <div
                className="text-[10px] uppercase mt-1"
                style={{ color: "#a9b4c6", letterSpacing: "0.1em" }}>
                Dossiers
              </div>
            </div>
            <div>
              <div
                className="text-2xl leading-none"
                style={{ fontFamily: "Georgia, serif", color: C.gold400 }}>
                {openCount}
              </div>
              <div
                className="text-[10px] uppercase mt-1"
                style={{ color: "#a9b4c6", letterSpacing: "0.1em" }}>
                En cours
              </div>
            </div>
          </div>
        </div>

        {/* Organization bar */}
        <div
          className="text-xs rounded-lg px-3.5 py-2 mb-4"
          style={{ background: C.paper2, border: `1px solid ${C.line}`, color: C.inkSoft }}>
          <b style={{ color: C.navy800 }}>Organisation</b> —{" "}
          {organizationLabel || "Organisation active"}
        </div>

        {/* User bar */}
        <div
          className="flex flex-wrap items-center justify-end gap-3 mb-3.5 text-xs"
          style={{ color: C.inkSoft }}>
          <span className="font-semibold" style={{ color: C.navy800 }}>
            Connecté : {username}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: C.paper2, border: `1px solid ${C.line}`, color: C.navy800 }}>
            <Building2 size={12} /> {organizationLabel || "Organisation"}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: C.paper2, border: `1px solid ${C.line}`, color: C.navy800 }}>
            <Shield size={12} /> {roleLabel(currentUser)}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md text-xs font-semibold"
            style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.navy900, cursor: "pointer" }}>
            Déconnexion
          </button>
          <button
            onClick={() => { navigate("/registre"); openNew(); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
            style={{ background: C.navy900, color: C.gold400, border: "none", cursor: "pointer" }}>
            <Plus size={13} /> Nouvelle demande
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-4"
          style={{ borderBottom: `1px solid ${C.line}` }}>
          {[
            { id: "registre", label: "Registre", icon: ListChecks },
            { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
            ...(userIsAdmin ? [{ id: "users", label: "Utilisateurs", icon: Users }] : []),
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/${t.id}`)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold -mb-px"
              style={{
                color: displayedView === t.id ? C.navy900 : C.inkSoft,
                borderBottomWidth: 2,
                borderBottomStyle: "solid",
                borderBottomColor: displayedView === t.id ? C.gold500 : "transparent",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Navigate to="/registre" />} />
          <Route
            path="/registre"
            element={
              <RegistrePage
                filtered={filtered}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                applications={applications}
                totalCount={totalCount}
                openNew={openNew}
                openDetail={openDetail}
                openEdit={openEdit}
                refFor={refFor}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                dashboardSorted={dashboardSorted}
                green={green}
                yellow={yellow}
                red={red}
                refFor={refFor}
              />
            }
          />
          <Route
            path="/users"
            element={
              userIsAdmin ? (
                <UsersPage
                  userForm={userForm}
                  setUserForm={setUserForm}
                  handleCreateUser={handleCreateUser}
                  userCreateLoading={userCreateLoading}
                  usersError={usersError}
                  temporaryPassword={temporaryPassword}
                  setTemporaryPassword={setTemporaryPassword}
                  usersLoading={usersLoading}
                  orgUsers={orgUsers}
                  loadUsers={loadUsers}
                />
              ) : (
                <Navigate to="/registre" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/registre" />} />
        </Routes>

        <p className="text-center text-xs mt-6" style={{ color: C.inkSoft }}>
          Registre interne WAFI CAPITAL — usage professionnel.
        </p>
      </div>
      )}

      {/* Request modal */}
      <RequestModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        editingId={editingId}
        applications={applications}
        form={form}
        setForm={setForm}
        exchanges={exchanges}
        exDraft={exDraft}
        setExDraft={setExDraft}
        saveError={saveError}
        saving={saving}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        addExchange={addExchange}
        removeExchange={removeExchange}
        refFor={refFor}
      />

      {/* Detail modal */}
      <DetailModal
        detailRecord={detailRecord}
        closeDetail={closeDetail}
        formatDisplayDate={formatDisplayDate}
        computeDeadline={computeDeadline}
        refFor={refFor}
        formatBytes={formatBytes}
      />
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef } from "react";
import api, { setAuthToken, clearAuthToken } from "./api";
import {
  Search, Plus, Paperclip, Download, X, Pencil, Eye, Settings2,
  LayoutDashboard, ListChecks, FileText, Trash2
} from "lucide-react";

/* ---------------------------------------------------------------
 * Palette de marque WAFI CAPITAL — appliquée via style inline
 * (les classes Tailwind arbitraires ne sont pas fiables dans cet
 * environnement, donc les couleurs de marque passent par des objets
 * de style pendant que Tailwind gère la mise en page / l'espacement).
 * --------------------------------------------------------------- */
const C = {
  navy950: "#0a1830",
  navy900: "#0e2340",
  navy800: "#16325c",
  navy700: "#20406f",
  gold500: "#c9a227",
  gold400: "#dab94a",
  paper: "#f6f4ee",
  paper2: "#ece7d9",
  ink: "#1c2430",
  inkSoft: "#5b6472",
  line: "#d8d2c0",
  green: "#3b6b4f",
  greenBg: "#e2ede5",
  yellow: "#8a6a12",
  yellowBg: "#f7edcf",
  red: "#9a3b3b",
  redBg: "#f5e2e2",
};

const STORAGE_KEY = "wafi-crm-data";
const MAX_FILE_BYTES = 3.5 * 1024 * 1024;

/* ---------------------------------------------------------------
 * Couche de stockage — parle à l'API du serveur Express/SQLite
 * via l'instance axios `api` (baseURL = VITE_API_URL, withCredentials
 * = true). NE PAS utiliser fetch() directement ici : des chemins
 * relatifs comme "/api/storage/..." se résolvent contre l'origine du
 * front-end (Vercel) et non contre le serveur Express, ce qui donne
 * des 404 qui n'ont rien à voir avec la clé demandée.
 * --------------------------------------------------------------- */
const storage = {
  get: async (key) => {
    try {
      const { data } = await api.get("/api/storage/" + encodeURIComponent(key));
      return { key: data.key, value: data.value };
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },
  set: async (key, value) => {
    try {
      const { data } = await api.put("/api/storage/" + encodeURIComponent(key), { value });
      return { key: data.key, value: data.value };
    } catch (err) {
      throw err;
    }
  },
  delete: async (key) => {
    try {
      await api.delete("/api/storage/" + encodeURIComponent(key));
      return { key, deleted: true };
    } catch (err) {
      throw err;
    }
  },
  list: async (prefix = "") => {
    const { data } = await api.get("/api/storage", { params: prefix ? { prefix } : {} });
    return data;
  },
  listKeys: async () => {
    const { data } = await api.get("/api/storage/keys");
    return data.keys || [];
  },
};

const EMPTY_FORM = {
  clientType: "Société",
  org: "",
  name: "",
  email: "",
  phone: "",
  attachment: "",
  subject: "",
  receivedAt: "",
  delayDays: 30,
  status: "Nouveau",
  treatedAt: "",
  notes: "",
};

/* ---------------- helpers ---------------- */
function pad(n) { return n.toString().padStart(2, "0"); }
function toLocalInputValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toDateInputValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatDisplayDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return { date: "—", time: "" };
  return {
    date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}
function refFor(c) {
  const y = new Date(c.receivedAt).getFullYear() || new Date().getFullYear();
  return `WAFI-${y}-${c.seq.toString().padStart(4, "0")}`;
}
function computeDeadline(c) {
  const d = new Date(c.receivedAt);
  d.setDate(d.getDate() + (Number(c.delayDays) || 0));
  return d;
}
function complianceColor(c) {
  const deadline = computeDeadline(c);
  if (c.status === "Traité") {
    if (!c.treatedAt) return "green";
    return new Date(c.treatedAt) <= deadline ? "green" : "red";
  }
  return new Date() <= deadline ? "yellow" : "red";
}
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}
function newId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

/* ---------------- small UI atoms ---------------- */
function Dot({ color }) {
  const map = { green: C.green, yellow: "#c99a1a", red: "#c1484d" };
  return (
    <span
      className="inline-block rounded-full mr-2 flex-shrink-0"
      style={{ width: 9, height: 9, background: map[color] }}
    />
  );
}
function StatusBadge({ status }) {
  const styles = {
    Nouveau: { bg: "#e4ebf5", color: C.navy800 },
    "En cours": { bg: C.yellowBg, color: C.yellow },
    Traité: { bg: C.greenBg, color: C.green },
  }[status] || { bg: C.paper2, color: C.ink };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: styles.bg, color: styles.color }}
    >
      {status}
    </span>
  );
}
function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: C.inkSoft }}>
        {label} {hint && <span className="font-normal normal-case tracking-normal" style={{ color: C.inkSoft }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}
const inputStyle = {
  width: "100%", padding: "9px 11px", border: `1px solid ${C.line}`,
  borderRadius: 6, fontSize: 13.5, color: C.ink, background: C.paper,
};

export default function WafiCRM() {
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState({ defaultDelayDays: 30 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("registre");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [exchanges, setExchanges] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [exDraft, setExDraft] = useState({ date: "", type: "Email", note: "" });
  const [uploadWarning, setUploadWarning] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [defaultDelayDraft, setDefaultDelayDraft] = useState(30);

  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "", email: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  function resetSession() {
    clearAuthToken();
    setUsername("");
    setIsAuthenticated(false);
    setContacts([]);
    setSettings({ defaultDelayDays: 30 });
    setAuthError("");
  }

  async function loadStoredData() {
    try {
      const res = await storage.get(STORAGE_KEY);
      const parsed = res?.value ? JSON.parse(res.value) : null;
      setContacts(parsed?.contacts || []);
      setSettings(parsed?.settings || { defaultDelayDays: 30 });
    } catch (e) {
      if (e.response?.status === 401) {
        resetSession();
        return;
      }
      setContacts([]);
      setSettings({ defaultDelayDays: 30 });
    }
  }

  /* ---------------- auth + load / save ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("wafi_token");
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const meRes = await api.get("/api/me");
        setUsername(meRes.data.username || localStorage.getItem("wafi_username") || "");
        setIsAuthenticated(true);
        await loadStoredData();
      } catch (e) {
        if (e.response?.status === 401) {
          resetSession();
        } else {
          setIsAuthenticated(false);
          setContacts([]);
          setSettings({ defaultDelayDays: 30 });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint = authMode === "signup" ? "/api/signup" : "/api/login";
      const payload = authMode === "signup"
        ? { username: authForm.username.trim(), password: authForm.password, email: authForm.email.trim() }
        : { username: authForm.username.trim(), password: authForm.password };

      const { data } = await api.post(endpoint, payload);
      const nextUsername = data.username || payload.username;
      setAuthToken(data.token, nextUsername);
      setUsername(nextUsername);
      setIsAuthenticated(true);
      try {
        await loadStoredData();
      } catch (e) {
        console.error("Erreur de chargement du stockage après authentification", e);
      }
      if (typeof window !== "undefined") {
        window.location.assign("/index.html");
      }
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

  async function handleLogout() {
    try {
      await api.post("/api/logout");
    } catch (e) {
      console.error("Erreur de déconnexion", e);
    } finally {
      resetSession();
    }
  }

  const persist = useCallback(async (nextContacts, nextSettings) => {
    try {
      await storage.set(
        STORAGE_KEY,
        JSON.stringify({ contacts: nextContacts, settings: nextSettings })
      );
    } catch (e) {
      if (e.response?.status === 401) {
        resetSession();
        return;
      }
      console.error("Erreur d'enregistrement", e);
    }
  }, []);

  function nextSeq() {
    return contacts.reduce((max, c) => Math.max(max, c.seq || 0), 0) + 1;
  }

  /* ---------------- modal open/close ---------------- */
  function openNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, receivedAt: toLocalInputValue(new Date()), delayDays: settings.defaultDelayDays });
    setExchanges([]);
    setAttachments([]);
    setRemovedAttachmentIds([]);
    setExDraft({ date: toDateInputValue(new Date()), type: "Email", note: "" });
    setUploadWarning("");
    setModalOpen(true);
  }
  function openEdit(c) {
    setEditingId(c.id);
    setForm({
      clientType: c.clientType, org: c.org || "", name: c.name || "", email: c.email || "",
      phone: c.phone || "", attachment: c.attachment || "", subject: c.subject || "",
      receivedAt: toLocalInputValue(new Date(c.receivedAt)), delayDays: c.delayDays,
      status: c.status, treatedAt: c.treatedAt ? toDateInputValue(new Date(c.treatedAt)) : "",
      notes: c.notes || "",
    });
    setExchanges(JSON.parse(JSON.stringify(c.exchanges || [])));
    setAttachments(JSON.parse(JSON.stringify(c.attachments || [])));
    setRemovedAttachmentIds([]);
    setExDraft({ date: toDateInputValue(new Date()), type: "Email", note: "" });
    setUploadWarning("");
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

  /* ---------------- exchanges ---------------- */
  function addExchange() {
    if (!exDraft.note.trim() || !exDraft.date) return;
    setExchanges(prev => [
      ...prev,
      { id: newId("ex"), date: new Date(exDraft.date).toISOString(), type: exDraft.type, note: exDraft.note.trim() },
    ]);
    setExDraft(d => ({ ...d, note: "" }));
  }
  function removeExchange(id) {
    setExchanges(prev => prev.filter(x => x.id !== id));
  }

  /* ---------------- attachments ---------------- */
  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    setUploadWarning("");
    for (const file of files) {
      if (file.type !== "application/pdf") {
        setUploadWarning(`« ${file.name} » ignoré : seuls les fichiers PDF sont acceptés.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setUploadWarning(`« ${file.name} » dépasse 3,5 Mo et n'a pas été ajouté.`);
        continue;
      }
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setAttachments(prev => [...prev, { id: newId("att"), filename: file.name, size: file.size, isNew: true, dataUrl }]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  function removeAttachment(id) {
    const att = attachments.find(a => a.id === id);
    if (att && !att.isNew) setRemovedAttachmentIds(prev => [...prev, id]);
    setAttachments(prev => prev.filter(a => a.id !== id));
  }
  async function downloadAttachment(id, list = attachments) {
    const att = (list || attachments).find(a => a.id === id);
    if (!att) return;
    let dataUrl = att.dataUrl;
    if (!dataUrl) {
      try {
        const res = await storage.get("wafi-crm-file:" + id);
        dataUrl = res?.value;
      } catch (e) {
        alert("Impossible de récupérer ce document.");
        return;
      }
    }
    if (!dataUrl) { alert("Document introuvable."); return; }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = att.filename;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }
  }

  /* ---------------- save / delete contact ---------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    for (const id of removedAttachmentIds) {
      try { await storage.delete("wafi-crm-file:" + id); } catch (e) {}
    }
    for (const att of attachments) {
      if (att.isNew) {
        try { await storage.set("wafi-crm-file:" + att.id, att.dataUrl); } catch (e) {
          alert(`Le document « ${att.filename} » n'a pas pu être enregistré.`);
        }
      }
    }
    const attachmentsMeta = attachments.map(a => ({
      id: a.id, filename: a.filename, size: a.size, uploadedAt: a.uploadedAt || new Date().toISOString(),
    }));
    const payload = {
      clientType: form.clientType, org: form.org.trim(), name: form.name.trim(),
      email: form.email.trim(), phone: form.phone.trim(), attachment: form.attachment.trim(),
      attachments: attachmentsMeta, subject: form.subject.trim(),
      receivedAt: new Date(form.receivedAt).toISOString(),
      delayDays: Number(form.delayDays) || settings.defaultDelayDays,
      status: form.status,
      treatedAt: form.treatedAt ? new Date(form.treatedAt).toISOString() : null,
      notes: form.notes.trim(), exchanges,
    };
    let next;
    if (editingId) {
      next = contacts.map(c => (c.id === editingId ? { ...c, ...payload } : c));
    } else {
      next = [...contacts, { id: newId("c"), seq: nextSeq(), ...payload }];
    }
    setContacts(next);
    await persist(next, settings);
    setSaving(false);
    closeModal();
  }
  async function handleDelete() {
    if (!editingId) return;
    if (!confirm("Supprimer cette demande du registre ?")) return;
    const c = contacts.find(c => c.id === editingId);
    for (const a of c?.attachments || []) {
      try { await storage.delete("wafi-crm-file:" + a.id); } catch (e) {}
    }
    const next = contacts.filter(c => c.id !== editingId);
    setContacts(next);
    await persist(next, settings);
    closeModal();
  }

  /* ---------------- settings ---------------- */
  function openSettings() {
    setDefaultDelayDraft(settings.defaultDelayDays);
    setSettingsOpen(true);
  }
  async function saveSettings() {
    const nextSettings = { ...settings, defaultDelayDays: Number(defaultDelayDraft) || 30 };
    setSettings(nextSettings);
    await persist(contacts, nextSettings);
    setSettingsOpen(false);
  }

  /* ---------------- derived data ---------------- */
  const filtered = contacts
    .slice()
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .filter(c => {
      const q = search.trim().toLowerCase();
      if (q) {
        const hit = [c.name, c.org, c.subject, c.email].some(v => (v || "").toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (typeFilter !== "all" && c.clientType !== typeFilter) return false;
      return true;
    });

  const withColor = contacts.map(c => ({ c, color: complianceColor(c), deadline: computeDeadline(c) }));
  const green = withColor.filter(x => x.color === "green");
  const yellow = withColor.filter(x => x.color === "yellow");
  const red = withColor.filter(x => x.color === "red");
  const order = { red: 0, yellow: 1, green: 2 };
  const dashboardSorted = withColor.slice().sort((a, b) => order[a.color] - order[b.color] || a.deadline - b.deadline);

  const totalCount = contacts.length;
  const openCount = contacts.filter(c => c.status === "En cours" || c.status === "Nouveau").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.paper, color: C.inkSoft }}>
        Chargement du registre…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.paper, color: C.ink }}>
        <div className="w-full max-w-md rounded-xl p-7" style={{ background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
          <div className="text-center mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold500 }}>WAFI CAPITAL CRM</p>
            <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
              {authMode === "login" ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="text-sm mt-2" style={{ color: C.inkSoft }}>
              Utilisez votre compte pour synchroniser les données de stockage avec l’API backend.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <Field label="Nom d'utilisateur">
              <input
                required
                value={authForm.username}
                onChange={(e) => setAuthForm((f) => ({ ...f, username: e.target.value }))}
                style={inputStyle}
                autoComplete="username"
              />
            </Field>
            {authMode === "signup" && (
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
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
                  onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
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
                  aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            {authError && <div className="text-sm" style={{ color: C.red }}>{authError}</div>}
            <button type="submit" disabled={authLoading} className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ background: C.navy900, color: C.gold400, border: "none", cursor: "pointer", opacity: authLoading ? 0.7 : 1 }}>
              {authLoading ? "Chargement…" : authMode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <div className="text-center text-sm mt-4" style={{ color: C.inkSoft }}>
            {authMode === "login" ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}{" "}
            <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }} style={{ background: "none", border: "none", color: C.navy800, cursor: "pointer", fontWeight: 700 }}>
              {authMode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.paper, color: C.ink, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-7 pb-16">

        {/* Masthead */}
        <div
          className="relative overflow-hidden rounded-xl px-8 py-7 mb-4 flex flex-wrap justify-between items-end gap-6"
          style={{ background: `linear-gradient(135deg, ${C.navy950}, ${C.navy800})`, color: C.paper }}
        >
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 6, background: `linear-gradient(${C.gold400}, ${C.gold500})` }} />
          <div>
            <p className="text-xs font-bold uppercase mb-1.5" style={{ color: C.gold400, letterSpacing: "0.16em" }}>
              WAFI CAPITAL S.A. · SICAV — BRVM
            </p>
            <h1 className="text-2xl font-bold m-0" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Registre des Demandes Clientèle
            </h1>
            <p className="text-sm mt-1.5 max-w-lg" style={{ color: "#c7d0de" }}>
              Suivi des contacts, du délai de traitement statutaire, et de l'historique des échanges.
            </p>
          </div>
          <div className="flex gap-5 text-right">
            <div>
              <div className="text-2xl leading-none" style={{ fontFamily: "Georgia, serif", color: C.gold400 }}>{totalCount}</div>
              <div className="text-[10px] uppercase mt-1" style={{ color: "#a9b4c6", letterSpacing: "0.1em" }}>Dossiers</div>
            </div>
            <div>
              <div className="text-2xl leading-none" style={{ fontFamily: "Georgia, serif", color: C.gold400 }}>{openCount}</div>
              <div className="text-[10px] uppercase mt-1" style={{ color: "#a9b4c6", letterSpacing: "0.1em" }}>En cours</div>
            </div>
          </div>
        </div>

        <div className="text-xs rounded-lg px-3.5 py-2 mb-4" style={{ background: C.paper2, border: `1px solid ${C.line}`, color: C.inkSoft }}>
          <b style={{ color: C.navy800 }}>Registre partagé</b> — visible et modifiable par tous les utilisateurs de cet outil.
        </div>

        <div className="flex items-center justify-end gap-3 mb-3.5 text-xs" style={{ color: C.inkSoft }}>
          <span className="font-semibold" style={{ color: C.navy800 }}>Connecté : {username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md text-xs font-semibold"
            style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.navy900, cursor: "pointer" }}
          >
            Déconnexion
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4" style={{ borderBottom: `1px solid ${C.line}` }}>
          {[
            { id: "registre", label: "Registre", icon: ListChecks },
            { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold -mb-px"
              style={{
                color: tab === t.id ? C.navy900 : C.inkSoft,
                borderBottom: `2px solid ${tab === t.id ? C.gold500 : "transparent"}`,
                background: "none", border: "none", borderBottomWidth: 2,
                borderBottomStyle: "solid",
                borderBottomColor: tab === t.id ? C.gold500 : "transparent",
                cursor: "pointer",
              }}
            >
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </div>

        {tab === "registre" && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1" style={{ minWidth: 220 }}>
                <Search size={15} className="absolute" style={{ left: 11, top: "50%", transform: "translateY(-50%)", color: C.inkSoft }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un client, un sujet, une société…"
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
                <option value="all">Tous les types</option>
                <option value="Société">Société</option>
                <option value="Personne physique">Personne physique</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
                <option value="all">Tous les statuts</option>
                <option value="Nouveau">Nouveau</option>
                <option value="En cours">En cours</option>
                <option value="Traité">Traité</option>
              </select>
              <button
                onClick={openSettings}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "transparent", color: C.navy900, border: `1px solid ${C.line}`, cursor: "pointer" }}
              >
                <Settings2 size={14} /> Délai statutaire par défaut
              </button>
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: C.navy900, color: C.gold400, border: "none", cursor: "pointer" }}
              >
                <Plus size={15} /> Nouvelle demande
              </button>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ background: C.paper2 }}>
                    {["Réf.", "Client", "Coordonnées", "Sujet", "Reçu le", "Statut", "Délai", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold uppercase" style={{ color: C.inkSoft, letterSpacing: "0.08em", borderBottom: `1px solid ${C.line}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const { date, time } = formatDisplayDate(c.receivedAt);
                    const deadline = computeDeadline(c);
                    const color = complianceColor(c);
                    return (
                      <tr key={c.id} className="hover:bg-[#fbfaf6]" style={{ borderBottom: `1px solid #ece8dc` }}>
                        <td className="px-4 py-3.5 align-top">
                          <span className="font-bold text-xs" style={{ fontFamily: "Georgia, serif", color: C.navy700 }}>{refFor(c)}</span>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="font-semibold">{c.name || "—"}</div>
                          {c.org && <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>{c.org}</div>}
                          <div className="text-[10px] font-bold uppercase mt-0.5" style={{ color: C.navy700, letterSpacing: "0.04em" }}>{c.clientType}</div>
                        </td>
                        <td className="px-4 py-3.5 align-top text-xs" style={{ color: C.inkSoft }}>
                          {c.email && <div>{c.email}</div>}
                          {c.phone && <div>{c.phone}</div>}
                          {!c.email && !c.phone && <div>—</div>}
                        </td>
                        <td className="px-4 py-3.5 align-top" style={{ maxWidth: 230 }}>{c.subject || "—"}</td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="font-semibold">{date}</div>
                          <div className="text-xs" style={{ color: C.inkSoft }}>{time}</div>
                        </td>
                        <td className="px-4 py-3.5 align-top"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex items-center text-xs"><Dot color={color} />{deadline.toLocaleDateString("fr-FR")}</div>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openDetail(c)} title="Voir les détails" style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, padding: 4 }}>
                              <Eye size={15} />
                            </button>
                            <button onClick={() => openEdit(c)} title="Modifier" style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, padding: 4 }}>
                              <Pencil size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16" style={{ color: C.inkSoft }}>
                  <div className="text-lg mb-1.5" style={{ fontFamily: "Georgia, serif", color: C.navy800 }}>
                    {contacts.length === 0 ? "Aucune demande enregistrée" : "Aucun résultat pour ces filtres"}
                  </div>
                  <div>{contacts.length === 0 && 'Cliquez sur « + Nouvelle demande » pour commencer le registre.'}</div>
                </div>
              )}
            </div>
            <p className="text-center text-xs mt-4" style={{ color: C.inkSoft }}>
              Pièces jointes : documents PDF (3,5 Mo max chacun), ou notez une référence si le fichier est conservé ailleurs.
            </p>
          </>
        )}

        {tab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
              {[
                { label: "Traités dans les délais", sub: "Dossiers clôturés avant l'échéance statutaire", n: green.length, color: C.green },
                { label: "En cours, dans les délais", sub: "Dossiers ouverts, échéance non dépassée", n: yellow.length, color: "#c99a1a" },
                { label: "Hors délai", sub: "Échéance dépassée, traités en retard ou toujours ouverts", n: red.length, color: "#c1484d" },
              ].map(k => (
                <div key={k.label} className="relative overflow-hidden rounded-xl px-5 py-4.5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: k.color }} />
                  <div className="text-3xl" style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>{k.n}</div>
                  <div className="text-xs mt-1.5" style={{ color: C.inkSoft }}>{k.label}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: C.inkSoft }}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ background: C.paper2 }}>
                    {["", "Réf.", "Client", "Sujet", "Reçu le", "Échéance", "Statut"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold uppercase" style={{ color: C.inkSoft, letterSpacing: "0.08em", borderBottom: `1px solid ${C.line}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboardSorted.map(({ c, color, deadline }) => {
                    const { date } = formatDisplayDate(c.receivedAt);
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #ece8dc" }}>
                        <td className="px-4 py-3.5"><Dot color={color} /></td>
                        <td className="px-4 py-3.5"><span className="font-bold text-xs" style={{ fontFamily: "Georgia, serif", color: C.navy700 }}>{refFor(c)}</span></td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold">{c.name || "—"}</div>
                          {c.org && <div className="text-xs" style={{ color: C.inkSoft }}>{c.org}</div>}
                        </td>
                        <td className="px-4 py-3.5" style={{ maxWidth: 230 }}>{c.subject || "—"}</td>
                        <td className="px-4 py-3.5">{date}</td>
                        <td className="px-4 py-3.5">{deadline.toLocaleDateString("fr-FR")}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {dashboardSorted.length === 0 && (
                <div className="text-center py-16" style={{ color: C.inkSoft }}>
                  <div className="text-lg" style={{ fontFamily: "Georgia, serif", color: C.navy800 }}>Aucun dossier à afficher</div>
                </div>
              )}
            </div>
          </>
        )}

        <p className="text-center text-xs mt-6" style={{ color: C.inkSoft }}>Registre interne WAFI CAPITAL — usage professionnel.</p>
      </div>

      {/* -------------------- Request modal -------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-6 z-50" style={{ background: "rgba(10,24,48,0.45)" }} onClick={e => e.target === e.currentTarget && closeModal()}>
          <form onSubmit={handleSubmit} className="w-full rounded-xl p-7" style={{ maxWidth: 640, background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
            <span className="inline-block text-xs font-bold px-2.5 py-1 rounded mb-3.5" style={{ background: C.paper2, color: C.navy800 }}>
              {editingId ? refFor(contacts.find(c => c.id === editingId)) : "Nouvelle référence"}
            </span>
            <h2 className="text-xl font-bold m-0 mb-1" style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
              {editingId ? "Modifier la demande" : "Nouvelle demande client"}
            </h2>
            <p className="text-xs mb-5" style={{ color: C.inkSoft }}>
              Enregistrez le contact, le sujet, le délai statutaire et l'historique des échanges.
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Type de client">
                <select value={form.clientType} onChange={e => setForm(f => ({ ...f, clientType: e.target.value }))} style={inputStyle}>
                  <option value="Société">Société</option>
                  <option value="Personne physique">Personne physique</option>
                </select>
              </Field>
              <Field label={form.clientType === "Société" ? "Nom de la société" : "Référence / employeur (optionnel)"}>
                <input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Nom du contact">
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Téléphone">
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Pièce jointe (référence)">
                <input placeholder="ex : Attestation.pdf" value={form.attachment} onChange={e => setForm(f => ({ ...f, attachment: e.target.value }))} style={inputStyle} />
              </Field>
              <div className="col-span-2">
                <Field label="Sujet de la demande">
                  <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle} />
                </Field>
              </div>
              <Field label="Date et heure de réception">
                <input type="datetime-local" required value={form.receivedAt} onChange={e => setForm(f => ({ ...f, receivedAt: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Délai de traitement statutaire (jours)">
                <input type="number" min="1" required value={form.delayDays} onChange={e => setForm(f => ({ ...f, delayDays: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Statut">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                  <option>Nouveau</option><option>En cours</option><option>Traité</option>
                </select>
              </Field>
              <Field label="Date de clôture" hint="(si traité)">
                <input type="date" value={form.treatedAt} onChange={e => setForm(f => ({ ...f, treatedAt: e.target.value }))} style={inputStyle} />
              </Field>
              <div className="col-span-2">
                <Field label="Notes">
                  <textarea rows={2} placeholder="Détails complémentaires sur la demande…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
                </Field>
              </div>
            </div>

            {/* Attachments */}
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
              <div className="text-xs font-bold uppercase mb-2.5 flex items-center gap-1.5" style={{ color: C.navy800, letterSpacing: "0.05em" }}>
                <Paperclip size={13} /> Pièces jointes (PDF)
              </div>
              {attachments.length === 0 ? (
                <div className="text-xs italic mb-2.5" style={{ color: C.inkSoft }}>Aucun document PDF joint pour ce dossier.</div>
              ) : (
                <div className="flex flex-col gap-2 mb-2.5">
                  {attachments.map(a => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-xs" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} style={{ color: C.navy700, flexShrink: 0 }} />
                        <span className="font-semibold truncate">{a.filename}</span>
                        <span style={{ color: C.inkSoft, flexShrink: 0 }}>{formatBytes(a.size)}</span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button type="button" onClick={() => downloadAttachment(a.id)} title="Télécharger" style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, padding: 4 }}>
                          <Download size={14} />
                        </button>
                        <button type="button" onClick={() => removeAttachment(a.id)} title="Retirer" style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, padding: 4 }}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="application/pdf" multiple onChange={handleFiles} className="text-xs" />
              <div className="text-[11px] mt-1" style={{ color: uploadWarning ? C.red : C.inkSoft }}>
                {uploadWarning || "Fichiers PDF, 3,5 Mo maximum chacun."}
              </div>
            </div>

            {/* Exchange history */}
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
              <div className="text-xs font-bold uppercase mb-2.5" style={{ color: C.navy800, letterSpacing: "0.05em" }}>
                Historique des échanges
              </div>
              {exchanges.length === 0 ? (
                <div className="text-xs italic mb-2.5" style={{ color: C.inkSoft }}>Aucun échange enregistré pour ce dossier.</div>
              ) : (
                <div className="flex flex-col gap-2 mb-2.5" style={{ maxHeight: 150, overflowY: "auto" }}>
                  {exchanges.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(ex => (
                    <div key={ex.id} className="relative rounded-md px-2.5 py-2 text-xs" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                      <button type="button" onClick={() => removeExchange(ex.id)} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", cursor: "pointer", color: C.inkSoft }}>
                        <X size={12} />
                      </button>
                      <div className="text-[10.5px] font-bold uppercase mb-0.5" style={{ color: C.inkSoft }}>
                        {ex.type} · {new Date(ex.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div>{ex.note}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-2 items-end" style={{ gridTemplateColumns: "1fr 1fr 2fr auto" }}>
                <Field label="Date">
                  <input type="date" value={exDraft.date} onChange={e => setExDraft(d => ({ ...d, date: e.target.value }))} style={inputStyle} />
                </Field>
                <Field label="Type">
                  <select value={exDraft.type} onChange={e => setExDraft(d => ({ ...d, type: e.target.value }))} style={inputStyle}>
                    <option>Email</option><option>Appel</option><option>WhatsApp</option><option>Réunion</option><option>Autre</option>
                  </select>
                </Field>
                <Field label="Note">
                  <input placeholder="Résumé de l'échange" value={exDraft.note} onChange={e => setExDraft(d => ({ ...d, note: e.target.value }))} style={inputStyle} />
                </Field>
                <button type="button" onClick={addExchange} className="px-3 py-2 rounded-md text-xs font-semibold" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.navy900, cursor: "pointer" }}>
                  Ajouter
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6">
              {editingId && (
                <button type="button" onClick={handleDelete} className="mr-auto px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.red, cursor: "pointer" }}>
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
              <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.navy900, cursor: "pointer" }}>
                Annuler
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ background: C.navy900, color: C.gold400, border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -------------------- Settings modal -------------------- */}
      {settingsOpen && (
        <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-6 z-50" style={{ background: "rgba(10,24,48,0.45)" }} onClick={e => e.target === e.currentTarget && setSettingsOpen(false)}>
          <div className="w-full rounded-xl p-7" style={{ maxWidth: 420, background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
            <h2 className="text-xl font-bold m-0 mb-1" style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>Délai statutaire par défaut</h2>
            <p className="text-xs mb-5" style={{ color: C.inkSoft }}>Appliqué automatiquement aux nouvelles demandes (modifiable au cas par cas).</p>
            <Field label="Nombre de jours">
              <input type="number" min="1" value={defaultDelayDraft} onChange={e => setDefaultDelayDraft(e.target.value)} style={inputStyle} />
            </Field>
            <div className="flex justify-end gap-2.5 mt-6">
              <button onClick={() => setSettingsOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.navy900, cursor: "pointer" }}>
                Annuler
              </button>
              <button onClick={saveSettings} className="px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ background: C.navy900, color: C.gold400, border: "none", cursor: "pointer" }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {detailRecord && (
        <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(10,24,48,0.45)" }} onClick={e => e.target === e.currentTarget && closeDetail()}>
          <div className="ml-auto w-full max-w-xl h-full overflow-y-auto bg-white p-6 shadow-2xl" style={{ minHeight: "100%" }}>
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="text-[10px] font-bold uppercase" style={{ color: C.gold500, letterSpacing: "0.18em" }}>{refFor(detailRecord)}</div>
                <h2 className="text-2xl font-bold mt-2" style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>Détails du dossier</h2>
                <div className="text-xs mt-2" style={{ color: C.inkSoft }}>Consultation des informations enregistrées et des pièces jointes.</div>
              </div>
              <button type="button" onClick={closeDetail} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft, padding: 8 }}>
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16 }}>
                <div className="text-xs font-bold uppercase mb-2" style={{ color: C.inkSoft }}>Contact</div>
                <div className="text-sm font-semibold" style={{ color: C.navy900 }}>{detailRecord.name || "—"}</div>
                <div className="text-xs" style={{ color: C.inkSoft }}>{detailRecord.org || "—"}</div>
                <div className="text-xs mt-2" style={{ color: C.inkSoft }}>{detailRecord.email || "—"}</div>
                <div className="text-xs" style={{ color: C.inkSoft }}>{detailRecord.phone || "—"}</div>
              </div>
              <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16 }}>
                <div className="text-xs font-bold uppercase mb-2" style={{ color: C.inkSoft }}>Statut</div>
                <StatusBadge status={detailRecord.status} />
                <div className="text-xs mt-3" style={{ color: C.inkSoft }}><strong>Sujet :</strong> {detailRecord.subject || "—"}</div>
                <div className="text-xs mt-2" style={{ color: C.inkSoft }}><strong>Type :</strong> {detailRecord.clientType}</div>
                <div className="text-xs mt-2" style={{ color: C.inkSoft }}><strong>Référence :</strong> {detailRecord.attachment || "—"}</div>
              </div>
            </div>

            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16 }}>
                <div className="text-xs font-bold uppercase mb-2" style={{ color: C.inkSoft }}>Dates</div>
                <div className="text-xs" style={{ color: C.inkSoft }}><strong>Reçu le :</strong> {formatDisplayDate(detailRecord.receivedAt).date} {formatDisplayDate(detailRecord.receivedAt).time}</div>
                <div className="text-xs" style={{ color: C.inkSoft }}><strong>Traitement avant :</strong> {computeDeadline(detailRecord).toLocaleDateString("fr-FR")}</div>
                <div className="text-xs" style={{ color: C.inkSoft }}><strong>Clôture :</strong> {detailRecord.treatedAt ? formatDisplayDate(detailRecord.treatedAt).date : "—"}</div>
              </div>
              <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16 }}>
                <div className="text-xs font-bold uppercase mb-2" style={{ color: C.inkSoft }}>Détails supplémentaires</div>
                <div className="text-xs" style={{ color: C.inkSoft }}><strong>Délai :</strong> {detailRecord.delayDays} jours</div>
                <div className="text-xs mt-2" style={{ color: C.inkSoft }}><strong>Notes :</strong></div>
                <div className="text-sm" style={{ color: C.inkSoft, whiteSpace: "pre-wrap" }}>{detailRecord.notes || "Aucune note."}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-bold uppercase mb-3" style={{ color: C.navy800, letterSpacing: "0.05em" }}>Pièces jointes</div>
              {detailRecord.attachments?.length ? (
                <div className="space-y-2">
                  {detailRecord.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between rounded-md px-3 py-2" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: C.navy900 }}>{att.filename}</div>
                        <div className="text-[11px]" style={{ color: C.inkSoft }}>{formatBytes(att.size)}</div>
                      </div>
                      <button type="button" onClick={() => downloadAttachment(att.id, detailRecord.attachments)} className="px-3 py-2 rounded-md text-xs font-semibold" style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.navy900, cursor: "pointer" }}>
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs" style={{ color: C.inkSoft }}>Aucune pièce jointe enregistrée.</div>
              )}
            </div>

            <div>
              <div className="text-xs font-bold uppercase mb-3" style={{ color: C.navy800, letterSpacing: "0.05em" }}>Historique des échanges</div>
              {detailRecord.exchanges?.length ? (
                <div className="space-y-3">
                  {detailRecord.exchanges.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(ex => (
                    <div key={ex.id} className="rounded-md px-3 py-2" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                      <div className="text-[10.5px] font-bold uppercase" style={{ color: C.inkSoft }}>{ex.type} · {new Date(ex.date).toLocaleDateString("fr-FR")}</div>
                      <div className="text-sm mt-1" style={{ color: C.inkSoft }}>{ex.note}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs" style={{ color: C.inkSoft }}>Aucun échange enregistré.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
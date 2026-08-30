// ================================================================
// WAFI CAPITAL CRM - Widgets & Components
// All modals, popups, and reusable UI components
// ================================================================

import React, { useRef } from "react";
import {
  Download,
  X,
  FileText,
  Paperclip,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { C, MAX_FILE_BYTES } from "../utils/constants";
import { formatBytes, downloadAttachment } from "../utils/helpers";

console.log("[WIDGETS] Initializing widgets and components...");

// ==================== UI Atoms ====================

export function Dot({ color }) {
  console.log("[WIDGETS] Rendering Dot with color:", color);
  const map = { green: C.green, yellow: "#c99a1a", red: "#c1484d" };
  return (
    <span
      className="inline-block rounded-full mr-2 flex-shrink-0"
      style={{ width: 9, height: 9, background: map[color] }}
    />
  );
}

export function StatusBadge({ status }) {
  console.log("[WIDGETS] Rendering StatusBadge with status:", status);
  const styles = {
    Nouveau: { bg: "#e4ebf5", color: C.navy800 },
    "En cours": { bg: C.yellowBg, color: C.yellow },
    Traité: { bg: C.greenBg, color: C.green },
  }[status] || { bg: C.paper2, color: C.ink };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: styles.bg, color: styles.color }}>
      {status}
    </span>
  );
}

export function Field({ label, children, hint }) {
  console.log("[WIDGETS] Rendering Field with label:", label);
  return (
    <div>
      <label
        className="block text-xs font-bold uppercase tracking-wide mb-1"
        style={{ color: C.inkSoft }}>
        {label}{" "}
        {hint && (
          <span
            className="font-normal normal-case tracking-normal"
            style={{ color: C.inkSoft }}>
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  border: `1px solid ${C.line}`,
  borderRadius: 6,
  fontSize: 13.5,
  color: C.ink,
  background: C.paper,
};

// ==================== Modals ====================

export function RequestModal({
  modalOpen,
  closeModal,
  editingId,
  contacts,
  form,
  setForm,
  exchanges,
  attachments,
  exDraft,
  setExDraft,
  uploadWarning,
  saveError,
  saving,
  handleSubmit,
  handleDelete,
  addExchange,
  removeExchange,
  removeAttachment,
  downloadAttachment: downloadAtt,
  handleFiles,
  fileInputRef,
  refFor,
  newId,
}) {
  console.log("[WIDGETS] Rendering RequestModal - editingId:", editingId);

  if (!modalOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center overflow-y-auto p-6 z-50"
      style={{ background: "rgba(10,24,48,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-xl p-7"
        style={{
          maxWidth: 640,
          background: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}>
        <span
          className="inline-block text-xs font-bold px-2.5 py-1 rounded mb-3.5"
          style={{ background: C.paper2, color: C.navy800 }}>
          {editingId
            ? refFor(contacts.find((c) => c.id === editingId))
            : "Nouvelle référence"}
        </span>
        <h2
          className="text-xl font-bold m-0 mb-1"
          style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
          {editingId ? "Modifier la demande" : "Nouvelle demande client"}
        </h2>
        <p className="text-xs mb-5" style={{ color: C.inkSoft }}>
          Enregistrez le contact, le sujet, le délai statutaire et l'historique
          des échanges.
        </p>

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Type de client">
            <select
              value={form.clientType}
              onChange={(e) =>
                setForm((f) => ({ ...f, clientType: e.target.value }))
              }
              style={inputStyle}>
              <option value="Société">Société</option>
              <option value="Personne physique">Personne physique</option>
            </select>
          </Field>
          <Field
            label={
              form.clientType === "Société"
                ? "Nom de la société"
                : "Référence / employeur (optionnel)"
            }>
            <input
              value={form.org}
              onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Nom du contact">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Téléphone">
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Pièce jointe (référence)">
            <input
              placeholder="ex : Attestation.pdf"
              value={form.attachment}
              onChange={(e) =>
                setForm((f) => ({ ...f, attachment: e.target.value }))
              }
              style={inputStyle}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Sujet de la demande">
              <input
                required
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                style={inputStyle}
              />
            </Field>
          </div>
          <Field label="Date et heure de réception">
            <input
              type="datetime-local"
              required
              value={form.receivedAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, receivedAt: e.target.value }))
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Délai de traitement statutaire (jours)">
            <input
              type="number"
              min="1"
              required
              value={form.delayDays}
              onChange={(e) =>
                setForm((f) => ({ ...f, delayDays: e.target.value }))
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Statut">
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              style={inputStyle}>
              <option>Nouveau</option>
              <option>En cours</option>
              <option>Traité</option>
            </select>
          </Field>
          <Field label="Date de clôture" hint="(si traité)">
            <input
              type="date"
              value={form.treatedAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, treatedAt: e.target.value }))
              }
              style={inputStyle}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Notes">
              <textarea
                rows={2}
                placeholder="Détails complémentaires sur la demande…"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Field>
          </div>
        </div>

        {/* Exchange history */}
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
          <div
            className="text-xs font-bold uppercase mb-2.5"
            style={{ color: C.navy800, letterSpacing: "0.05em" }}>
            Historique des échanges
          </div>
          {exchanges.length === 0 ? (
            <div className="text-xs italic mb-2.5" style={{ color: C.inkSoft }}>
              Aucun échange enregistré pour ce dossier.
            </div>
          ) : (
            <div
              className="flex flex-col gap-2 mb-2.5"
              style={{ maxHeight: 150, overflowY: "auto" }}>
              {exchanges
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((ex) => (
                  <div
                    key={ex.id}
                    className="relative rounded-md px-2.5 py-2 text-xs"
                    style={{
                      background: C.paper,
                      border: `1px solid ${C.line}`,
                    }}>
                    <button
                      type="button"
                      onClick={() => removeExchange(ex.id)}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: C.inkSoft,
                      }}>
                      <X size={12} />
                    </button>
                    <div
                      className="text-[10.5px] font-bold uppercase mb-0.5"
                      style={{ color: C.inkSoft }}>
                      {ex.type} ·{" "}
                      {new Date(ex.date).toLocaleDateString("fr-FR")}
                    </div>
                    <div>{ex.note}</div>
                  </div>
                ))}
            </div>
          )}
          <div
            className="grid gap-2 items-end"
            style={{ gridTemplateColumns: "1fr 1fr 2fr auto" }}>
            <Field label="Date">
              <input
                type="date"
                value={exDraft.date}
                onChange={(e) =>
                  setExDraft((d) => ({ ...d, date: e.target.value }))
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Type">
              <select
                value={exDraft.type}
                onChange={(e) =>
                  setExDraft((d) => ({ ...d, type: e.target.value }))
                }
                style={inputStyle}>
                <option>Email</option>
                <option>Appel</option>
                <option>WhatsApp</option>
                <option>Réunion</option>
                <option>Autre</option>
              </select>
            </Field>
            <Field label="Note">
              <input
                placeholder="Résumé de l'échange"
                value={exDraft.note}
                onChange={(e) =>
                  setExDraft((d) => ({ ...d, note: e.target.value }))
                }
                style={inputStyle}
              />
            </Field>
            <button
              type="button"
              onClick={addExchange}
              className="px-3 py-2 rounded-md text-xs font-semibold"
              style={{
                background: "transparent",
                border: `1px solid ${C.line}`,
                color: C.navy900,
                cursor: "pointer",
              }}>
              Ajouter
            </button>
          </div>
        </div>

        {saveError && (
          <div className="text-sm mt-4" role="alert" style={{ color: C.red }}>
            {saveError}
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-6">
          {editingId && (
            <button
              type="button"
              onClick={handleDelete}
              className="mr-auto px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5"
              style={{
                background: "transparent",
                border: `1px solid ${C.line}`,
                color: C.red,
                cursor: "pointer",
              }}>
              <Trash2 size={14} /> Supprimer
            </button>
          )}
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: "transparent",
              border: `1px solid ${C.line}`,
              color: C.navy900,
              cursor: "pointer",
            }}>
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: C.navy900,
              color: C.gold400,
              border: "none",
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
            }}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function SettingsModal({
  settingsOpen,
  setSettingsOpen,
  defaultDelayDraft,
  setDefaultDelayDraft,
  saveSettings,
}) {
  console.log("[WIDGETS] Rendering SettingsModal");

  if (!settingsOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center overflow-y-auto p-6 z-50"
      style={{ background: "rgba(10,24,48,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && setSettingsOpen(false)}>
      <div
        className="w-full rounded-xl p-7"
        style={{
          maxWidth: 420,
          background: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}>
        <h2
          className="text-xl font-bold m-0 mb-1"
          style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
          Délai statutaire par défaut
        </h2>
        <p className="text-xs mb-5" style={{ color: C.inkSoft }}>
          Appliqué automatiquement aux nouvelles demandes (modifiable au cas par
          cas).
        </p>
        <Field label="Nombre de jours">
          <input
            type="number"
            min="1"
            value={defaultDelayDraft}
            onChange={(e) => setDefaultDelayDraft(e.target.value)}
            style={inputStyle}
          />
        </Field>
        <div className="flex justify-end gap-2.5 mt-6">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: "transparent",
              border: `1px solid ${C.line}`,
              color: C.navy900,
              cursor: "pointer",
            }}>
            Annuler
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: C.navy900,
              color: C.gold400,
              border: "none",
              cursor: "pointer",
            }}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailModal({
  detailRecord,
  closeDetail,
  formatDisplayDate,
  computeDeadline,
  downloadAttachment: downloadAtt,
  refFor,
  formatBytes,
}) {
  console.log("[WIDGETS] Rendering DetailModal for contact:", detailRecord?.id);

  if (!detailRecord) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(10,24,48,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && closeDetail()}>
      <div
        className="ml-auto w-full max-w-xl h-full overflow-y-auto bg-white p-6 shadow-2xl"
        style={{ minHeight: "100%" }}>
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div
              className="text-[10px] font-bold uppercase"
              style={{ color: C.gold500, letterSpacing: "0.18em" }}>
              {refFor(detailRecord)}
            </div>
            <h2
              className="text-2xl font-bold mt-2"
              style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
              Détails du dossier
            </h2>
            <div className="text-xs mt-2" style={{ color: C.inkSoft }}>
              Consultation des informations enregistrées et des pièces jointes.
            </div>
          </div>
          <button
            type="button"
            onClick={closeDetail}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.inkSoft,
              padding: 8,
            }}>
            <X size={18} />
          </button>
        </div>

        <div
          className="grid gap-4 mb-6"
          style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div
            style={{
              background: C.paper,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: 16,
            }}>
            <div
              className="text-xs font-bold uppercase mb-2"
              style={{ color: C.inkSoft }}>
              Contact
            </div>
            <div className="text-sm font-semibold" style={{ color: C.navy900 }}>
              {detailRecord.name || "—"}
            </div>
            <div className="text-xs" style={{ color: C.inkSoft }}>
              {detailRecord.org || "—"}
            </div>
            <div className="text-xs mt-2" style={{ color: C.inkSoft }}>
              {detailRecord.email || "—"}
            </div>
            <div className="text-xs" style={{ color: C.inkSoft }}>
              {detailRecord.phone || "—"}
            </div>
          </div>
          <div
            style={{
              background: C.paper,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: 16,
            }}>
            <div
              className="text-xs font-bold uppercase mb-2"
              style={{ color: C.inkSoft }}>
              Statut
            </div>
            <StatusBadge status={detailRecord.status} />
            <div className="text-xs mt-3" style={{ color: C.inkSoft }}>
              <strong>Sujet :</strong> {detailRecord.subject || "—"}
            </div>
            <div className="text-xs mt-2" style={{ color: C.inkSoft }}>
              <strong>Type :</strong> {detailRecord.clientType}
            </div>
            <div className="text-xs mt-2" style={{ color: C.inkSoft }}>
              <strong>Référence :</strong> {detailRecord.attachment || "—"}
            </div>
          </div>
        </div>

        <div
          className="grid gap-4 mb-6"
          style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div
            style={{
              background: C.paper,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: 16,
            }}>
            <div
              className="text-xs font-bold uppercase mb-2"
              style={{ color: C.inkSoft }}>
              Dates
            </div>
            <div className="text-xs" style={{ color: C.inkSoft }}>
              <strong>Reçu le :</strong>{" "}
              {formatDisplayDate(detailRecord.receivedAt).date}{" "}
              {formatDisplayDate(detailRecord.receivedAt).time}
            </div>
            <div className="text-xs" style={{ color: C.inkSoft }}>
              <strong>Traitement avant :</strong>{" "}
              {computeDeadline(detailRecord).toLocaleDateString("fr-FR")}
            </div>
            <div className="text-xs" style={{ color: C.inkSoft }}>
              <strong>Clôture :</strong>{" "}
              {detailRecord.treatedAt
                ? formatDisplayDate(detailRecord.treatedAt).date
                : "—"}
            </div>
          </div>
          <div
            style={{
              background: C.paper,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: 16,
            }}>
            <div
              className="text-xs font-bold uppercase mb-2"
              style={{ color: C.inkSoft }}>
              Détails supplémentaires
            </div>
            <div className="text-xs" style={{ color: C.inkSoft }}>
              <strong>Délai :</strong> {detailRecord.delayDays} jours
            </div>
            <div className="text-xs mt-2" style={{ color: C.inkSoft }}>
              <strong>Notes :</strong>
            </div>
            <div
              className="text-sm"
              style={{ color: C.inkSoft, whiteSpace: "pre-wrap" }}>
              {detailRecord.notes || "Aucune note."}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div
            className="text-xs font-bold uppercase mb-3"
            style={{ color: C.navy800, letterSpacing: "0.05em" }}>
            Pièces jointes
          </div>
          {detailRecord.attachments?.length ? (
            <div className="space-y-2">
              {detailRecord.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-md px-3 py-2"
                  style={{
                    background: C.paper,
                    border: `1px solid ${C.line}`,
                  }}>
                  <div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: C.navy900 }}>
                      {att.filename}
                    </div>
                    <div className="text-[11px]" style={{ color: C.inkSoft }}>
                      {formatBytes(att.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      downloadAtt(att.id, detailRecord.attachments)
                    }
                    className="px-3 py-2 rounded-md text-xs font-semibold"
                    style={{
                      background: "transparent",
                      border: `1px solid ${C.line}`,
                      color: C.navy900,
                      cursor: "pointer",
                    }}>
                    Télécharger
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs" style={{ color: C.inkSoft }}>
              Aucune pièce jointe enregistrée.
            </div>
          )}
        </div>

        <div>
          <div
            className="text-xs font-bold uppercase mb-3"
            style={{ color: C.navy800, letterSpacing: "0.05em" }}>
            Historique des échanges
          </div>
          {detailRecord.exchanges?.length ? (
            <div className="space-y-3">
              {detailRecord.exchanges
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((ex) => (
                  <div
                    key={ex.id}
                    className="rounded-md px-3 py-2"
                    style={{
                      background: C.paper,
                      border: `1px solid ${C.line}`,
                    }}>
                    <div
                      className="text-[10.5px] font-bold uppercase"
                      style={{ color: C.inkSoft }}>
                      {ex.type} ·{" "}
                      {new Date(ex.date).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="text-sm mt-1" style={{ color: C.inkSoft }}>
                      {ex.note}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-xs" style={{ color: C.inkSoft }}>
              Aucun échange enregistré.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

console.log("[WIDGETS] All widgets loaded successfully");

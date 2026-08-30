// ================================================================
// WAFI CAPITAL CRM - Registre (Registry) Page
// Main contact/request registry view with search and filters
// ================================================================

import React from "react";
import { Search, Plus, Pencil, Eye, Settings2 } from "lucide-react";
import { C } from "../utils/constants";
import { StatusBadge, inputStyle, Dot } from "../components/widgets";
import {
  formatDisplayDate,
  complianceColor,
  computeDeadline,
} from "../utils/helpers";

console.log("[REGISTRE_PAGE] Initializing Registre Page component...");

export function RegistrePage({
  filtered,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  contacts,
  totalCount,
  openSettings,
  openNew,
  openDetail,
  openEdit,
  refFor,
}) {
  console.log(
    "[REGISTRE_PAGE] Rendering Registre Page - Filtered count:",
    filtered.length,
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1" style={{ minWidth: 220 }}>
          <Search
            size={15}
            className="absolute"
            style={{
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.inkSoft,
            }}
          />
          <input
            value={search}
            onChange={(e) => {
              console.log(
                "[REGISTRE_PAGE] Search input changed:",
                e.target.value,
              );
              setSearch(e.target.value);
            }}
            placeholder="Rechercher un client, un sujet, une société…"
            style={{ ...inputStyle, paddingLeft: 34 }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            console.log("[REGISTRE_PAGE] Type filter changed:", e.target.value);
            setTypeFilter(e.target.value);
          }}
          style={{ ...inputStyle, width: "auto" }}>
          <option value="all">Tous les types</option>
          <option value="Société">Société</option>
          <option value="Personne physique">Personne physique</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            console.log(
              "[REGISTRE_PAGE] Status filter changed:",
              e.target.value,
            );
            setStatusFilter(e.target.value);
          }}
          style={{ ...inputStyle, width: "auto" }}>
          <option value="all">Tous les statuts</option>
          <option value="Nouveau">Nouveau</option>
          <option value="En cours">En cours</option>
          <option value="Traité">Traité</option>
        </select>
        <button
          onClick={openSettings}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{
            background: "transparent",
            color: C.navy900,
            border: `1px solid ${C.line}`,
            cursor: "pointer",
          }}>
          <Settings2 size={14} /> Délai statutaire par défaut
        </button>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{
            background: C.navy900,
            color: C.gold400,
            border: "none",
            cursor: "pointer",
          }}>
          <Plus size={15} /> Nouvelle demande
        </button>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#fff", border: `1px solid ${C.line}` }}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ background: C.paper2 }}>
              {[
                "Réf.",
                "Client",
                "Coordonnées",
                "Sujet",
                "Reçu le",
                "Statut",
                "Délai",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10.5px] font-semibold uppercase"
                  style={{
                    color: C.inkSoft,
                    letterSpacing: "0.08em",
                    borderBottom: `1px solid ${C.line}`,
                  }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const { date, time } = formatDisplayDate(c.receivedAt);
              const deadline = computeDeadline(c);
              const color = complianceColor(c);
              console.log(
                "[REGISTRE_PAGE] Rendering row for contact:', c.id, 'status:', c.status",
              );
              return (
                <tr
                  key={c.id}
                  className="hover:bg-[#fbfaf6]"
                  style={{ borderBottom: `1px solid #ece8dc` }}>
                  <td className="px-4 py-3.5 align-top">
                    <span
                      className="font-bold text-xs"
                      style={{
                        fontFamily: "Georgia, serif",
                        color: C.navy700,
                      }}>
                      {refFor(c)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="font-semibold">{c.name || "—"}</div>
                    {c.org && (
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: C.inkSoft }}>
                        {c.org}
                      </div>
                    )}
                    <div
                      className="text-[10px] font-bold uppercase mt-0.5"
                      style={{ color: C.navy700, letterSpacing: "0.04em" }}>
                      {c.clientType}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3.5 align-top text-xs"
                    style={{ color: C.inkSoft }}>
                    {c.email && <div>{c.email}</div>}
                    {c.phone && <div>{c.phone}</div>}
                    {!c.email && !c.phone && <div>—</div>}
                  </td>
                  <td
                    className="px-4 py-3.5 align-top"
                    style={{ maxWidth: 230 }}>
                    {c.subject || "—"}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="font-semibold">{date}</div>
                    <div className="text-xs" style={{ color: C.inkSoft }}>
                      {time}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-center text-xs">
                      <Dot color={color} />
                      {deadline.toLocaleDateString("fr-FR")}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          console.log(
                            "[REGISTRE_PAGE] Opening detail for contact:', c.id",
                          );
                          openDetail(c);
                        }}
                        title="Voir les détails"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: C.inkSoft,
                          padding: 4,
                        }}>
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => {
                          console.log(
                            "[REGISTRE_PAGE] Opening edit for contact:', c.id)",
                          );
                          openEdit(c);
                        }}
                        title="Modifier"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: C.inkSoft,
                          padding: 4,
                        }}>
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
            <div
              className="text-lg mb-1.5"
              style={{ fontFamily: "Georgia, serif", color: C.navy800 }}>
              {contacts.length === 0
                ? "Aucune demande enregistrée"
                : "Aucun résultat pour ces filtres"}
            </div>
            <div>
              {contacts.length === 0 &&
                "Cliquez sur « + Nouvelle demande » pour commencer le registre."}
            </div>
          </div>
        )}
      </div>
      <p className="text-center text-xs mt-4" style={{ color: C.inkSoft }}>
        Pièces jointes : documents PDF (3,5 Mo max chacun), ou notez une
        référence si le fichier est conservé ailleurs.
      </p>
    </>
  );
}

console.log("[REGISTRE_PAGE] Registre Page component loaded successfully");

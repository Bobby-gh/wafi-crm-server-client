// ================================================================
// WAFI CAPITAL CRM - Dashboard Page
// Compliance dashboard with statistics and status visualization
// ================================================================

import React from "react";
import { C, STATUS } from "../utils/constants";
import { StatusBadge, Dot } from "../components/widgets";
import { formatDisplayDate, complianceColor, computeDeadline } from "../utils/helpers";

export function DashboardPage({
  dashboardSorted,
  green,
  yellow,
  red,
  refFor,
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        {[
          {
            label: "Traités dans les délais",
            sub: "Dossiers clôturés avant l'échéance statutaire",
            n: green.length,
            color: C.green,
          },
          {
            label: "En cours, dans les délais",
            sub: "Dossiers ouverts, échéance non dépassée",
            n: yellow.length,
            color: "#c99a1a",
          },
          {
            label: "Hors délai",
            sub: "Échéance dépassée, traités en retard ou toujours ouverts",
            n: red.length,
            color: "#c1484d",
          },
        ].map((k) => (
          <div key={k.label} className="relative overflow-hidden rounded-xl px-5 py-4.5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: k.color }} />
            <div className="text-3xl" style={{ fontFamily: "Georgia, serif", color: C.navy950 }}>
              {k.n}
            </div>
            <div className="text-xs mt-1.5" style={{ color: C.inkSoft }}>
              {k.label}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: C.inkSoft }}>
              {k.sub}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ background: C.paper2 }}>
              {["", "Réf.", "Client", "Sujet", "Reçu le", "Échéance", "Statut"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold uppercase" style={{ color: C.inkSoft, letterSpacing: "0.08em", borderBottom: `1px solid ${C.line}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dashboardSorted.map(({ a, color, deadline }) => {
              const { date } = formatDisplayDate(a.receivedAt);
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #ece8dc" }}>
                  <td className="px-4 py-3.5">
                    <Dot color={color} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-xs" style={{ fontFamily: "Georgia, serif", color: C.navy700 }}>
                      {refFor(a)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold">{a.contactName || "—"}</div>
                    {a.companyName && (
                      <div className="text-xs" style={{ color: C.inkSoft }}>
                        {a.companyName}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5" style={{ maxWidth: 230 }}>
                    {a.subject || "—"}
                  </td>
                  <td className="px-4 py-3.5">{date}</td>
                  <td className="px-4 py-3.5">{deadline.toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {dashboardSorted.length === 0 && (
          <div className="text-center py-16" style={{ color: C.inkSoft }}>
            <div className="text-lg" style={{ fontFamily: "Georgia, serif", color: C.navy800 }}>
              Aucun dossier à afficher
            </div>
          </div>
        )}
      </div>
    </>
  );
}

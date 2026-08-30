// ================================================================
// WAFI CAPITAL CRM - Dashboard Page
// Compliance dashboard with statistics and status visualization
// ================================================================

import React from "react";
import { C } from "../utils/constants";
import { StatusBadge, Dot } from "../components/widgets";
import { formatDisplayDate, complianceColor, computeDeadline } from "../utils/helpers";

console.log("[DASHBOARD_PAGE] Initializing Dashboard Page component...");

export function DashboardPage({
  dashboardSorted,
  green,
  yellow,
  red,
  refFor,
}) {
  console.log("[DASHBOARD_PAGE] Rendering Dashboard Page");
  console.log("[DASHBOARD_PAGE] Green (on time):', green.length);
  console.log("[DASHBOARD_PAGE] Yellow (approaching):', yellow.length);
  console.log("[DASHBOARD_PAGE] Red (overdue):', red.length);

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
        ].map((k) => {
          console.log("[DASHBOARD_PAGE] Rendering stat card:', k.label, 'count:', k.n);
          return (
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
          );
        })}
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
            {dashboardSorted.map(({ c, color, deadline }) => {
              const { date } = formatDisplayDate(c.receivedAt);
              console.log("[DASHBOARD_PAGE] Rendering dashboard row for contact:', c.id, 'color:', color);
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #ece8dc" }}>
                  <td className="px-4 py-3.5">
                    <Dot color={color} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-xs" style={{ fontFamily: "Georgia, serif", color: C.navy700 }}>
                      {refFor(c)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold">{c.name || "—"}</div>
                    {c.org && (
                      <div className="text-xs" style={{ color: C.inkSoft }}>
                        {c.org}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5" style={{ maxWidth: 230 }}>
                    {c.subject || "—"}
                  </td>
                  <td className="px-4 py-3.5">{date}</td>
                  <td className="px-4 py-3.5">{deadline.toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={c.status} />
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

console.log("[DASHBOARD_PAGE] Dashboard Page component loaded successfully");

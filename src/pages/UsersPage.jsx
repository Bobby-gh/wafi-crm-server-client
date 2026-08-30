// ================================================================
// WAFI CAPITAL CRM - Users Management Page
// Admin interface for managing organization users and permissions
// ================================================================

import React from "react";
import { Users, KeyRound } from "lucide-react";
import { C } from "../utils/constants";
import { Field, inputStyle } from "../components/widgets";
import { userDisplayName, roleLabel, isAdminUser } from "../utils/helpers";

console.log("[USERS_PAGE] Initializing Users Management Page component...");

export function UsersPage({
  userForm,
  setUserForm,
  handleCreateUser,
  userCreateLoading,
  usersError,
  setUsersError,
  temporaryPassword,
  setTemporaryPassword,
  usersLoading,
  orgUsers,
  loadUsers,
}) {
  console.log("[USERS_PAGE] Rendering Users Management Page");
  console.log("[USERS_PAGE] Total users:', orgUsers.length");

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-1 rounded-xl p-5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: C.navy900 }}>
            <Users size={15} /> Nouvel utilisateur
          </div>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <Field label="Nom d'utilisateur">
              <input
                required
                value={userForm.username}
                onChange={(e) => {
                  console.log("[USERS_PAGE] Username field changed");
                  setUserForm((f) => ({ ...f, username: e.target.value }));
                }}
                style={inputStyle}
                autoComplete="off"
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={userForm.email}
                onChange={(e) => {
                  console.log("[USERS_PAGE] Email field changed");
                  setUserForm((f) => ({ ...f, email: e.target.value }));
                }}
                style={inputStyle}
                autoComplete="email"
              />
            </Field>
            <Field label="Nom complet">
              <input
                value={userForm.fullName}
                onChange={(e) => {
                  console.log("[USERS_PAGE] Full name field changed");
                  setUserForm((f) => ({ ...f, fullName: e.target.value }));
                }}
                style={inputStyle}
                autoComplete="name"
              />
            </Field>
            <div className="text-xs" style={{ color: C.inkSoft }}>
              Le mot de passe temporaire sera affiché après création et devra être changé à la première connexion.
            </div>
            {usersError && <div className="text-sm" style={{ color: C.red }}>{usersError}</div>}
            <button
              type="submit"
              disabled={userCreateLoading}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{
                background: C.navy900,
                color: C.gold400,
                border: "none",
                cursor: "pointer",
                opacity: userCreateLoading ? 0.7 : 1,
              }}
            >
              {userCreateLoading ? "Création…" : "Créer l'utilisateur"}
            </button>
          </form>

          {temporaryPassword && (
            <div className="mt-4 rounded-lg p-4" style={{ background: C.yellowBg, border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: C.yellow }}>
                <KeyRound size={15} /> Mot de passe temporaire
              </div>
              <div className="text-xs mt-2" style={{ color: C.inkSoft }}>
                À transmettre manuellement à {temporaryPassword.username}. Ce mot de passe ne doit être partagé qu'une seule fois.
              </div>
              <div className="mt-3 rounded-md px-3 py-2 text-sm font-mono" style={{ background: "#fff", border: `1px dashed ${C.line}`, color: C.navy900 }}>
                {temporaryPassword.password}
              </div>
              <button
                type="button"
                onClick={() => {
                  console.log("[USERS_PAGE] Clearing temporary password");
                  setTemporaryPassword(null);
                }}
                className="mt-2 w-full text-xs"
                style={{ background: "transparent", border: "none", color: C.navy800, cursor: "pointer", fontWeight: 500 }}
              >
                Fermer
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.line }}>
            <div>
              <div className="text-sm font-bold" style={{ color: C.navy900 }}>
                Utilisateurs de l'organisation
              </div>
              <div className="text-xs" style={{ color: C.inkSoft }}>
                Liste limitée à votre organisation courante.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log("[USERS_PAGE] Refreshing users list");
                loadUsers();
              }}
              className="px-3 py-2 rounded-md text-xs font-semibold"
              style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.navy900, cursor: "pointer" }}
            >
              Actualiser
            </button>
          </div>
          {usersLoading ? (
            <div className="p-6 text-sm" style={{ color: C.inkSoft }}>
              Chargement des utilisateurs…
            </div>
          ) : orgUsers.length === 0 ? (
            <div className="p-6 text-sm" style={{ color: C.inkSoft }}>
              Aucun utilisateur trouvé pour cette organisation.
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ background: C.paper2 }}>
                  {["Utilisateur", "Rôle", "Email", "Métadonnées"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold uppercase" style={{ color: C.inkSoft, letterSpacing: "0.08em", borderBottom: `1px solid ${C.line}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgUsers.map((user) => {
                  console.log("[USERS_PAGE] Rendering user row:', user.username || user.email");
                  return (
                    <tr key={user.id || user.userId || user.username || user.email} style={{ borderBottom: "1px solid #ece8dc" }}>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold" style={{ color: C.navy900 }}>
                          {userDisplayName(user)}
                        </div>
                        <div className="text-xs" style={{ color: C.inkSoft }}>
                          {user.username || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full"
                          style={{
                            background: isAdminUser(user) ? C.greenBg : C.paper2,
                            color: isAdminUser(user) ? C.green : C.inkSoft,
                          }}
                        >
                          {roleLabel(user)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: C.inkSoft }}>
                        {user.email || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: C.inkSoft }}>
                        <div>{user.scope ? `Scope: ${user.scope}` : "—"}</div>
                        {user.records !== undefined && <div>{`Records: ${Array.isArray(user.records) ? user.records.length : user.records}`}</div>}
                        {user.userId && <div>{`userId: ${user.userId}`}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {usersError && (
            <div className="px-4 py-3 text-sm" style={{ color: C.red }}>
              {usersError}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

console.log("[USERS_PAGE] Users Management Page component loaded successfully");

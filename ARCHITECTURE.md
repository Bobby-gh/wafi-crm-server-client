# WAFI CRM - Complete Architecture Guide

## Project Structure

```
crm-client/
├── src/
│   ├── App.jsx                           ⭐ Main application component
│   ├── api.js                            API client configuration
│   ├── main.jsx                          React entry point
│   ├── index.css                         Global styles
│   │
│   ├── utils/                            🔧 Utilities & Helpers
│   │   ├── constants.js                  Colors, keys, config
│   │   └── helpers.js                    Date, format, data functions
│   │
│   ├── components/                       🎨 Reusable Components
│   │   └── widgets.jsx                   Modals, atoms, UI components
│   │
│   └── pages/                            📄 Page Components
│       ├── AuthPage.jsx                  Login, Signup, Password Change
│       ├── RegistrePage.jsx              Registry table with filters
│       ├── DashboardPage.jsx             Compliance dashboard
│       └── UsersPage.jsx                 User management
│
├── public/
│   └── login.html                        Login page (copied to dist)
│
├── REFACTOR_SUMMARY.md                   📋 Refactoring overview
├── CONSOLE_LOGS_GUIDE.md                 🐛 Debugging guide
└── ARCHITECTURE.md                       📐 This file

```

## Module Dependencies

```
                          ┌─────────────────┐
                          │    App.jsx      │
                          │  (Main App)     │
                          └────────┬────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
        ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
        │   Pages/     │    │ Components/ │    │    Utils/    │
        │   *.jsx      │    │  widgets    │    │  *.js        │
        └──────────────┘    └─────────────┘    └──────────────┘
                │                  │                  │
    ┌───────────┼───────────┐      │          ┌──────┴──────┐
    │           │           │      │          │             │
    ▼           ▼           ▼      ▼          ▼             ▼
  Auth      Registre    Dashboard  Users  constants.js  helpers.js
  Page      Page        Page       Page
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Auth Pages  │  │  Registre    │  │ Dashboard &  │       │
│  │              │  │ + Users Page │  │ Settings     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   App.jsx       │
                    │  (State Mgmt)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐         ┌──────────┐        ┌──────────┐
    │ Storage│         │ Helpers  │        │Constants │
    │ (API)  │         │ (Utils)  │        │          │
    └────┬───┘         └──────────┘        └──────────┘
         │
         ▼
    Backend API
    (Express/SQLite)
```

## State Management

### Main App State

```javascript
// Authentication
const [authMode, setAuthMode] = useState("setup"); // "setup" | "login"
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [mustChangePassword, setMustChangePassword] = useState(false);

// Data
const [contacts, setContacts] = useState([]);
const [settings, setSettings] = useState({ defaultDelayDays: 30 });

// UI Navigation
const [appView, setAppView] = useState("registre"); // "registre" | "dashboard" | "users"
const [tab, setTab] = useState("registre");

// Modal States
const [modalOpen, setModalOpen] = useState(false);
const [detailRecord, setDetailRecord] = useState(null);
const [settingsOpen, setSettingsOpen] = useState(false);

// Form States
const [form, setForm] = useState(EMPTY_FORM);
const [exchanges, setExchanges] = useState([]);
const [attachments, setAttachments] = useState([]);

// User Management
const [orgUsers, setOrgUsers] = useState([]);
const [canManageUsers, setCanManageUsers] = useState(false);
```

## Component Props Pattern

### Page Components

All page components receive:

- **Data props**: contacts, filtered, dashboardSorted, orgUsers, etc.
- **Handler props**: openDetail, openEdit, handleCreate, etc.
- **State setter props**: setSearch, setTypeFilter, etc.
- **Utility props**: refFor, formatBytes, complianceColor, etc.

Example:

```javascript
<RegistrePage
  filtered={filtered}
  contacts={contacts}
  search={search}
  setSearch={setSearch}
  // ... more props
/>
```

### Widget Components

All widgets are controlled components:

- **State props**: modalOpen, settingsOpen, detailRecord
- **Data props**: form, exchanges, contacts, etc.
- **Handler props**: closeModal, handleSubmit, handleDelete, etc.
- **Setter props**: setForm, setExchanges, etc.

Example:

```javascript
<RequestModal
  modalOpen={modalOpen}
  closeModal={closeModal}
  form={form}
  setForm={setForm}
  // ... more props
/>
```

## Console Logging System

Every module logs its operations with a module prefix:

```
[MODULE_NAME] Action: details
```

### Modules:

- `[APP]` - Main application
- `[STORAGE]` - API/Storage operations
- `[CONSTANTS]` - Constants initialization
- `[HELPERS]` - Helper function calls
- `[WIDGETS]` - Component rendering
- `[AUTH_PAGE]` - Authentication pages
- `[REGISTRE_PAGE]` - Registry page
- `[DASHBOARD_PAGE]` - Dashboard page
- `[USERS_PAGE]` - Users management

### Benefits:

✅ Easy filtering in DevTools
✅ Trace execution flow
✅ Debug data transformations
✅ Monitor API calls
✅ Understand component lifecycle

## Key Functions by Module

### constants.js

- Color palette (C object)
- Storage configuration
- Form templates

### helpers.js

```javascript
// Date Utilities
toLocalInputValue();
toDateInputValue();
formatDisplayDate();

// Formatting
formatBytes();

// ID Generation
newId();

// Contact Utilities
refFor();
complianceColor();
computeDeadline();

// User Utilities
normalizeOrganizationName();
normalizeUserList();
isAdminUser();
userDisplayName();
roleLabel();
```

### widgets.jsx

```javascript
// UI Atoms
<Dot />
<StatusBadge />
<Field />

// Modals
<RequestModal />
<SettingsModal />
<DetailModal />
```

### pages/AuthPage.jsx

```javascript
<AuthPage />
<ChangePasswordPage />
```

### pages/RegistrePage.jsx

```javascript
<RegistrePage />
```

### pages/DashboardPage.jsx

```javascript
<DashboardPage />
```

### pages/UsersPage.jsx

```javascript
<UsersPage />
```

## Data Models

### Contact

```javascript
{
  id: "c_12345",
  seq: 1,
  clientType: "Société" | "Personne physique",
  org: "Company Name",
  name: "John Doe",
  email: "john@example.com",
  phone: "+33 1 23 45 67 89",
  attachment: "reference.pdf",
  subject: "Request subject",
  receivedAt: "2026-08-30T10:30:00Z",
  delayDays: 30,
  status: "Nouveau" | "En cours" | "Traité",
  treatedAt: "2026-09-15T14:00:00Z" | null,
  notes: "Additional notes",
  attachments: [
    { id: "att_123", filename: "doc.pdf", size: 2048, uploadedAt: "..." }
  ],
  exchanges: [
    { id: "ex_456", date: "...", type: "Email", note: "Exchange notes" }
  ]
}
```

### User

```javascript
{
  id: "u_789",
  username: "john_doe",
  email: "john@example.com",
  fullName: "John Doe",
  role: "admin" | "user",
  isAdmin: true | false,
  organizationName: "Company Name",
  mustChangePassword: false
}
```

### Settings

```javascript
{
  defaultDelayDays: 30;
}
```

## API Endpoints Used

- `POST /api/signup` - Create organization
- `POST /api/login` - User login
- `GET /api/me` - Get current user
- `POST /api/logout` - User logout
- `POST /api/auth/change-password` - Change password
- `GET /api/storage/:key` - Retrieve stored data
- `PUT /api/storage/:key` - Save data
- `DELETE /api/storage/:key` - Delete data
- `GET /api/storage` - List stored data
- `GET /api/storage/keys` - List all keys
- `GET /api/users` - Get organization users
- `POST /api/users` - Create new user

## Environment Variables

Required in `.env`:

```
VITE_API_URL=http://localhost:3000
```

## Build & Deployment

### Development

```bash
npm install
npm run dev
```

### Production

```bash
npm run build
npm run preview
```

## Error Handling Pattern

```javascript
try {
  // Operation
  console.log("[MODULE] Attempting operation");
  const result = await operation();
  console.log("[MODULE] Success:", result);
  setState(result);
} catch (e) {
  if (e.response?.status === 401) {
    console.warn("[MODULE] Unauthorized - resetting session");
    resetSession();
  } else if (e.response?.status === 403) {
    console.warn("[MODULE] Forbidden - access denied");
    setError("Access denied");
  } else {
    console.error("[MODULE] Error:", e);
    setError("Operation failed");
  }
}
```

## Performance Considerations

1. **State Updates**: Grouped related updates where possible
2. **Component Rendering**: Pages receive only needed props
3. **Storage Operations**: Batch where possible
4. **Helper Functions**: Pure functions for reusability
5. **Console Logging**: Minimal impact, can be disabled in production

## Testing Strategy

Each module can be tested independently:

1. **Utils**: Test helper functions with various inputs
2. **Widgets**: Test components in isolation with different props
3. **Pages**: Test with mock data and handlers
4. **App**: Integration tests with real API

## Future Enhancements

1. Extract UI atoms to separate component library
2. Add TypeScript for type safety
3. Implement React Router for better navigation
4. Add state management library (Redux/Zustand)
5. Create custom hooks for repeated logic
6. Add unit tests
7. Implement error boundary components

---

**Architecture Version**: 1.0
**Last Updated**: 2026-08-30
**Maintainer**: Development Team

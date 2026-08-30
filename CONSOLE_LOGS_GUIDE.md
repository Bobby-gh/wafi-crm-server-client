# Console Log Reference Guide

## Overview

This guide explains all console logs in the WAFI CRM application to help with debugging and understanding the application flow.

## Log Categories

### 1. Application Initialization ([APP])

```javascript
[APP] Initializing WAFI CRM Application...
[APP] All modules imported successfully
[APP] Initializing WafiCRM main component
[APP] Starting user session
[APP] Resetting session
```

**When**: Application startup and authentication state changes
**Use for**: Tracking application lifecycle and session management

### 2. Constants ([CONSTANTS])

```javascript
[CONSTANTS] Initializing application constants...
[CONSTANTS] Brand colors loaded: 16 colors
[CONSTANTS] Storage key: wafi-crm-data
[CONSTANTS] Max file size: 3670016 bytes
```

**When**: Application initialization only
**Use for**: Verifying configuration and constants are loaded

### 3. Helper Functions ([HELPERS])

```javascript
[HELPERS] Converting date to local input value: 2026-08-30
[HELPERS] Formatting bytes: 2048
[HELPERS] Generated new ID: id_1725052800000_abc123def45
[HELPERS] Computing compliance color for contact: c_12345
[HELPERS] User admin status: true
[HELPERS] All helper functions loaded successfully
```

**When**: Every time a helper function is called
**Use for**: Debugging data transformations and calculations

### 4. Storage Operations ([STORAGE])

```javascript
[STORAGE] Getting key: wafi-crm-data
[STORAGE] Successfully retrieved key: wafi-crm-data
[STORAGE] Key not found: wafi-crm-file:att_123
[STORAGE] Setting key: wafi-crm-data with value length: 15234
[STORAGE] Successfully set key: wafi-crm-data
[STORAGE] Deleting key: wafi-crm-file:att_456
[STORAGE] Successfully deleted key: wafi-crm-file:att_456
[STORAGE] Listing keys with prefix: wafi-crm-file:
[STORAGE] Found 5 items
[STORAGE] Listing all keys
[STORAGE] Found 23 keys
```

**When**: API/storage operations
**Use for**: Debugging data persistence and API calls

### 5. Widgets ([WIDGETS])

```javascript
[WIDGETS] Initializing widgets and components...
[WIDGETS] Rendering Dot with color: green
[WIDGETS] Rendering StatusBadge with status: Nouveau
[WIDGETS] Rendering Field with label: Nom du contact
[WIDGETS] Rendering RequestModal - editingId: c_12345
[WIDGETS] Rendering SettingsModal
[WIDGETS] Rendering DetailModal for contact: c_12345
[WIDGETS] All widgets loaded successfully
```

**When**: Component initialization and rendering
**Use for**: Debugging UI component state

### 6. Auth Page ([AUTH_PAGE])

```javascript
[AUTH_PAGE] Initializing Auth Page component...
[AUTH_PAGE] Rendering Auth Page - Mode: setup
[AUTH_PAGE] Rendering Auth Page - Mode: login
[AUTH_PAGE] Rendering Change Password Page - Username: john_doe
[AUTH_PAGE] Auth Page components loaded successfully
```

**When**: Authentication page lifecycle
**Use for**: Debugging auth flow

### 7. Registry Page ([REGISTRE_PAGE])

```javascript
[REGISTRE_PAGE] Initializing Registre Page component...
[REGISTRE_PAGE] Rendering Registre Page - Filtered count: 12
[REGISTRE_PAGE] Search input changed: client
[REGISTRE_PAGE] Type filter changed: Société
[REGISTRE_PAGE] Status filter changed: En cours
[REGISTRE_PAGE] Rendering row for contact: c_12345 status: Nouveau
[REGISTRE_PAGE] Opening detail for contact: c_12345
[REGISTRE_PAGE] Opening edit for contact: c_12345
[REGISTRE_PAGE] Registre Page component loaded successfully
```

**When**: Registry page operations
**Use for**: Debugging search/filter and table rendering

### 8. Dashboard Page ([DASHBOARD_PAGE])

```javascript
[DASHBOARD_PAGE] Initializing Dashboard Page component...
[DASHBOARD_PAGE] Rendering Dashboard Page
[DASHBOARD_PAGE] Green (on time): 5
[DASHBOARD_PAGE] Yellow (approaching): 3
[DASHBOARD_PAGE] Red (overdue): 2
[DASHBOARD_PAGE] Rendering stat card: Traités dans les délais count: 5
[DASHBOARD_PAGE] Rendering dashboard row for contact: c_12345 color: red
[DASHBOARD_PAGE] Dashboard Page component loaded successfully
```

**When**: Dashboard page rendering
**Use for**: Debugging compliance calculations

### 9. Users Page ([USERS_PAGE])

```javascript
[USERS_PAGE] Initializing Users Management Page component...
[USERS_PAGE] Rendering Users Management Page
[USERS_PAGE] Total users: 8
[USERS_PAGE] Username field changed
[USERS_PAGE] Email field changed
[USERS_PAGE] Full name field changed
[USERS_PAGE] Refreshing users list
[USERS_PAGE] Clearing temporary password
[USERS_PAGE] Rendering user row: john_doe
[USERS_PAGE] Users Management Page component loaded successfully
```

**When**: User management operations
**Use for**: Debugging user-related actions

## Debugging Tips

### 1. Filter Logs by Module

In Chrome DevTools, use the filter box to show only logs from a specific module:

```
[STORAGE]  // Shows only storage logs
[APP]      // Shows only app logs
[HELPERS]  // Shows only helper function logs
```

### 2. Check Application Flow

Follow the console logs in chronological order to understand the execution flow:

1. [APP] startup
2. [CONSTANTS] initialization
3. [HELPERS] initialization
4. [WIDGETS] initialization
5. [APP] component initialization

### 3. Debug Data Issues

Look for [STORAGE] logs to see what data is being saved/retrieved:

- "Key not found" means data isn't persisting
- "Successfully set key" confirms data was saved
- Value length helps identify data problems

### 4. Debug UI Issues

Look for [WIDGETS], [REGISTRE_PAGE], [DASHBOARD_PAGE], [USERS_PAGE] logs:

- Check which components are rendering
- Verify filter counts match expectations
- Trace through button click actions

### 5. Debug Authentication

Look for [AUTH_PAGE] logs:

- Check if auth mode is correct (setup vs login)
- Verify password change is triggered
- Trace authentication flow

## Common Issues and Solutions

| Issue                        | Log Pattern to Look For          | Solution                                       |
| ---------------------------- | -------------------------------- | ---------------------------------------------- |
| Data not persisting          | `[STORAGE] Key not found`        | Check API connection and storage configuration |
| Dates displaying incorrectly | `[HELPERS] Converting date...`   | Check timezone handling in helpers.js          |
| Compliance colors wrong      | `[DASHBOARD_PAGE] color: `       | Debug complianceColor() function               |
| Filters not working          | `[REGISTRE_PAGE] filter changed` | Check filter logic in RegistrePage             |
| Users not loading            | `[USERS_PAGE] Total users: 0`    | Check API permissions and user data            |
| Modal not showing            | `[WIDGETS] Rendering ***Modal`   | Verify modal state is true                     |

## Performance Monitoring

You can use console logs to monitor performance:

1. **Time between logs**: Gap indicates processing time
2. **Frequency of logs**: Excessive logs might indicate performance issues
3. **Storage operation counts**: Multiple saves might need optimization

## Log Format Standards

All logs follow this format:

```
[MODULE_NAME] Action/Description: value1, value2
[MODULE_NAME] Another action - details about what happened
```

Key elements:

- **[MODULE_NAME]**: Identifies which part of app is logging (8-12 chars, uppercase, in brackets)
- **Action**: Clear verb describing what's happening (e.g., "Loading", "Rendering", "Saving")
- **Details**: Relevant values, IDs, or status information

---

**Last Updated**: 2026-08-30
**Version**: 1.0

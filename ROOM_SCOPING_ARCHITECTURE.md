# Room-by-Room Scoping Tool Architecture

## Overview
The Room-by-Room Scoping Tool allows field technicians to quickly capture renovation scope while walking through a property. The system is designed for smooth performance and offline-first operation.

## Database Schema

### Tables Created
1. **rooms** - Preloaded catalog of room types (Kitchen, Bathroom, etc.)
2. **components** - Components/Areas per room (Cabinetry, Countertops, etc.)
3. **renovation_options** - Standard options per component (Repair, Replace, Upgrade, etc.)
4. **scope_items** - Actual scope items captured during walkthrough
5. **scope_item_photos** - Junction table linking scope items to photos

### Key Design Decisions
- **Offline-First**: All catalog data is stored locally in SQLite
- **Performance**: Indexed queries for fast lookups
- **Flexibility**: Editable complexity, permit status, and trades
- **Photo Support**: Links to existing media_files table

## Data Flow

### Initialization
1. JSON catalog files are loaded once and stored in database
2. Catalog initialization runs on first app launch
3. Data persists locally, no need to reload

### Scoping Workflow
1. **Select Room** → Load components for that room
2. **Select Component** → Load renovation options for that component
3. **Select Option** → Create scope item with defaults from catalog
4. **Edit Details** → Update quantity, notes, complexity, permit status
5. **Attach Photos** → Link media files to scope item

## Performance Optimizations

### 1. Database Level
- Indexed columns for frequent queries (room_name, component_area, property_id)
- Batch inserts for catalog initialization
- Efficient queries using Drizzle ORM

### 2. React Native Level
- **FlatList** with virtualization for long lists
- **React.memo** for list items to prevent unnecessary re-renders
- **useCallback** for event handlers
- **Lazy loading** - components/options loaded on-demand

### 3. State Management
- **ScopeContext** - Centralized state management
- **Local database** - No network calls during scoping
- **Optimistic updates** - UI updates immediately, sync later

## UI Component Architecture

### Core Components
1. **RoomList** - Virtualized list of rooms (FlatList)
2. **ComponentList** - Grid/list of components per room
3. **OptionSelector** - Quick selection of renovation options
4. **ScopeItemForm** - Form for editing scope item details
5. **ScopeItemCard** - Display of existing scope items
6. **ScopeSummary** - Grouped summary view by room

### Design Principles
- **Progressive Disclosure** - Show only what's needed at each step
- **Quick Actions** - Large tap targets, swipe gestures
- **Visual Feedback** - Clear selection states, loading indicators
- **Offline Indicators** - Show sync status when available

## Screen Structure

### Main Scoping Screen
```
┌─────────────────────────────┐
│ Room Selection (Left Panel) │
│                             │
│ [Kitchen] ← selected        │
│ [Bathroom]                  │
│ [Bedroom]                   │
│ ...                         │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│ Components (Top Section)    │
│                             │
│ [Cabinetry] [Countertops]   │
│ [Flooring]  [Lighting]      │
│ ...                         │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│ Options (Quick Select)      │
│                             │
│ [Repair] [Replace] [Upgrade]│
│ [Add]    [Remove]           │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│ Scope Item Form (Modal)     │
│                             │
│ Quantity: [___] Unit: [___] │
│ Notes: [____________]       │
│ Complexity: [Low/Med/High]  │
│ Permit: [Yes/No/Maybe]      │
│ Photos: [+ Add]             │
└─────────────────────────────┘
```

### Scope Summary Screen
```
┌─────────────────────────────┐
│ Scope Summary               │
│                             │
│ Kitchen (5 items)           │
│   - Cabinetry: Replace      │
│   - Countertops: Upgrade    │
│   ...                       │
│                             │
│ Bathroom (3 items)          │
│   - Shower: Replace         │
│   ...                       │
│                             │
│ [Export] [Sync]             │
└─────────────────────────────┘
```

## Features Implementation

### 1. Quick Skip
- Swipe left on component → Mark as skipped
- Skipped items appear grayed out
- Can un-skip later

### 2. Duplicate Room
- Long press on room → "Duplicate Room" option
- Creates copy with "Room #2" suffix
- All components copied, scope items separate

### 3. Validation
- Custom validation rules (e.g., egress for basement)
- Show warnings, don't block
- Store validation results in notes

### 4. Export Scope Summary
- Group by room
- Show totals (quantities, costs if available)
- Export to JSON/PDF format

### 5. Flagged Items
- Auto-flag items with permits or high complexity
- Separate view showing only flagged items
- Quick filter in summary

## Sync Strategy

### Scope Items Sync
- **Pull**: Get scope items from server (linked to property)
- **Push**: Send local scope items to server
- **Conflict Resolution**: Server wins (scope items are created on mobile, updated on web)

### Catalog Sync
- **One-time**: Catalog data synced on app update
- **Static**: Catalog rarely changes, no real-time sync needed

## Best Practices for Developers

### 1. Performance
- Always use FlatList for long lists
- Memoize expensive components
- Debounce search/filter inputs
- Lazy load images

### 2. State Management
- Use ScopeContext for shared state
- Keep local component state for UI-only data
- Optimistic updates for better UX

### 3. Error Handling
- Graceful degradation if catalog not loaded
- Show user-friendly error messages
- Log errors for debugging

### 4. Testing
- Test with large catalog (1000+ items)
- Test offline scenarios
- Test rapid room/component switching
- Test photo attachment

## Future Enhancements

1. **Search/Filter** - Quick search for rooms/components
2. **Favorites** - Mark frequently used rooms/components
3. **Templates** - Save common scope patterns
4. **Voice Notes** - Audio recording for notes
5. **Offline Mode Indicator** - Clear indication when offline
6. **Batch Operations** - Select multiple items for bulk edit


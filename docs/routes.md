# Routes Documentation

This document maps all application routes to their corresponding components.

## Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Lobbies` | Home page - displays available game lobbies and challenges |
| `/lobbies` | `Lobbies` | Game lobbies and challenges page |
| `/leaderboards` | `Leaderboards` | Player rankings and statistics |
| `/events` | `Events` | Tournaments and events calendar |
| `/flocktube` | `FlockTube` | Live streaming platform |
| `/rewards` | `Rewards` | Daily/weekly objectives and reward system |
| `/support` | `Support` | Help center and FAQ |
| `/rules` | `Rules` | Platform rules and guidelines |
| `/about` | `About` | About the platform |

## User Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/my-profile` | `MyProfile` | User profile with settings, history, and account management |
| `/my-tournaments` | `MyTournaments` | User's tournament history and active tournaments |
| `/my-stream` | `MyStream` | User's streaming dashboard |
| `/settings` | `Settings` | Redirects to `/my-profile` (legacy route) |

## Legacy Redirects

The following routes redirect to maintain backward compatibility:

| Legacy Route | Redirects To | Type |
|--------------|--------------|------|
| `/find-match` | `/my-profile?tab=matches` | Permanent (308) |
| `/find` | `/my-profile?tab=matches` | Permanent (308) |
| `/match/find` | `/my-profile?tab=matches` | Permanent (308) |
| `/history` | `/my-profile?tab=history` | Permanent (308) |
| `/match-history` | `/my-profile?tab=history` | Permanent (308) |
| `/history/matches` | `/my-profile?tab=history` | Permanent (308) |

## Error Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `*` (catch-all) | `NotFound` | 404 page for unmatched routes |

## Route Parameters and Query Strings

### MyProfile Tabs
The `/my-profile` route supports tab-based navigation via query parameters:
- `?tab=profile` - Profile information (default)
- `?tab=history` - Match history
- `?tab=matches` - Find matches
- `?tab=payments` - Payment history
- `?tab=messages` - Messages
- `?tab=account` - Account settings
- `?tab=security` - Security settings
- `?tab=notifications` - Notification preferences
- `?tab=privacy` - Privacy settings
- `?tab=preferences` - User preferences

## Component Structure

### Main Layout Components
- `TopNav` - Top navigation bar
- `LeftNav` - Left sidebar navigation
- `RightSquawkbox` - Right sidebar with live chat/activity

### Key Feature Components
- `CreateChallengeDrawer` - Global challenge creation modal
- `ChallengeCard` - Individual challenge display
- `EventCard` - Event/tournament display
- `WalletPanel` - User wallet and balance management

## Navigation Flow

1. **Landing** → Lobbies (main game selection)
2. **Challenge Creation** → CreateChallengeDrawer (available globally)
3. **Profile Management** → MyProfile (consolidated settings)
4. **Game Discovery** → Lobbies → Events → FlockTube
5. **Account Management** → MyProfile (all settings consolidated)
# @de/types

TypeScript type definitions for DE frontends. This package provides a centralized collection of types, interfaces, and enums used across all DE frontend applications.

## Installation

```bash
# In a workspace package
pnpm add @de/types

# Or if installing from tarball
npm install de-frontend
```

## Usage

### Import the main UserType

```typescript
import { UserType } from '@de/types';

const user: UserType = {
  id: '123',
  email: 'user@example.com',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  permissions: [UserPermission.READ_POSTS],
  profile: {
    timezone: 'UTC',
    language: 'en'
  },
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLastSeen: true
    }
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};
```

### Import specific type modules

```typescript
// User types
import { UserType, UserRole, UserStatus } from '@de/types/user';

// API types
import { ApiResponse, ApiError, PaginationParams } from '@de/types/api';

// Common utility types
import { Optional, DeepPartial, AsyncState } from '@de/types/common';
```

### Import everything

```typescript
import * as Types from '@de/types';

const user: Types.UserType = { /* ... */ };
const response: Types.ApiResponse<Types.UserType> = { /* ... */ };
```

## Available Types

### User Types (`@de/types/user`)

- `UserType` - Main user interface
- `UserProfile` - User profile information
- `UserPreferences` - User preferences and settings
- `UserRole` - Enum for user roles
- `UserStatus` - Enum for user status
- `UserPermission` - Enum for user permissions
- `CreateUserInput` - Type for creating users
- `UpdateUserInput` - Type for updating users
- `UserAuthData` - Authentication response data
- `LoginCredentials` - Login form data
- `RegisterCredentials` - Registration form data

### API Types (`@de/types/api`)

- `ApiResponse<T>` - Generic API response wrapper
- `ApiError` - API error structure
- `PaginationParams` - Pagination parameters
- `SortingParams` - Sorting parameters
- `FilterParams` - Filtering parameters
- `BatchRequest<T>` - Batch operation requests
- `FileUploadResponse` - File upload response
- `WebhookPayload<T>` - Webhook payload structure

### Common Types (`@de/types/common`)

- `Optional<T, K>` - Make specific fields optional
- `RequiredFields<T, K>` - Make specific fields required
- `DeepPartial<T>` - Deep partial type
- `DeepReadonly<T>` - Deep readonly type
- `AsyncState<T>` - Async operation state
- `FormState<T>` - Form state management
- `ThemeConfig` - Theme configuration
- `Notification` - Notification structure
- `SearchQuery` - Search parameters
- `SearchResult<T>` - Search results

## Type Safety

All types are designed with strict TypeScript compatibility and include:

- Proper generic constraints
- Utility types for common patterns  
- Enum values for controlled vocabularies
- Optional and required field variations
- Deep type safety for nested objects

## Development

```bash
# Build types
pnpm build

# Type checking
pnpm typecheck

# Run tests
pnpm test
```

## Contributing

When adding new types:

1. Place them in the appropriate module (`user.ts`, `api.ts`, `common.ts`)
2. Export them from the module
3. Re-export from `index.ts` if they're commonly used
4. Update the README with examples
5. Add corresponding exports to `package.json` if creating new modules
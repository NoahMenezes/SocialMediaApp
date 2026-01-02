# Authentication API Quick Reference

## Server Actions (use in Server Components or Client Components)

### Authentication Functions

```typescript
import { 
  signup, 
  login, 
  signInWithGoogle, 
  logout, 
  getCurrentUser,
  isAuthenticated,
  getSession 
} from "@/backend/actions/auth";
```

---

### `signup(formData: FormData)`
Creates a new user account with email/password.

**Form Fields Required:**
- `name` - Full name (min 2 characters)
- `email` - Valid email address
- `password` - Min 8 chars, must have uppercase, lowercase, and number

**Returns:**
```typescript
{
  success?: true,
  user?: { id, name, email },
  message?: string,
  error?: string
}
```

**Example:**
```tsx
<form action={async (formData) => {
  const result = await signup(formData);
  if (result.error) console.error(result.error);
}}>
  <input name="name" required />
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Sign Up</button>
</form>
```

---

### `login(formData: FormData)`
Logs in user with email/password.

**Form Fields Required:**
- `email` - Email address
- `password` - Password

**Returns:**
```typescript
{
  success?: true,
  user?: { id, name, email },
  error?: string
}
```

**Example:**
```tsx
<form action={async (formData) => {
  const result = await login(formData);
  if (result.success) router.push("/");
}}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Log In</button>
</form>
```

---

### `signInWithGoogle()`
Initiates Google OAuth sign-in flow.

**Returns:** Redirects to Google, then back to your app

**Example:**
```tsx
<button onClick={async () => {
  await signInWithGoogle();
}}>
  Continue with Google
</button>
```

Or with a form:
```tsx
<form action={signInWithGoogle}>
  <button type="submit">Continue with Google</button>
</form>
```

---

### `logout()`
Logs out the current user and redirects to login page.

**Returns:**
```typescript
{
  success?: true,
  error?: string
}
```

**Example:**
```tsx
<form action={logout}>
  <button type="submit">Log Out</button>
</form>
```

---

### `getCurrentUser()`
Gets the currently logged-in user (server-side only).

**Returns:**
```typescript
{
  id: string,
  name: string,
  email: string,
  image?: string,
  emailVerified?: Date
} | null
```

**Example:**
```tsx
// In a Server Component
export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

---

### `isAuthenticated()`
Checks if user is logged in (server-side only).

**Returns:** `boolean`

**Example:**
```tsx
// In a Server Component
export default async function ProtectedPage() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect("/login");
  }
  
  return <div>Protected content</div>;
}
```

---

### `getSession()`
Gets the full NextAuth session object (server-side only).

**Returns:**
```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    image?: string
  },
  expires: string
} | null
```

**Example:**
```tsx
// In a Server Component
export default async function Dashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return <div>Session expires: {session.expires}</div>;
}
```

---

## Common Patterns

### Protected Server Component
```tsx
import { getCurrentUser } from "@/backend/actions/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Login Form (Client Component)
```tsx
"use client";

import { login, signInWithGoogle } from "@/backend/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <input name="email" type="email" required />
        <input name="password" type="password" required />
        <button type="submit">Log In</button>
      </form>
      
      <button onClick={() => signInWithGoogle()}>
        Continue with Google
      </button>
    </div>
  );
}
```

### Logout Button
```tsx
import { logout } from "@/backend/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit">Log Out</button>
    </form>
  );
}
```

### User Profile Display
```tsx
import { getCurrentUser } from "@/backend/actions/auth";

export async function UserProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      {user.image && <img src={user.image} alt={user.name} />}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {user.emailVerified && <span>✓ Verified</span>}
    </div>
  );
}
```

---

## Error Messages

### Signup Errors:
- "All fields are required"
- "Name must be at least 2 characters long"
- "Please enter a valid email address"
- "Password must be at least 8 characters long"
- "Password must contain at least one uppercase letter"
- "Password must contain at least one lowercase letter"
- "Password must contain at least one number"
- "User already exists with this email"

### Login Errors:
- "Email and password are required"
- "Please enter a valid email address"
- "Invalid email or password"
- "This account uses Google sign-in. Please sign in with Google."

### Google Sign-In Errors:
- "Google sign-in failed. Please try again."
- "An error occurred during sign-in."

---

## TypeScript Types

```typescript
// User object returned from getCurrentUser()
type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
};

// Auth result from signup/login
type AuthResult = {
  success?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
  error?: string;
};

// Session object from getSession()
type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
  expires: string;
} | null;
```

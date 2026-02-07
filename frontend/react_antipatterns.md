# React Antipatterns & Best Practices

This document outlines common antipatterns in React development and their corresponding best practices to ensure maintainable, performant, and clean code.

## 1. Defining Components Inside Components
**Antipattern:**
Defining a component inside another component's render function causes it to be re-created on every render, leading to loss of state and focus issues.

```tsx
// ❌ Bad
const Parent = () => {
  const Child = () => <div>I am a child</div>; // Re-created every render
  return <Child />;
};
```

**Best Practice:**
Move the component definition outside.

```tsx
// ✅ Good
const Child = () => <div>I am a child</div>;
const Parent = () => <Child />;
```

## 2. Mixing UI and Business Logic (The "God" Component)
**Antipattern:**
Components that handle data fetching, complex state management, and UI rendering all in one file. This makes components hard to test, reuse, and read.

```tsx
// ❌ Bad
const UserList = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(setUsers);
  }, []);

  // ... extensive logic for filtering, sorting, etc.

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
};
```

**Best Practice:**
Separate **Business Logic** from **UI (Presentational)** components.

**Approach A: Custom Hooks (Modern Standard)**
Extract logic into a custom hook.

```tsx
// useUsers.ts (Business Logic)
export const useUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 1. Initial Data Fetch
    fetch('/api/users').then(res => res.json()).then(setUsers);
  }, []);

  // 2. Business Logic / State Update
  const addUser = (name) => {
    const newUser = { id: Date.now(), name };
    setUsers([...users, newUser]); // Update local state
    // Optionally: fetch('/api/users', { method: 'POST', body: ... })
  };

  return { users, addUser }; // Expose data AND actions
};

// UserList.tsx (UI)
const UserList = () => {
  const { users, addUser } = useUsers(); 
  
  return (
    <div>
      <ul>
        {users.map(u => <li key={u.id}>{u.name}</li>)}
      </ul>
      {/* 3. Connect UI event to Logic */}
      <button onClick={() => addUser('New User')}>Add User</button>
    </div>
  );
};
```

**Approach B: Container/Presentational Pattern**
Use a container component for logic and a presentational component for UI.

## 3. Using Index as Key
**Antipattern:**
Using the array index as a key can lead to rendering bugs and performance issues if the list order changes.

```tsx
// ❌ Bad
{items.map((item, index) => <li key={index}>{item.name}</li>)}
```

**Best Practice:**
Use unique, stable IDs from your data.

```tsx
// ✅ Good
{items.map((item) => <li key={item.id}>{item.name}</li>)}
```

## 4. Prop Drilling
**Antipattern:**
Passing data through multiple layers of components that don't need it.

```tsx
// ❌ Bad
<Parent user={user} /> // -> Child -> GrandChild -> GreatGrandChild (actually needs user)
```

**Best Practice:**
Use **React Context** for global data (theme, auth) or **Component Composition** (passing components as children).

## 5. Modifying State Directly
**Antipattern:**
Mutating state directly prevents React from detecting changes and triggering re-renders.

```tsx
// ❌ Bad
items.push('New Item');
setItems(items);
```

**Best Practice:**
Always create a new copy.

```tsx
// ✅ Good
setItems([...items, 'New Item']);
```

## 6. Overusing `useEffect`
**Antipattern:**
Using `useEffect` to sync state or calculate derived data often leads to unnecessary re-renders.

```tsx
// ❌ Bad
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

**Best Practice:**
Calculate values directly during render (Derived State).

```tsx
// ✅ Good
const fullName = `${firstName} ${lastName}`;
```

## 7. Boolean Props Explosion
**Antipattern:**
Creating components with too many boolean props.

```tsx
// ❌ Bad
<Button isPrimary isSmall hasIcon isLoading />
```

**Best Practice:**
Use variant or enumeration strings.

```tsx
// ✅ Good
<Button variant="primary" size="small" state="loading" />
```

## 8. Not Cleaning Up Side Effects
**Antipattern:**
Forgetting to return a cleanup function in `useEffect` for things like intervals or event listeners.

```tsx
// ❌ Bad
useEffect(() => {
  const timer = setInterval(() => console.log('Tick'), 1000);
}, []); // Timer runs forever
```

**Best Practice:**
Always return a cleanup function.

```tsx
// ✅ Good
useEffect(() => {
  const timer = setInterval(() => console.log('Tick'), 1000);
  return () => clearInterval(timer);
}, []);
```

## 9. Missing Dependencies in `useEffect`
**Antipattern:**
Omitting variables used inside `useEffect` from the dependency array, leading to stale closures and bugs.

**Best Practice:**
Follow the `react-hooks/exhaustive-deps` ESLint rule. If you need to omit a dependency, you likely need to refactor your logic (e.g., using `useCallback` or `useRef`).

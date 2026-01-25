import { Timestamp } from "firebase/firestore";

/**
 * Represents a Todo item in the application
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  userId: string;
  priority?: "low" | "medium" | "high";
}

/**
 * Data required to create a new Todo
 */
export interface CreateTodoInput {
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
}

/**
 * Data for updating an existing Todo
 */
export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
}

/**
 * Represents a User in the application
 */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Authentication state for the context
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Auth context value type
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Props for hook return types
 */
export interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (input: CreateTodoInput) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  refreshTodos: () => Promise<void>;
}

export interface UseTodoDetailsReturn {
  todo: Todo | null;
  loading: boolean;
  error: string | null;
  updateTodo: (input: UpdateTodoInput) => Promise<void>;
  deleteTodo: () => Promise<void>;
}

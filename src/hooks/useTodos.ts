/**
 * useTodos Hook - Bridge between UI and Service Layer
 */

import { useCallback, useEffect, useState } from "react";
import { TodoService } from "../services/todoService";
import {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
  UseTodoDetailsReturn,
  UseTodosReturn,
} from "../types";

/**
 * Hook to fetch and manage a list of todos for a user
 * @param userId - The current user's ID
 * @returns Object containing todos array, loading state, error, and CRUD methods
 *
 * INTERVIEW POINT: Error handling happens HERE, not in the service layer.
 */
export function useTodos(userId: string | null): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all todos for the user
  const fetchTodos = useCallback(async () => {
    if (!userId) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call service layer - errors will throw here
      const data = await TodoService.getTodosByUserId(userId);
      setTodos(data);
    } catch (err) {
      // INTERVIEW POINT: Exceptions from TodoService are caught HERE
      console.error("Failed to fetch todos:", err);
      setError("Failed to load your tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch todos on mount and when userId changes
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add a new todo
  const addTodo = useCallback(
    async (input: CreateTodoInput) => {
      if (!userId) {
        setError("You must be logged in to add tasks");
        return;
      }

      try {
        const newTodo = await TodoService.createTodo(userId, input);
        setTodos((prev) => [newTodo, ...prev]);
      } catch (err) {
        console.error("Failed to add todo:", err);
        setError("Failed to add task. Please try again.");
        throw err; // Re-throw so UI can handle if needed
      }
    },
    [userId],
  );

  // Toggle todo completion status
  const toggleTodo = useCallback(
    async (id: string) => {
      try {
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;

        await TodoService.toggleTodoComplete(id, todo.completed);

        // Optimistic update
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t,
          ),
        );
      } catch (err) {
        console.error("Failed to toggle todo:", err);
        setError("Failed to update task. Please try again.");
      }
    },
    [todos],
  );

  // Delete a todo
  const deleteTodo = useCallback(async (id: string) => {
    try {
      await TodoService.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setError("Failed to delete task. Please try again.");
    }
  }, []);

  // Refresh todos manually
  const refreshTodos = useCallback(async () => {
    await fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    refreshTodos,
  };
}

/**
 * Hook to fetch and manage a single todo by ID
 * @param id - The todo document ID
 * @returns Object containing todo data, loading state, error, and update/delete methods
 *
 * INTERVIEW POINT: This is the hook called from app/task/[id].tsx
 * Error handling for TodoService.getTodoById happens HERE.
 */
export function useTodoDetails(id: string): UseTodoDetailsReturn {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodo = async () => {
      setLoading(true);
      setError(null);

      try {
        // Call service layer - no try/catch in getTodoById
        const data = await TodoService.getTodoById(id);
        setTodo(data);
      } catch (err) {
        // INTERVIEW POINT: Exceptions from TodoService.getTodoById are caught HERE
        // This is where the "missing error handling" from the service is handled
        console.error("Failed to fetch todo details:", err);
        setError("Failed to load task details. The task may not exist.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTodo();
    }
  }, [id]);

  // Update the todo
  const updateTodo = useCallback(
    async (input: UpdateTodoInput) => {
      if (!todo) return;

      try {
        await TodoService.updateTodo(id, input);
        setTodo((prev) => (prev ? { ...prev, ...input } : null));
      } catch (err) {
        console.error("Failed to update todo:", err);
        setError("Failed to update task. Please try again.");
        throw err;
      }
    },
    [id, todo],
  );

  // Delete the todo
  const deleteTodo = useCallback(async () => {
    try {
      await TodoService.deleteTodo(id);
      setTodo(null);
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setError("Failed to delete task. Please try again.");
      throw err;
    }
  }, [id]);

  return {
    todo,
    loading,
    error,
    updateTodo,
    deleteTodo,
  };
}

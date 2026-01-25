import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { CreateTodoInput, Todo, UpdateTodoInput } from "../types";
import { db } from "./firebaseConfig";

const TODOS_COLLECTION = "todos";

export const TodoService = {
  /**
   * Fetches a single todo by its ID
   * @param id - The document ID of the todo
   * @returns The todo document data
   *
   * INTERVIEW POINT: This function has no error handling.
   * Errors will propagate to useTodoDetails hook.
   */
  async getTodoById(id: string): Promise<Todo> {
    const docRef = doc(db, TODOS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Todo with id ${id} not found`);
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Todo;
  },

  /**
   * Fetches all todos for a specific user
   * @param userId - The user's ID to filter todos
   * @returns Array of todo documents
   */
  async getTodosByUserId(userId: string): Promise<Todo[]> {
    const todosRef = collection(db, TODOS_COLLECTION);
    const q = query(
      todosRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Todo[];
  },

  /**
   * Creates a new todo document
   * @param userId - The user's ID who owns this todo
   * @param input - The todo data to create
   * @returns The created todo with its ID
   */
  async createTodo(userId: string, input: CreateTodoInput): Promise<Todo> {
    const todosRef = collection(db, TODOS_COLLECTION);

    const todoData = {
      title: input.title,
      description: input.description,
      completed: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId: userId,
      priority: input.priority || "medium",
    };

    const docRef = await addDoc(todosRef, todoData);

    return {
      id: docRef.id,
      ...todoData,
    };
  },

  /**
   * Updates an existing todo document
   * @param id - The document ID to update
   * @param input - The fields to update
   */
  async updateTodo(id: string, input: UpdateTodoInput): Promise<void> {
    const docRef = doc(db, TODOS_COLLECTION, id);

    await updateDoc(docRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Toggles the completed status of a todo
   * @param id - The document ID to toggle
   * @param currentStatus - The current completed status
   */
  async toggleTodoComplete(id: string, currentStatus: boolean): Promise<void> {
    const docRef = doc(db, TODOS_COLLECTION, id);

    await updateDoc(docRef, {
      completed: !currentStatus,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Deletes a todo document
   * @param id - The document ID to delete
   */
  async deleteTodo(id: string): Promise<void> {
    const docRef = doc(db, TODOS_COLLECTION, id);
    await deleteDoc(docRef);
  },
};

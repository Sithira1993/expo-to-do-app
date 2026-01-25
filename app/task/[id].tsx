import { Button } from "@/src/components/Button";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { useTodoDetails } from "@/src/hooks/useTodos";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { todo, loading, error, updateTodo, deleteTodo } = useTodoDetails(
    id as string,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const isDark = colorScheme === "dark";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          Loading task details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-6">
        <Text className="text-red-500 text-lg text-center mb-4">{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!todo) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-6">
        <Text className="text-gray-600 dark:text-gray-400 text-lg text-center mb-4">
          Task not found
        </Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleStartEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateTodo({
        title: editTitle,
        description: editDescription,
      });
      setIsEditing(false);
    } catch (err) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTodo();
            router.back();
          } catch (err) {
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async () => {
    try {
      await updateTodo({ completed: !todo.completed });
    } catch (err) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-6">
        <View className="flex-row items-center mb-4">
          <View
            className={`px-3 py-1 rounded-full ${
              todo.completed
                ? "bg-green-100 dark:bg-green-900"
                : "bg-blue-100 dark:bg-blue-900"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                todo.completed
                  ? "text-green-800 dark:text-green-200"
                  : "text-blue-800 dark:text-blue-200"
              }`}
            >
              {todo.completed ? "Completed" : "In Progress"}
            </Text>
          </View>

          {todo.priority && (
            <View
              className={`px-3 py-1 rounded-full ml-2 ${getPriorityColor(todo.priority)}`}
            >
              <Text className="text-sm font-medium capitalize">
                {todo.priority}
              </Text>
            </View>
          )}
        </View>

        {isEditing ? (
          <TextInput
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-300 dark:border-gray-600 pb-2"
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Task title"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
          />
        ) : (
          <Text
            className={`text-2xl font-bold mb-4 ${
              todo.completed
                ? "text-gray-400 line-through"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {todo.title}
          </Text>
        )}

        <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Description
          </Text>
          {isEditing ? (
            <TextInput
              className="text-gray-700 dark:text-gray-300 text-base"
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Task description"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text className="text-gray-700 dark:text-gray-300 text-base">
              {todo.description || "No description provided"}
            </Text>
          )}
        </View>

        <View className="space-y-3">
          {isEditing ? (
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Button title="Save" onPress={handleSaveEdit} />
              </View>
              <View className="flex-1">
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setIsEditing(false)}
                />
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleToggleComplete}
                className={`p-4 rounded-xl flex-row items-center justify-center ${
                  todo.completed ? "bg-yellow-500" : "bg-green-500"
                }`}
              >
                <Text className="text-white font-semibold text-base">
                  {todo.completed ? "Mark as Incomplete" : "Mark as Complete"}
                </Text>
              </TouchableOpacity>

              <Button
                title="Edit Task"
                variant="secondary"
                onPress={handleStartEdit}
              />

              <TouchableOpacity
                onPress={handleDelete}
                className="p-4 rounded-xl bg-red-500 flex-row items-center justify-center"
              >
                <Text className="text-white font-semibold text-base">
                  Delete Task
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

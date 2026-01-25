import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { TaskCard } from "@/src/components/TaskCard";
import { useAuth } from "@/src/context/AuthContext";
import { useTodos } from "@/src/hooks/useTodos";
import { CreateTodoInput } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    refreshTodos,
  } = useTodos(user?.uid || null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTodo = async () => {
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const input: CreateTodoInput = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        priority: newPriority,
      };
      await addTodo(input);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      setIsModalVisible(false);
    } catch (err) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;

  // Show login prompt if user is not logged in
  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-6">
        <View className="items-center">
          <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-6">
            <FontAwesome name="lock" size={40} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
            Please sign in to view and manage your tasks
          </Text>
          <Link href="/(tabs)/settings" asChild>
            <TouchableOpacity className="bg-blue-500 px-8 py-3 rounded-lg">
              <Text className="text-white font-semibold text-center">
                Go to Settings to Login
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Stats Header */}
      <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-500">
              {pendingCount}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Pending
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-500">
              {completedCount}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Completed
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {todos.length}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Total
            </Text>
          </View>
        </View>
      </View>

      {/* Error Banner */}
      {error && (
        <View className="bg-red-50 dark:bg-red-900/30 px-6 py-3">
          <Text className="text-red-600 dark:text-red-400 text-center">
            {error}
          </Text>
        </View>
      )}

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshTodos} />
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center py-20">
              <FontAwesome name="inbox" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 dark:text-gray-400 text-lg mt-4">
                No tasks yet
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Tap the + button to add your first task
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TaskCard
            todo={item}
            onPress={() => handleTaskPress(item.id)}
            onToggle={() => toggleTodo(item.id)}
            onDelete={() => deleteTodo(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
      />

      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
          />
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl px-6 py-8">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              New Task
            </Text>

            <View className="space-y-4">
              <Input
                label="Title"
                placeholder="What needs to be done?"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Input
                label="Description"
                placeholder="Add some details..."
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
              />

              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </Text>
                <View className="flex-row space-x-2">
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => setNewPriority(priority)}
                      className={`flex-1 py-3 rounded-lg items-center ${
                        newPriority === priority
                          ? priority === "high"
                            ? "bg-red-500"
                            : priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <Text
                        className={`font-medium capitalize ${
                          newPriority === priority
                            ? "text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row space-x-3 pt-4">
                <View className="flex-1">
                  <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setIsModalVisible(false)}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title={isSubmitting ? "Creating..." : "Create Task"}
                    onPress={handleCreateTodo}
                    disabled={!newTitle.trim() || isSubmitting}
                  />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

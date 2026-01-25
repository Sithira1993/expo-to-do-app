/**
 * TaskCard Component - Displays a single todo item
 *
 * Reusable component for rendering todo items in lists.
 */

import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Todo } from "@/src/types";

interface TaskCardProps {
  todo: Todo;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskCard({ todo, onPress, onToggle, onDelete }: TaskCardProps) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  const getPriorityColor = () => {
    switch (todo.priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Checkbox */}
        <TouchableOpacity
          onPress={onToggle}
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            todo.completed
              ? "bg-green-500 border-green-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {todo.completed && (
            <FontAwesome name="check" size={12} color="white" />
          )}
        </TouchableOpacity>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center">
            {/* Priority indicator */}
            <View className={`w-2 h-2 rounded-full ${getPriorityColor()} mr-2`} />
            
            <Text
              className={`text-base font-medium flex-1 ${
                todo.completed
                  ? "text-gray-400 line-through"
                  : "text-gray-900 dark:text-white"
              }`}
              numberOfLines={1}
            >
              {todo.title}
            </Text>
          </View>

          {todo.description ? (
            <Text
              className={`text-sm mt-1 ${
                todo.completed
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              numberOfLines={2}
            >
              {todo.description}
            </Text>
          ) : null}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          className="p-2 ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="trash-o" size={18} color="#EF4444" />
        </TouchableOpacity>

        {/* Chevron */}
        <FontAwesome
          name="chevron-right"
          size={14}
          color="#9CA3AF"
          style={{ marginLeft: 8 }}
        />
      </View>
    </TouchableOpacity>
  );
}

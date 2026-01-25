/**
 * Input Component - Reusable styled text input
 *
 * A flexible input component with label support.
 */

import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { useColorScheme } from "@/src/hooks/useColorScheme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className={`px-4 py-3.5 rounded-xl border ${
          error
            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
        } text-gray-900 dark:text-white text-base`}
        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
        {...props}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
}

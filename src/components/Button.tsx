/**
 * Button Component - Reusable styled button
 *
 * A flexible button component with primary and secondary variants.
 */

import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isPrimary = variant === "primary";

  const buttonClasses = isPrimary
    ? "bg-blue-500 active:bg-blue-600"
    : "bg-gray-200 dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600";

  const textClasses = isPrimary
    ? "text-white"
    : "text-gray-700 dark:text-gray-300";

  const disabledClasses = disabled
    ? "opacity-50"
    : "";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`p-4 rounded-xl items-center justify-center ${buttonClasses} ${disabledClasses}`}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "white" : "#6B7280"} />
      ) : (
        <Text className={`font-semibold text-base ${textClasses}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

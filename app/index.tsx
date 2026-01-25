import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { useAuth } from "@/src/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthMode = "login" | "register";

export default function WelcomeScreen() {
  const { login, register, loading, error, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const toggleMode = () => {
    setMode(isLogin ? "register" : "login");
    setLocalError(null);
    clearError();
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return false;
    }

    if (!password.trim()) {
      setLocalError("Please enter your password.");
      return false;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return false;
    }

    if (!isLogin && !displayName.trim()) {
      setLocalError("Please enter your name.");
      return false;
    }

    setLocalError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, displayName.trim());
      }
    } catch {
      setLocalError("An error occurred. Please try again.");
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8 justify-center">
            {/* Logo/Header Section */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 bg-blue-500 rounded-2xl items-center justify-center mb-4 shadow-lg">
                <FontAwesome name="check-square-o" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                TaskFlow
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                {isLogin
                  ? "Welcome back! Sign in to continue."
                  : "Create an account to get started."}
              </Text>
            </View>

            {/* Error Banner */}
            {displayError && (
              <View className="bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl mb-6">
                <Text className="text-red-600 dark:text-red-400 text-center">
                  {displayError}
                </Text>
              </View>
            )}

            {/* Form */}
            <View className="mb-6">
              {!isLogin && (
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              )}

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </View>

            {/* Submit Button */}
            <Button
              title={isLogin ? "Sign In" : "Create Account"}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />

            {/* Toggle Mode */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500 dark:text-gray-400">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text className="text-blue-500 font-semibold">
                  {isLogin ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

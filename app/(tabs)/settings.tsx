import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { useAuth } from "@/src/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AuthMode = "login" | "register";

export default function SettingsScreen() {
  const { user, login, register, logout, error, clearError } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "?";
  };

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

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, displayName.trim());
      }
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    const displayError = localError || error;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-gray-50 dark:bg-gray-900"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8 justify-center">
            <View className="items-center mb-8">
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

            {displayError && (
              <View className="bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl mb-6">
                <Text className="text-red-600 dark:text-red-400 text-center">
                  {displayError}
                </Text>
              </View>
            )}

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

            <Button
              title={isLogin ? "Sign In" : "Create Account"}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            />

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
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Profile Section */}
      <View className="bg-white dark:bg-gray-800 px-6 py-8 items-center border-b border-gray-200 dark:border-gray-700">
        {/* Avatar */}
        <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4 shadow-lg">
          {user?.photoURL ? (
            <FontAwesome name="user" size={40} color="white" />
          ) : (
            <Text className="text-3xl font-bold text-white">
              {getInitials()}
            </Text>
          )}
        </View>

        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {user?.displayName || "User"}
        </Text>

        <Text className="text-gray-500 dark:text-gray-400 mt-1">
          {user?.email || "No email"}
        </Text>
      </View>

      <View className="mt-6 px-4">
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
          Account
        </Text>

        <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
              <FontAwesome name="user" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-gray-900 dark:text-white font-medium">
                Edit Profile
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Update your name and photo
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center">
              <FontAwesome name="bell" size={18} color="#8B5CF6" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-gray-900 dark:text-white font-medium">
                Notifications
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Manage notification preferences
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-6 px-4">
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
          About
        </Text>

        <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center">
              <FontAwesome name="info-circle" size={18} color="#10B981" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-gray-900 dark:text-white font-medium">
                App Version
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                1.0.0
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full items-center justify-center">
              <FontAwesome name="question-circle" size={18} color="#F59E0B" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-gray-900 dark:text-white font-medium">
                Help & Support
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Get help or send feedback
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-8 px-4 pb-8">
        <Button
          title="Sign Out"
          variant="secondary"
          onPress={handleLogout}
          loading={isLoggingOut}
        />
      </View>
    </ScrollView>
  );
}

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.backgroundPrimary,
          borderTopColor: theme.borderPrimary,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen
        name="login"
        options={{
          title: "Sign In",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-in" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "Sign Up",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="forgot-password"
        options={{
          title: "Reset",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="key" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="verify-otp"
        options={{
          href: null, // This hides the tab but keeps the screen accessible via navigation
        }}
      />
      <Tabs.Screen
        name="reset-password"
        options={{
          href: null, // This hides the tab but keeps the screen accessible via navigation
        }}
      />
    </Tabs>
  );
}

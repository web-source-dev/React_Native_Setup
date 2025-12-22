import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { colors } from "../../theme/colors";
import { useState } from "react";
import Sidebar from "./sidebar";

export default function Header() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const titleMap: Record<string, string> = {
    "/": "Apex Mobile",
    "/showcase": "UI Components",
    "/camera-test": "Camera Test",
    "/profile": "Profile",
    "/settings": "Settings",
    "/help": "Help & Support",
    "/(tabs)": "Apex Mobile",
    "/(tabs)/": "Apex Mobile",
    "/(tabs)/index": "Apex Mobile",
    "/(tabs)/showcase": "UI Components",
    "/(tabs)/camera-test": "Camera Test",
    "/(tabs)/media-library": "Media Library",
  };

  const title = titleMap[pathname] ?? "Apex";

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  const handleSidebarClose = () => {
    setSidebarVisible(false);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
        <View style={styles.content}>
          <Pressable
            style={[styles.menuButton]}
            onPress={handleMenuPress}
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Ionicons
              name="menu"
              size={24}
              color={theme.primary}
            />
          </Pressable>

          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, { color: theme.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>

          <View style={styles.rightPlaceholder} />
        </View>
      </View>

      <Sidebar
        isVisible={sidebarVisible}
        onClose={handleSidebarClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.borderPrimary,
    marginTop: 30,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  rightPlaceholder: {
    width: 40,
    height: 40,
  },
});

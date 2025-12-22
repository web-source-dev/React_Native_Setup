import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../../theme/ThemeContext";
import { Button } from "../../components/ui/Button";

export default function Index() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.backgroundPrimary,
        padding: 20,
      }}
    >
      <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        Welcome to Apex Mobile
      </Text>
      <Text style={{ color: theme.textSecondary, fontSize: 16, textAlign: 'center', marginBottom: 32 }}>
        A mobile app with beautiful, themeable UI components
      </Text>

      <Link href="/showcase" asChild>
        <Button
          title="View UI Components Showcase"
          size="lg"
          style={{ minWidth: 250 }}
        />
      </Link>
    </View>
  );
}

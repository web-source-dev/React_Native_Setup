import { Stack } from 'expo-router';

export default function ScopeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[propertyId]" />
    </Stack>
  );
}


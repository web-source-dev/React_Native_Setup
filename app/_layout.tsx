import { Stack } from "expo-router";
import { ThemeProvider } from "../theme/ThemeContext";
import Header from "../components/layout/header";
import { LocationProvider, MediaProvider, NetworkProvider, DeviceProvider } from "../hooks";
import { DatabaseProvider } from "../lib/database/DatabaseProvider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <LocationProvider>
          <NetworkProvider>
            <DeviceProvider>
              <MediaProvider>
                <Stack
                  screenOptions={{
                    header: () => <Header />,
                  }}
                >
                </Stack>
              </MediaProvider>
            </DeviceProvider>
          </NetworkProvider>
        </LocationProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}

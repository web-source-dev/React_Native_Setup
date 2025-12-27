import { Stack } from "expo-router";
import { ThemeProvider } from "../theme/ThemeContext";
import { AuthProvider } from "../context/authcontext";
import Header from "../components/layout/header";
import { LocationProvider, MediaProvider, NetworkProvider, DeviceProvider, PropertyProvider, ScopeProvider } from "../hooks";
import { DatabaseProvider, useDatabaseContext } from "../lib/database/DatabaseProvider";
import { initializeSync } from "../lib/database";
import { initializeCatalog } from "../lib/database/services/catalogInit.service";
import { useEffect } from "react";

function AppContent() {
  const { isInitialized } = useDatabaseContext();

  useEffect(() => {
    // Initialize sync system
    initializeSync();
  }, []);

  useEffect(() => {
    // Initialize catalog data only after database is initialized
    if (isInitialized) {
      initializeCatalog().catch((error) => {
        console.error('Failed to initialize catalog:', error);
      });
    }
  }, [isInitialized]);

  return (
    <Stack
      screenOptions={{
        header: () => <Header />,
      }}
    >
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DatabaseProvider>
          <LocationProvider>
            <NetworkProvider>
              <DeviceProvider>
                <MediaProvider>
                  <PropertyProvider>
                    <ScopeProvider propertyId={undefined}>
                      <AppContent />
                    </ScopeProvider>
                  </PropertyProvider>
                </MediaProvider>
              </DeviceProvider>
            </NetworkProvider>
          </LocationProvider>
        </DatabaseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

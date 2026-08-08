import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { AuthProvider } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerTitleStyle: { color: theme.text },
            contentStyle: { backgroundColor: theme.background },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="jeu/[slug]" options={{ title: '' }} />
          <Stack.Screen name="article/[slug]" options={{ title: '' }} />
          <Stack.Screen name="categorie/[slug]" options={{ title: '' }} />
          <Stack.Screen name="cgu" options={{ title: 'Conditions d’utilisation' }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}

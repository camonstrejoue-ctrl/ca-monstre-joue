import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';

import { BottomTabBar } from '@/components/bottom-tab-bar';
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
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.background },
              headerTintColor: theme.text,
              headerTitleStyle: { color: theme.text },
              contentStyle: { backgroundColor: theme.background },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="catalogue" options={{ headerShown: false }} />
            <Stack.Screen name="ludotheque" options={{ headerShown: false }} />
            <Stack.Screen name="joueurs" options={{ headerShown: false }} />
            <Stack.Screen name="profil" options={{ headerShown: false }} />
            <Stack.Screen name="outils" options={{ headerShown: false }} />
            <Stack.Screen name="outils/des" />
            <Stack.Screen name="outils/score" />
            <Stack.Screen name="jeu/[slug]" options={{ title: '' }} />
            <Stack.Screen name="article/[slug]" options={{ title: '' }} />
            <Stack.Screen name="categorie/[slug]" options={{ title: '' }} />
            <Stack.Screen name="joueur/[uid]" options={{ title: '' }} />
            <Stack.Screen name="cgu" options={{ title: 'Conditions d’utilisation' }} />
          </Stack>
          <BottomTabBar />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}

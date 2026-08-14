import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';

import { BottomTabBar } from '@/components/bottom-tab-bar';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider } from '@/lib/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.background },
              headerTintColor: theme.text,
              headerTitleStyle: { color: theme.text, fontFamily: Fonts.display },
              contentStyle: { backgroundColor: theme.background },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="catalogue" options={{ headerShown: false }} />
            <Stack.Screen name="ludotheque" options={{ headerShown: false }} />
            <Stack.Screen name="joueurs" options={{ headerShown: false }} />
            <Stack.Screen name="agenda" options={{ headerShown: false }} />
            <Stack.Screen name="profil" options={{ headerShown: false }} />
            <Stack.Screen name="outils" options={{ headerShown: false }} />
            <Stack.Screen name="outils/des" />
            <Stack.Screen name="outils/score" />
            <Stack.Screen name="outils/souvenirs" options={{ title: 'Souvenirs' }} />
            <Stack.Screen name="outils/souvenir/[id]" options={{ title: '' }} />
            <Stack.Screen name="jeu/[slug]" options={{ title: '' }} />
            <Stack.Screen name="article/[slug]" options={{ title: '' }} />
            <Stack.Screen name="categorie/[slug]" options={{ title: '' }} />
            <Stack.Screen name="joueur/[uid]" options={{ title: '' }} />
            <Stack.Screen name="ptit-monstre" />
            <Stack.Screen name="cgu" options={{ title: 'Conditions d’utilisation' }} />
          </Stack>
          <BottomTabBar />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}

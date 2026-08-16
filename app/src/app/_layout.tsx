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
  // On ne bloque plus l'affichage de l'app tant que les polices ne sont pas
  // chargées : un souci réseau/chargement ferait sinon planter l'app sur un
  // écran vide indéfiniment. Les polices s'appliquent dès qu'elles arrivent ;
  // en attendant, React Native retombe sur une police système.
  useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

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
              headerTitleStyle: { color: theme.text, fontFamily: Fonts.display },
              contentStyle: { backgroundColor: theme.background },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="monde-du-jeu" />
            <Stack.Screen name="mon-univers" />
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

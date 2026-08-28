import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

function Paragraph({ title, text }: { title: string; text: string }) {
  return (
    <>
      <ThemedText type="subtitle" style={styles.h2}>
        {title}
      </ThemedText>
      <ThemedText style={styles.paragraph}>{text}</ThemedText>
    </>
  );
}

export default function CguScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Conditions d’utilisation
        </ThemedText>

        <Paragraph
          title="Âge minimum"
          text="L’application met en relation des joueurs pour organiser des parties ou des prêts/échanges de jeux. Elle est réservée aux personnes de 18 ans ou plus, sur la base d’une déclaration à l’inscription."
        />
        <Paragraph
          title="Tes données"
          text="Ton pseudo, ta ville et ta ludothèque sont visibles par les autres utilisateurs connectés, pour faciliter la mise en relation. Ton e-mail sert de moyen de contact et n’est visible que si tu choisis de le partager."
        />
        <Paragraph
          title="Rencontres entre joueurs"
          text="Ça Monstre Joue met en relation des joueurs mais n’organise pas les rencontres ni les prêts/échanges, qui restent sous ta seule responsabilité. Prends les précautions habituelles avant de rencontrer quelqu’un ou de prêter un jeu."
        />
        <Paragraph
          title="Signalement"
          text="Si le comportement d’un autre utilisateur pose problème, utilise le bouton « Signaler » sur son profil. Chaque signalement est examiné manuellement et peut mener à la suspension du compte concerné."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.two },
  title: { fontSize: 26, marginBottom: Spacing.two },
  h2: { fontSize: 18, marginTop: Spacing.three },
  paragraph: { marginBottom: Spacing.two },
});

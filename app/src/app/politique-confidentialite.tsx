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

export default function PolitiqueConfidentialiteScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Politique de confidentialité
        </ThemedText>

        <Paragraph
          title="Responsable du traitement"
          text="Ça Monstre Joue (camonstrejoue@gmail.com) est responsable des données traitées par cette application."
        />

        <Paragraph
          title="Données collectées"
          text="Compte : e-mail, mot de passe et date de naissance (sert uniquement à calculer ton âge — voir « Mineurs » ci-dessous — jamais affichée telle quelle). Profil : pseudo, ville, e-mail de contact affiché aux autres utilisateurs. Optionnel : prénom, âge calculé, description de ton profil de joueur, catégories de jeux préférées, accessoire d'avatar — chacun visible publiquement uniquement si tu l'autorises explicitement. Ludothèque : liste des jeux que tu ajoutes (via la recherche BoardGameGeek). Les photos et informations de la section « Mes souvenirs » restent uniquement sur ton téléphone et ne sont jamais envoyées à nos serveurs."
        />

        <Paragraph
          title="Pourquoi on les utilise"
          text="Ces données servent uniquement à faire fonctionner l'application : te permettre de te connecter, afficher ton profil aux autres joueurs, te faire trouver des joueurs près de chez toi et gérer ta ludothèque. On ne les utilise pas à des fins publicitaires et on ne les vend à personne."
        />

        <Paragraph
          title="Base légale"
          text="Le traitement repose sur ton consentement, donné librement lors de la création de ton compte. Tu peux le retirer à tout moment en supprimant ton compte."
        />

        <Paragraph
          title="Hébergement et sécurité"
          text="Les données sont hébergées par Firebase (Google), sur des serveurs situés en Europe. Les mots de passe sont gérés de façon sécurisée par Firebase Authentication — nous n'y avons jamais accès en clair. Des règles d'accès strictes garantissent que seul toi peux modifier ton profil et ta ludothèque."
        />

        <Paragraph
          title="Partage avec des tiers"
          text="La recherche de jeux passe par l'API publique de BoardGameGeek (BGG), sans transmission de tes données personnelles. Aucune autre donnée n'est partagée avec des tiers, sauf obligation légale."
        />

        <Paragraph
          title="Durée de conservation"
          text="Tes données sont conservées tant que ton compte existe. Elles sont supprimées définitivement dès que tu supprimes ton compte, depuis l'onglet Profil."
        />

        <Paragraph
          title="Tes droits"
          text="Tu peux à tout moment accéder à tes données, les corriger (dans l'onglet Profil), ou demander leur suppression complète en supprimant ton compte. Pour toute question ou demande spécifique (export de données, réclamation), contacte-nous à camonstrejoue@gmail.com."
        />

        <Paragraph
          title="Mineurs"
          text="L'application elle-même n'a pas d'âge minimum pour créer un compte : ta date de naissance nous sert uniquement à calculer ton âge. La fonctionnalité « Trouver des joueurs » (annuaire, mise en relation, contact) est en revanche réservée aux personnes de 18 ans ou plus — elle se débloque automatiquement le jour de tes 18 ans, sans rien avoir à refaire."
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

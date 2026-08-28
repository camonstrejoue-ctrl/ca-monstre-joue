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
          text="Compte : e-mail, mot de passe et date de naissance (sert uniquement à calculer ton âge — voir « Mineurs » ci-dessous — jamais affichée telle quelle). Profil : pseudo, ville, e-mail de contact affiché aux autres utilisateurs. Optionnel : prénom, âge calculé, description de ton profil de joueur, catégories de jeux préférées, accessoire d'avatar — chacun visible publiquement uniquement si tu l'autorises explicitement. Ludothèque : liste des jeux que tu ajoutes (via la recherche BoardGameGeek). Agenda : si tu proposes un événement, son titre, lieu, date, prix, un contact (e-mail, téléphone ou lien) et une éventuelle affiche sont publics et visibles par tout le monde, y compris sans compte. Signalements et suggestions : si tu signales un profil ou proposes une idée, ton identifiant et le texte envoyé sont conservés pour être consultés manuellement par l'équipe — jamais lisibles depuis l'application elle-même. Les photos et informations de la section « Mes souvenirs » restent uniquement sur ton téléphone et ne sont jamais envoyées à nos serveurs."
        />

        <Paragraph
          title="Pourquoi on les utilise"
          text="Ces données servent uniquement à faire fonctionner l'application : te permettre de te connecter, afficher ton profil aux autres joueurs, te faire trouver des joueurs près de chez toi, gérer ta ludothèque, publier tes événements dans l'agenda et traiter les signalements/suggestions envoyés. On ne les utilise pas à des fins publicitaires et on ne les vend à personne."
        />

        <Paragraph
          title="Base légale"
          text="Le traitement repose sur ton consentement, donné librement lors de la création de ton compte. Tu peux le retirer à tout moment en supprimant ton compte."
        />

        <Paragraph
          title="Hébergement et sécurité"
          text="Les données sont hébergées par Firebase (Google Cloud), dans la région multi-régionale « nam5 », c'est-à-dire aux États-Unis. Ce transfert hors Suisse/Europe est encadré par le Swiss-U.S. Data Privacy Framework, auquel Google est certifié — un mécanisme reconnu offrant un niveau de protection adéquat pour ce type de transfert. Les mots de passe sont gérés de façon sécurisée par Firebase Authentication — nous n'y avons jamais accès en clair. Des règles d'accès strictes garantissent que seul toi peux modifier ton profil et ta ludothèque."
        />

        <Paragraph
          title="Partage avec des tiers"
          text="La recherche de jeux passe par l'API publique de BoardGameGeek (BGG), sans transmission de tes données personnelles. Aucune autre donnée n'est partagée avec des tiers, sauf obligation légale."
        />

        <Paragraph
          title="Durée de conservation"
          text="Ton profil et ta ludothèque sont conservés tant que ton compte existe, et supprimés définitivement dès que tu supprimes ton compte depuis l'onglet Profil. Un événement que tu publies dans l'agenda reste visible jusqu'à ce que tu le supprimes toi-même ; s'il n'est plus rattaché à un compte existant (compte supprimé), il n'est pas effacé automatiquement — contacte-nous pour en demander le retrait. Les signalements et suggestions sont conservés 12 mois, le temps d'être traités, puis supprimés."
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

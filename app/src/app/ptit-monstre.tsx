import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';
import { matchingGames, STEPS, type ChatOption } from '@/lib/ptit-monstre';
import type { Game } from '@/types/content';

interface Message {
  text: string;
  from: 'bot' | 'user';
}

const GREETING =
  'Salut, moi c’est P’tit Monstre ! Réponds à quelques questions et je te propose un jeu qui devrait te plaire.';

type Stage =
  | { type: 'asking'; stepIndex: number }
  | { type: 'suggesting'; pool: Game[] }
  | { type: 'done' };

export default function PtitMonstreScreen() {
  const router = useRouter();
  const { content, loading, error, refresh } = useContent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [stage, setStage] = useState<Stage>({ type: 'asking', stepIndex: 0 });
  const [options, setOptions] = useState<ChatOption[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  function addMessage(text: string, from: 'bot' | 'user') {
    setMessages((prev) => [...prev, { text, from }]);
  }

  function restart() {
    if (!content) return;
    setAnswers({});
    setMessages([{ text: GREETING, from: 'bot' }]);
    setStage({ type: 'asking', stepIndex: 0 });
    setOptions(STEPS[0].options(content.categories));
    addMessage(STEPS[0].question, 'bot');
  }

  useEffect(() => {
    if (content && messages.length === 0) restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  function askStep(index: number, nextAnswers: Record<string, unknown>) {
    if (!content) return;
    if (index >= STEPS.length) {
      const pool = matchingGames(content.games, nextAnswers);
      if (pool.length === 0) {
        addMessage(
          'Je ne trouve aucun jeu qui correspond à tous ces critères… Tu veux recommencer avec d’autres réponses ?',
          'bot'
        );
        setStage({ type: 'done' });
        setOptions([{ label: 'Recommencer', value: 'restart' }]);
        return;
      }
      suggestOne(pool);
      return;
    }
    const step = STEPS[index];
    addMessage(step.question, 'bot');
    setStage({ type: 'asking', stepIndex: index });
    setOptions(step.options(content.categories));
  }

  function suggestOne(pool: Game[]) {
    if (pool.length === 0) {
      addMessage('J’ai fait le tour de mes idées pour ces critères ! Tu veux changer tes réponses ?', 'bot');
      setStage({ type: 'done' });
      setOptions([{ label: 'Recommencer', value: 'restart' }]);
      return;
    }
    const idx = Math.floor(Math.random() * pool.length);
    const remaining = [...pool];
    const [game] = remaining.splice(idx, 1);
    addMessage(`Je te propose : ${game.name} !`, 'bot');
    setStage({ type: 'suggesting', pool: remaining });
    setOptions([
      { label: 'Voir la fiche du jeu', value: { go: true, slug: game.slug } },
      { label: 'Me proposer un autre jeu', value: { go: false } },
    ]);
  }

  function handleChoice(opt: ChatOption) {
    addMessage(opt.label, 'user');

    if (opt.value === 'restart') {
      restart();
      return;
    }

    if (stage.type === 'asking') {
      const nextAnswers = { ...answers, [STEPS[stage.stepIndex].key]: opt.value };
      setAnswers(nextAnswers);
      askStep(stage.stepIndex + 1, nextAnswers);
      return;
    }

    if (stage.type === 'suggesting') {
      const value = opt.value as { go: boolean; slug?: string };
      if (value.go && value.slug) {
        router.push({ pathname: '/jeu/[slug]', params: { slug: value.slug } });
      } else {
        suggestOne(stage.pool);
      }
    }
  }

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'P’tit Monstre' }} />
      <ThemedView style={styles.header}>
        <Image source={require('@/assets/images/avatars/monstre-aucun.png')} style={styles.avatar} />
        <ThemedView style={styles.headerText}>
          <ThemedText type="smallBold">P’tit Monstre</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Je te trouve un jeu !
          </ThemedText>
        </ThemedView>
        <Pressable onPress={restart} hitSlop={8}>
          <ThemedText type="link">↺ Recommencer</ThemedText>
        </Pressable>
      </ThemedView>

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.map((m, i) => (
          <ThemedView
            key={i}
            type={m.from === 'user' ? 'backgroundSelected' : 'backgroundElement'}
            style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
            <ThemedText type="small" style={m.from === 'user' && styles.bubbleUserText}>
              {m.text}
            </ThemedText>
          </ThemedView>
        ))}
      </ScrollView>

      <ThemedView style={styles.choices}>
        {options.map((opt, i) => (
          <Pressable key={i} onPress={() => handleChoice(opt)}>
            <ThemedView type="backgroundElement" style={styles.choiceButton}>
              <ThemedText type="small">{opt.label}</ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  headerText: { flex: 1 },
  messages: { flex: 1 },
  messagesContent: { padding: Spacing.four, gap: Spacing.two },
  bubble: { maxWidth: '82%', padding: Spacing.three, borderRadius: Spacing.three },
  bubbleBot: { alignSelf: 'flex-start' },
  bubbleUser: { alignSelf: 'flex-end' },
  bubbleUserText: { color: '#FFFFFF' },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.3)',
  },
  choiceButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
});

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { radius, spacing, GRADIENTS } from '../theme';
import { useCouple } from '../context/CoupleContext';
import { notifyPartner } from '../lib/notifications';
import { useTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  created_at: string;
}

const STICKERS = ['❤️', '😂', '🥺', '🔥', '✨', '👀'];

export function ChatScreen() {
  const { userId, coupleId, isSoloMode } = useCouple();
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const isDark = mode === 'dark' || mode === 'system';
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    // Attempt to load from chat_messages
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        text: m.text,
        fromMe: m.profile_id === userId,
        created_at: m.created_at,
      })));
    } else if (error) {
      console.warn("Table 'chat_messages' might not exist yet. Please run the SQL migration.");
    }
    setLoading(false);
  }, [coupleId, userId]);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`chat-${coupleId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as any;
          setMessages((prev) => [
            {
              id: row.id,
              text: row.text,
              fromMe: row.profile_id === userId,
              created_at: row.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, userId, loadMessages]);

  async function sendMessage(textOverride?: string) {
    const textToSend = (textOverride ?? inputText).trim();
    if (!textToSend) return;
    
    setInputText('');
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [{
      id: tempId,
      text: textToSend,
      fromMe: true,
      created_at: new Date().toISOString()
    }, ...prev]);

    const { error } = await supabase.from('chat_messages').insert({
      couple_id: coupleId,
      profile_id: userId,
      text: textToSend,
    });

    if (!error) {
      await supabase.rpc('increment_pet_xp', { p_couple_id: coupleId, p_amount: 1 });
      notifyPartner({
        senderId: userId,
        coupleId,
        title: t('chat.notif.title', 'Nuevo mensaje 💬'),
        body: textToSend.length > 50 ? textToSend.slice(0, 47) + '...' : textToSend,
        data: { screen: 'Chat' },
      });
    }
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.fromMe;
    return (
      <Animated.View
        layout={Layout.springify()}
        entering={FadeInDown.springify()}
        style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}
      >
        <LinearGradient
          colors={isMe ? GRADIENTS.coral : GRADIENTS.cardPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}
        >
          <Text style={[styles.msgText, isMe ? { color: '#FFF' } : { color: colors.ink }]}>
            {item.text}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={isDark ? GRADIENTS.bgDark : GRADIENTS.bgLight} style={styles.screen}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <Text style={styles.title}>{t('chat.title', 'Chat')}</Text>
        {isSoloMode && (
          <View style={styles.soloBadge}>
            <Text style={styles.soloText}>Modo Solo</Text>
          </View>
        )}
      </Animated.View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.stickerRow}>
            {STICKERS.map((s) => (
              <Pressable key={s} onPress={() => sendMessage(s)} style={styles.stickerBtn}>
                <Text style={{ fontSize: 20 }}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('chat.placeholder', 'Escribe un mensaje...')}
              placeholderTextColor={colors.inkFaint}
              multiline
            />
            <Pressable
              style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.8 }]}
              onPress={() => sendMessage()}
            >
              <LinearGradient colors={GRADIENTS.purple} style={styles.sendGradient}>
                <Text style={{ fontSize: 16 }}>➤</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingTop: spacing(12),
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? 'rgba(26,26,46,0.8)' : 'rgba(255,255,255,0.8)',
  },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink },
  soloBadge: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  soloText: { fontSize: 10, color: colors.inkSoft, fontWeight: '800' },
  listContent: { padding: spacing(4), paddingBottom: spacing(20) },
  msgWrapper: {
    marginBottom: spacing(3),
    maxWidth: '80%',
  },
  msgRight: { alignSelf: 'flex-end' },
  msgLeft: { alignSelf: 'flex-start' },
  bubble: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
  },
  bubbleMe: {
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.sm,
  },
  bubbleThem: {
    borderTopLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
  },
  msgText: { fontSize: 15, fontWeight: '500' },
  inputContainer: {
    padding: spacing(4),
    paddingBottom: Platform.OS === 'ios' ? spacing(8) : spacing(20), // Extra bottom padding for tab bar
    backgroundColor: isDark ? 'rgba(26,26,46,0.95)' : 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  stickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
  },
  stickerBtn: {
    padding: spacing(2),
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing(2),
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing(4),
    paddingTop: spacing(3),
    paddingBottom: spacing(3),
    color: colors.ink,
    fontSize: 15,
    minHeight: 44,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

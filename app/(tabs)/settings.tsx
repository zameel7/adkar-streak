import { ThemedText } from "@/components/ThemedText";
import ThemeContext from "@/context/ThemeContext";
import { schedulePushNotification } from "@/lib/notifications";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Modal, Platform, ScrollView, Share, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Settings = () => {
  const [translation, setTranslation] = useState<boolean>(true);
  const [morningTime, setMorningTime] = useState<Date>(new Date());
  const [eveningTime, setEveningTime] = useState<Date>(new Date());
  const [showMorningPicker, setShowMorningPicker] = useState<boolean>(false);
  const [showEveningPicker, setShowEveningPicker] = useState<boolean>(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const storeData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleSubmitTime = async () => {
    await storeData("morningTime", morningTime.toISOString());
    await storeData("eveningTime", eveningTime.toISOString());
    try {
      await schedulePushNotification();
    } catch (e) {
      console.error("Failed to reschedule notifications:", e);
    }
    Alert.alert("Success", "Notification times have been saved.");
    router.push("/home");
  };

  const handleToggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    toggleTheme(newTheme);
  };

  const onShare = () => {
    Share.share({
      message:
        "Check out this awesome app! \nhttps://play.google.com/store/apps/details?id=com.zameel7.adkarstreak",
    });
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const translations = await AsyncStorage.getItem('translations');
        if (translations) setTranslation(JSON.parse(translations));

        const storedMorningTime = await AsyncStorage.getItem('morningTime');
        if (storedMorningTime) {
          setMorningTime(new Date(storedMorningTime));
        } else {
          const defaultMorningTime = new Date();
          defaultMorningTime.setHours(5, 30, 0, 0);
          setMorningTime(defaultMorningTime);
        }

        const storedEveningTime = await AsyncStorage.getItem('eveningTime');
        if (storedEveningTime) {
          setEveningTime(new Date(storedEveningTime));
        } else {
          const defaultEveningTime = new Date();
          defaultEveningTime.setHours(16, 30, 0, 0);
          setEveningTime(defaultEveningTime);
        }
      } catch (error) {
        console.error('Error fetching details from AsyncStorage:', error);
      }
    };
    getDetails();
  }, []);

  const isDark = theme === 'dark';
  const surface = isDark ? '#0e0e12' : '#ffffff';
  const text = isDark ? '#ffffff' : '#111111';
  const muted = isDark ? '#9aa0a6' : '#6b7280';
  const hairline = isDark ? '#26262d' : '#ececef';
  const accent = '#2196F3';

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={{ fontSize: 34, fontWeight: '700', color: text, letterSpacing: -0.5, marginBottom: 32 }}>
          Settings
        </ThemedText>

        <SectionLabel muted={muted}>Appearance</SectionLabel>
        <Row
          icon={theme === 'dark' ? 'moon' : 'sunny'}
          label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          textColor={text}
          accent={accent}
          onPress={handleToggleTheme}
          trailing={<Ionicons name="chevron-forward" size={18} color={muted} />}
          divider hairline={hairline}
        />
        <Row
          icon="language"
          label="Show Translations"
          textColor={text}
          accent={accent}
          onPress={() => {
            AsyncStorage.setItem('translations', JSON.stringify(!translation));
            setTranslation(!translation);
          }}
          trailing={
            <View style={{
              width: 44,
              height: 26,
              borderRadius: 13,
              backgroundColor: translation ? accent : (isDark ? '#3a3a40' : '#d1d5db'),
              padding: 3,
              justifyContent: 'center',
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#fff',
                alignSelf: translation ? 'flex-end' : 'flex-start',
              }} />
            </View>
          }
          hairline={hairline}
        />

        <SectionLabel muted={muted} top>Notifications</SectionLabel>
        <Row
          icon="sunny"
          label="Morning Time"
          textColor={text}
          accent={accent}
          onPress={() => setShowMorningPicker(true)}
          trailing={
            <ThemedText style={{ fontSize: 16, color: accent, fontWeight: '600' }}>
              {morningTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          }
          divider hairline={hairline}
        />
        <Row
          icon="moon"
          label="Evening Time"
          textColor={text}
          accent={accent}
          onPress={() => setShowEveningPicker(true)}
          trailing={
            <ThemedText style={{ fontSize: 16, color: accent, fontWeight: '600' }}>
              {eveningTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          }
          hairline={hairline}
        />
        <TouchableOpacity
          onPress={handleSubmitTime}
          activeOpacity={0.85}
          style={{
            marginTop: 16,
            backgroundColor: accent,
            borderRadius: 14,
            paddingVertical: 15,
            alignItems: 'center',
          }}
        >
          <ThemedText style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 }}>
            Save Notification Times
          </ThemedText>
        </TouchableOpacity>

        {/* Time picker hosts (logic unchanged) */}
        {Platform.OS === 'android' && showMorningPicker && (
          <DateTimePicker
            value={morningTime}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowMorningPicker(false);
              if (event.type === 'set' && selectedDate) setMorningTime(selectedDate);
            }}
          />
        )}
        {Platform.OS === 'android' && showEveningPicker && (
          <DateTimePicker
            value={eveningTime}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowEveningPicker(false);
              if (event.type === 'set' && selectedDate) setEveningTime(selectedDate);
            }}
          />
        )}
        {Platform.OS === 'ios' && (
          <>
            <IOSPickerModal
              visible={showMorningPicker}
              value={morningTime}
              theme={theme as 'light' | 'dark'}
              onCancel={() => setShowMorningPicker(false)}
              onDone={(d) => { setMorningTime(d); setShowMorningPicker(false); }}
            />
            <IOSPickerModal
              visible={showEveningPicker}
              value={eveningTime}
              theme={theme as 'light' | 'dark'}
              onCancel={() => setShowEveningPicker(false)}
              onDone={(d) => { setEveningTime(d); setShowEveningPicker(false); }}
            />
          </>
        )}

        <SectionLabel muted={muted} top>Share</SectionLabel>
        <Row
          icon="share-social"
          label="Share Adkar Champ"
          textColor={text}
          accent={accent}
          onPress={onShare}
          trailing={<Ionicons name="chevron-forward" size={18} color={muted} />}
          hairline={hairline}
        />
      </ScrollView>
    </View>
  );
};

type SectionLabelProps = { children: React.ReactNode; muted: string; top?: boolean };
const SectionLabel: React.FC<SectionLabelProps> = ({ children, muted, top }) => (
  <ThemedText style={{
    fontSize: 12,
    color: muted,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: top ? 32 : 0,
    marginBottom: 8,
  }}>
    {children}
  </ThemedText>
);

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  textColor: string;
  accent: string;
  hairline: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  divider?: boolean;
};
const Row: React.FC<RowProps> = ({ icon, label, textColor, accent, hairline, trailing, onPress, divider }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.6}
    style={{
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: hairline,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: accent + '1F',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <ThemedText style={{ fontSize: 16, color: textColor, fontWeight: '500' }}>
        {label}
      </ThemedText>
    </View>
    {trailing}
  </TouchableOpacity>
);

type IOSPickerModalProps = {
  visible: boolean;
  value: Date;
  theme: 'light' | 'dark';
  onDone: (d: Date) => void;
  onCancel: () => void;
};

const IOSPickerModal: React.FC<IOSPickerModalProps> = ({
  visible,
  value,
  theme,
  onDone,
  onCancel,
}) => {
  // Maintain a draft so the wheel can spin without committing until "Done".
  const [draft, setDraft] = useState<Date>(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const isDark = theme === 'dark';
  const sheetBg = isDark ? '#1f1f23' : '#ffffff';
  const barBg = isDark ? '#2a2a2e' : '#f2f2f7';
  const textColor = isDark ? '#ffffff' : '#111';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{ backgroundColor: sheetBg, paddingBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: barBg,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <TouchableOpacity onPress={onCancel}>
                <ThemedText style={{ color: '#2196F3', fontSize: 16 }}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
                Select Time
              </ThemedText>
              <TouchableOpacity onPress={() => onDone(draft)}>
                <ThemedText style={{ color: '#2196F3', fontSize: 16, fontWeight: '700' }}>
                  Done
                </ThemedText>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={draft}
              mode="time"
              is24Hour
              display="spinner"
              themeVariant={isDark ? 'dark' : 'light'}
              onChange={(_event, selectedDate) => {
                if (selectedDate) setDraft(selectedDate);
              }}
              style={{ backgroundColor: sheetBg }}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default Settings;
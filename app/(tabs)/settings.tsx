import React, { useContext, useEffect, useState } from "react";
import { Alert, Share, View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeContext from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const [name, setName] = useState<string>("");
  const [translation, setTranslation] = useState<boolean>(true);
  const [morningTime, setMorningTime] = useState<Date>(new Date());
  const [eveningTime, setEveningTime] = useState<Date>(new Date());
  const [showMorningPicker, setShowMorningPicker] = useState<boolean>(false);
  const [showEveningPicker, setShowEveningPicker] = useState<boolean>(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { signOut, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const storeData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleSubmitName = async () => {
    if (name.trim()) {
      await storeData("name", name.trim());
      Alert.alert("Success", "Name has been saved! Pull down to refresh.");
      router.push("/home");
    } else {
      Alert.alert("Please enter your name");
    }
  };

  const handleSubmitTime = async () => {
    await storeData("morningTime", morningTime.toISOString());
    await storeData("eveningTime", eveningTime.toISOString());
    Alert.alert(
      "Success",
      "Notification time has been saved! Pull down to refresh."
    );
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

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut!();
          }
        }
      ]
    );
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const storedName = await AsyncStorage.getItem('name');
        if (storedName) setName(storedName);

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

  return (
    <LinearGradient
      colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#ffffff', '#f8f9fa']}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: insets.top + 20,
          paddingBottom: 100 + insets.bottom
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          marginBottom: 32,
          alignItems: 'center',
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
        }}>
          <Ionicons
            name="settings"
            size={40}
            color="#2196F3"
            style={{ marginBottom: 12 }}
          />
          <ThemedText style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme === 'dark' ? '#ffffff' : '#333'
          }}>
            Settings
          </ThemedText>
        </View>

        {/* Profile Section */}
        <View style={{
          marginBottom: 32,
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="person" size={24} color="#2196F3" style={{ marginRight: 12 }} />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ffffff' : '#333'
            }}>
              Profile
            </ThemedText>
          </View>

          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{
              fontSize: 16,
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#666',
              marginBottom: 8
            }}>
              What should we call you?
            </ThemedText>
            <TextInput
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0',
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: theme === 'dark' ? '#ffffff' : '#333'
              }}
              placeholder={name || "Your Name"}
              placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#999'}
              value={name}
              onChangeText={setName}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmitName}
            style={{
              backgroundColor: '#2196F3',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center'
            }}
          >
            <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              Save Name
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={{
          marginBottom: 32,
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="color-palette" size={24} color="#2196F3" style={{ marginRight: 12 }} />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ffffff' : '#333'
            }}>
              Appearance
            </ThemedText>
          </View>

          <TouchableOpacity
            onPress={handleToggleTheme}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0',
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={theme === "dark" ? "moon" : "sunny"} size={24} color="#2196F3" style={{ marginRight: 12 }} />
              <ThemedText style={{
                fontSize: 16,
                color: theme === 'dark' ? '#ffffff' : '#333',
                fontWeight: '600'
              }}>
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#999'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              AsyncStorage.setItem("translations", JSON.stringify(!translation));
              setTranslation(!translation);
            }}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0',
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={translation ? "checkmark-outline" : "close-outline"} size={24} color="#2196F3" style={{ marginRight: 12 }} />
              <ThemedText style={{
                fontSize: 16,
                color: theme === 'dark' ? '#ffffff' : '#333',
                fontWeight: '600'
              }}>
                Show Translations
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: translation ? '#2196F3' : '#ccc',
              borderRadius: 12,
              width: 24,
              height: 24,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name={translation ? "checkmark" : "close"} size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Notification Section */}
        <View style={{
          marginBottom: 32,
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="notifications" size={24} color="#2196F3" style={{ marginRight: 12 }} />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ffffff' : '#333'
            }}>
              Notification Time
            </ThemedText>
          </View>

          {/* Morning Time */}
          <TouchableOpacity
            onPress={() => setShowMorningPicker(true)}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0',
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sunny" size={20} color="#2196F3" style={{ marginRight: 12 }} />
              <ThemedText style={{
                fontSize: 16,
                color: theme === 'dark' ? '#ffffff' : '#333',
                fontWeight: '600'
              }}>
                Morning Time
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 16, color: '#2196F3', fontWeight: 'bold' }}>
              {morningTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </TouchableOpacity>

          {/* Evening Time */}
          <TouchableOpacity
            onPress={() => setShowEveningPicker(true)}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0',
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="moon" size={20} color="#2196F3" style={{ marginRight: 12 }} />
              <ThemedText style={{
                fontSize: 16,
                color: theme === 'dark' ? '#ffffff' : '#333',
                fontWeight: '600'
              }}>
                Evening Time
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 16, color: '#2196F3', fontWeight: 'bold' }}>
              {eveningTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmitTime}
            style={{
              backgroundColor: '#2196F3',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center'
            }}
          >
            <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              Save Notification Times
            </ThemedText>
          </TouchableOpacity>

          {/* Time Pickers */}
          {showMorningPicker && (
            <DateTimePicker
              value={morningTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                setShowMorningPicker(false);
                if (selectedDate) setMorningTime(selectedDate);
              }}
            />
          )}

          {showEveningPicker && (
            <DateTimePicker
              value={eveningTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                setShowEveningPicker(false);
                if (selectedDate) setEveningTime(selectedDate);
              }}
            />
          )}
        </View>

        {/* Account Section */}
        <View style={{
          marginBottom: 32,
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="person-circle" size={24} color="#2196F3" style={{ marginRight: 12 }} />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ffffff' : '#333'
            }}>
              Account
            </ThemedText>
          </View>

          {/* Email Display */}
          <View style={{
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0',
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="mail" size={20} color="#2196F3" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <ThemedText style={{
                  fontSize: 14,
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#666',
                  marginBottom: 4
                }}>
                  Email Address
                </ThemedText>
                <ThemedText style={{
                  fontSize: 16,
                  color: theme === 'dark' ? '#ffffff' : '#333',
                  fontWeight: '600'
                }}>
                  {user?.email || 'No email found'}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#f44336',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              Sign Out
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Share Section */}
        <View style={{
          marginBottom: 32,
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="share-social" size={24} color="#2196F3" style={{ marginRight: 12 }} />
            <ThemedText style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ffffff' : '#333'
            }}>
              Share App
            </ThemedText>
          </View>

          <TouchableOpacity
            onPress={onShare}
            style={{
              backgroundColor: '#2196F3',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center'
            }}
          >
            <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              Share Adkar Champ
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Settings;
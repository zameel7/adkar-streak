import React, { useContext } from "react";
import { Linking, ScrollView, View, TouchableOpacity } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Application from "expo-application";
import { ExternalLink } from "@/components/ExternalLink";
import {
  GlassCard,
  GlassButton,
  GlassText,
  GlassView
} from "@/components/glass";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeContext from "@/context/ThemeContext";

const About = () => {
  const { theme } = useContext(ThemeContext);
  const appVersion = Application.nativeApplicationVersion || "3.0.1";
  const insets = useSafeAreaInsets();


  const handleGitHub = () => {
    Linking.openURL("https://github.com/zameel7/adkar-streak");
  };

  return (
    <SafeAreaProvider>
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
            borderWidth: theme === 'dark' ? 1 : 1,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
          }}>
            <Ionicons
              name="person-circle-outline"
              size={80}
              color="#2196F3"
              style={{ marginBottom: 16 }}
            />
            <ThemedText style={{
              fontSize: 28,
              fontWeight: 'bold',
              textAlign: 'center',
              color: theme === 'dark' ? '#ffffff' : '#333'
            }}>
              About Adkar Champ
            </ThemedText>
          </View>

          {/* App Description */}
          <View style={{
            marginBottom: 32,
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
          }}>
            <ThemedText style={{
              fontSize: 22,
              fontWeight: 'bold',
              textAlign: 'center',
              color: theme === 'dark' ? '#ffffff' : '#333',
              marginBottom: 20
            }}>
              Welcome to Adkar Champ!
            </ThemedText>

            <ThemedText style={{
              fontSize: 18,
              lineHeight: 28,
              textAlign: 'center',
              marginBottom: 20,
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#666'
            }}>
              This app is designed to help you remember Allah and keep track of your daily adkar.
              We also have streaks to keep you motivated.
            </ThemedText>

            <ThemedText style={{
              fontSize: 18,
              lineHeight: 28,
              textAlign: 'center',
              marginBottom: 24,
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#666'
            }}>
              If you have any feedback or suggestions, please feel free to contact me.
            </ThemedText>

            <View style={{
              backgroundColor: theme === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(33, 150, 243, 0.3)'
            }}>
              <ThemedText style={{
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#2196F3'
              }}>
                Jazakallah Khair!
              </ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{
            marginBottom: 32,
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Ionicons name="people" size={24} color="#2196F3" style={{ marginRight: 8 }} />
              <ThemedText style={{
                fontSize: 22,
                fontWeight: 'bold',
                textAlign: 'center',
                color: theme === 'dark' ? '#ffffff' : '#333'
              }}>
                Support & Connect
              </ThemedText>
            </View>

            <View style={{ gap: 16 }}>
              <TouchableOpacity
                onPress={handleGitHub}
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: '#2196F3',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: 'center'
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="logo-github" size={24} color="#2196F3" style={{ marginRight: 8 }} />
                  <ThemedText style={{ color: '#2196F3', fontSize: 16, fontWeight: 'bold' }}>
                    View on GitHub
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Information */}
          <View style={{
            marginBottom: 32,
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Ionicons name="information-circle" size={24} color="#2196F3" style={{ marginRight: 12 }} />
              <ThemedText style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: theme === 'dark' ? '#ffffff' : '#333'
              }}>
                App Information
              </ThemedText>
            </View>

            {/* Version */}
            <View style={{
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
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="code-working" size={20} color="#2196F3" style={{ marginRight: 12 }} />
                <ThemedText style={{
                  fontSize: 16,
                  color: theme === 'dark' ? '#ffffff' : '#333',
                  fontWeight: '600'
                }}>
                  Version
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 16, color: '#2196F3', fontWeight: 'bold' }}>
                {appVersion}
              </ThemedText>
            </View>

            {/* Privacy Policy */}
            <TouchableOpacity
              onPress={() => {
                // Add privacy policy link functionality here
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
                <Ionicons name="shield-checkmark" size={20} color="#2196F3" style={{ marginRight: 12 }} />
                <ThemedText style={{
                  fontSize: 16,
                  color: theme === 'dark' ? '#ffffff' : '#333',
                  fontWeight: '600'
                }}>
                  Privacy Policy
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

export default About;
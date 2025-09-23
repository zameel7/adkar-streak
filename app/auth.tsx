import { ThemedText } from '@/components/ThemedText'
import { useAuth } from '@/context/AuthContext'
import ThemeContext from '@/context/ThemeContext'
import Ionicons from '@expo/vector-icons/Ionicons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useContext, useState } from 'react'
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, signUp, loading } = useAuth()
  const { theme } = useContext(ThemeContext)

  const handleAuthentication = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long')
      return
    }

    const { error } = isSignUp
      ? await signUp!(email, password)
      : await signIn!(email, password)

    if (error) {
      Alert.alert('Authentication Error', error.message)
    } else if (isSignUp) {
      Alert.alert(
        'Sign Up Successful',
        'Please check your email to verify your account before signing in.'
      )
      setIsSignUp(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#ffffff', '#f8f9fa']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={theme === 'dark' ? require('@/assets/images/icon.png') : require('@/assets/images/icon-dark.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <ThemedText style={styles.title}>Adkar Champ</ThemedText>
              <ThemedText style={styles.subtitle}>
                Track your daily Islamic remembrances
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <ThemedText style={styles.formTitle}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </ThemedText>

              {/* Email Input */}
              <View style={[
                styles.inputContainer,
                { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0' }
              ]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#666'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: theme === 'dark' ? '#ffffff' : '#333' }
                  ]}
                  placeholder="Email address"
                  placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#999'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              {/* Password Input */}
              <View style={[
                styles.inputContainer,
                { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0' }
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#666'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { color: theme === 'dark' ? '#ffffff' : '#333' }
                  ]}
                  placeholder="Password"
                  placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#666'}
                  />
                </TouchableOpacity>
              </View>

              {/* Auth Button */}
              <TouchableOpacity
                style={[styles.authButton, loading && styles.authButtonDisabled]}
                onPress={handleAuthentication}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.authButtonGradient}
                >
                  {loading ? (
                    <ThemedText style={styles.authButtonText}>Loading...</ThemedText>
                  ) : (
                    <ThemedText style={styles.authButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </ThemedText>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Toggle Sign Up / Sign In */}
              <View style={styles.toggleContainer}>
                <ThemedText style={styles.toggleText}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </ThemedText>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                  <ThemedText style={styles.toggleLink}>
                    {isSignUp ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Islamic Quote */}
            <View style={styles.quote}>
              <ThemedText style={styles.quoteText}>
                "Remember Allah often and He will remember you"
              </ThemedText>
              <ThemedText style={styles.quoteAuthor}>
                - Hadith
              </ThemedText>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    color: '#666',
  },
  form: {
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  authButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
  },
  toggleText: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.8,
  },
  toggleLink: {
    fontSize: 16,
    color: '#2196F3',
    // fontWeight: 'bold',
  },
  quote: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  quoteAuthor: {
    fontSize: 14,
    opacity: 0.6,
  },
})
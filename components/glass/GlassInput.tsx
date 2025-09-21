import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { GlassView } from './GlassView';
import { GlassText } from './GlassText';

export interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  intensity?: number;
  glassStyle?: 'light' | 'medium' | 'strong';
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  intensity = 10,
  glassStyle = 'light',
  style,
  ...props
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <GlassText
          variant="caption"
          color="white"
          style={{ marginBottom: 8, fontWeight: '600' }}
        >
          {label}
        </GlassText>
      )}

      <GlassView
        intensity={intensity}
        glassStyle={glassStyle}
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <TextInput
          style={[
            {
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: 'white',
              fontSize: 16,
            },
            style,
          ]}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          {...props}
        />
      </GlassView>

      {error && (
        <GlassText
          variant="caption"
          color="secondary"
          style={{ marginTop: 4, marginLeft: 4 }}
        >
          {error}
        </GlassText>
      )}
    </View>
  );
};
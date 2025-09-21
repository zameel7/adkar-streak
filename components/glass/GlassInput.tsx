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
  className,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && (
        <GlassText
          variant="caption"
          color="white"
          className="mb-2 font-semibold"
        >
          {label}
        </GlassText>
      )}

      <GlassView
        intensity={intensity}
        glassStyle={glassStyle}
        className="rounded-xl overflow-hidden"
      >
        <TextInput
          className={`px-4 py-3 text-white text-base ${className || ''}`}
          style={[
            {
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
          className="mt-1 ml-1"
        >
          {error}
        </GlassText>
      )}
    </View>
  );
};
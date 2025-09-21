import React from 'react';
import { Switch, SwitchProps, View } from 'react-native';
import { GlassView } from './GlassView';
import { GlassText } from './GlassText';

export interface GlassSwitchProps extends SwitchProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  intensity?: number;
  glassStyle?: 'light' | 'medium' | 'strong';
}

export const GlassSwitch: React.FC<GlassSwitchProps> = ({
  label,
  leftIcon,
  rightIcon,
  intensity = 10,
  glassStyle = 'light',
  ...props
}) => {
  return (
    <GlassView
      intensity={intensity}
      glassStyle={glassStyle}
      style={{ padding: 16, borderRadius: 12, marginBottom: 12 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {label && (
          <GlassText
            color="white"
            style={{ flex: 1, fontWeight: '500' }}
          >
            {label}
          </GlassText>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftIcon && (
            <View style={{ marginRight: 12 }}>
              {leftIcon}
            </View>
          )}

          <Switch
            trackColor={{
              false: 'rgba(255, 255, 255, 0.3)',
              true: '#61B553',
            }}
            thumbColor={props.value ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="rgba(255, 255, 255, 0.3)"
            {...props}
          />

          {rightIcon && (
            <View style={{ marginLeft: 12 }}>
              {rightIcon}
            </View>
          )}
        </View>
      </View>
    </GlassView>
  );
};
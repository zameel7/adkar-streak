import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { GlassText } from './GlassText';
import { GlassView } from './GlassView';

export interface GlassButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  glassIntensity?: number;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  glassIntensity = 10,
  style,
  ...props
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 16, paddingVertical: 8 };
      case 'large':
        return { paddingHorizontal: 32, paddingVertical: 16 };
      default:
        return { paddingHorizontal: 24, paddingVertical: 12 };
    }
  };

  const getVariantGlassStyle = () => {
    switch (variant) {
      case 'primary':
        return 'strong';
      case 'secondary':
        return 'medium';
      case 'outline':
        return 'light';
      case 'ghost':
        return 'light';
      default:
        return 'medium';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return 'white';
      case 'outline':
        return 'primary';
      case 'ghost':
        return 'muted';
      default:
        return 'white';
    }
  };

  return (
    <TouchableOpacity style={style} {...props}>
      <GlassView
        intensity={glassIntensity}
        glassStyle={getVariantGlassStyle()}
        style={[
          getSizeStyles(),
          {
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center'
          }
        ]}
      >
        <GlassText
          variant="default"
          color={getTextColor()}
          style={{ fontWeight: '600' }}
        >
          {title}
        </GlassText>
      </GlassView>
    </TouchableOpacity>
  );
};
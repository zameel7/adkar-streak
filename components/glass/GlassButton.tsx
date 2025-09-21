import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { GlassView } from './GlassView';
import { GlassText } from './GlassText';

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
        return 'px-4 py-2';
      case 'large':
        return 'px-8 py-4';
      default:
        return 'px-6 py-3';
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
        className={`${getSizeStyles()} rounded-xl items-center justify-center`}
      >
        <GlassText
          variant="default"
          color={getTextColor()}
          className="font-semibold"
        >
          {title}
        </GlassText>
      </GlassView>
    </TouchableOpacity>
  );
};
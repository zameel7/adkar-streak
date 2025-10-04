declare module 'react-native-progress/Bar' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface ProgressBarProps {
    progress?: number;
    width?: number | null;
    height?: number;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    unfilledColor?: string;
    style?: ViewStyle;
  }

  export default class ProgressBar extends Component<ProgressBarProps> {}
}


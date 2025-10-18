import { useContext, useMemo, useRef, useEffect } from "react";
import { TouchableOpacity, Text, Animated, useWindowDimensions } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { Styles } from "../styles/GlobalStyles";

interface ButtonProps {
  onPress: () => void;
  title: string;
  isAccent?: boolean;
  isUtility?: boolean;
  span?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function Button({ title, onPress, isAccent, isUtility, span }: ButtonProps) {
  const theme = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const isTablet = width >= 768;
  const scale = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle shimmer animation for glass effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const buttonSizeStyle = useMemo(
    () => ({
      height: isTablet ? 82 : isSmallScreen ? 66 : 76,
      borderRadius: isTablet ? 30 : isSmallScreen ? 22 : 26,
      marginHorizontal: isTablet ? 8 : isSmallScreen ? 4 : 6,
    }),
    [isTablet, isSmallScreen],
  );

  const textResponsiveStyle = useMemo(
    () => ({
      fontSize: isTablet ? 34 : isSmallScreen ? 26 : 30,
    }),
    [isTablet, isSmallScreen],
  );

  const animatePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      tension: 250,
      friction: 15,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 250,
      friction: 13,
      useNativeDriver: true,
    }).start();
  };

  const baseStyle = [
    Styles.buttonBase,
    span ? Styles.buttonDouble : Styles.buttonSingle,
    isAccent
      ? Styles.buttonAccent
      : isUtility
      ? theme === "dark"
        ? Styles.buttonUtilityDark
        : Styles.buttonUtilityLight
      : theme === "dark"
      ? Styles.buttonPrimaryDark
      : Styles.buttonPrimaryLight,
  ];

  const textStyle = [
    Styles.buttonText,
    isAccent
      ? Styles.buttonTextAccent
      : isUtility
      ? theme === "dark"
        ? Styles.buttonTextUtilityDark
        : Styles.buttonTextUtility
      : theme === "dark"
      ? Styles.buttonTextPrimaryDark
      : Styles.buttonTextPrimaryLight,
  ];

  return (
    <AnimatedTouchableOpacity
      style={[...baseStyle, buttonSizeStyle, { transform: [{ scale }] }]}
      activeOpacity={0.85}
      onPressIn={animatePressIn}
      onPressOut={animatePressOut}
      onPress={onPress}
    >
      <Text style={[...textStyle, textResponsiveStyle]}>{title}</Text>
    </AnimatedTouchableOpacity>
  );
}

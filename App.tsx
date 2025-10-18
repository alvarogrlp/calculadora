import { useState, useEffect, useRef, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { myColors } from './src/styles/Colors';
import { ThemeContext } from './src/context/ThemeContext';
import MyKeyboard from './src/components/MyKeyboard';
import SplitExpensesCalculator from './src/components/SplitExpensesCalculator';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CalculatorMode = 'normal' | 'splitExpenses';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('normal');
  const [isModeMenuVisible, setIsModeMenuVisible] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);

  // Valores animados para el efecto de burbuja y transiciones
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentScale = useRef(new Animated.Value(1)).current;

  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isModeMenuVisible) {
      if (!isMenuMounted) {
        setIsMenuMounted(true);
      }

      Animated.parallel([
        Animated.spring(bubbleScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isMenuMounted) {
      Animated.parallel([
        Animated.timing(bubbleScale, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsMenuMounted(false);
        }
      });
    }
  }, [isModeMenuVisible, isMenuMounted, bubbleScale, bubbleOpacity, overlayOpacity]);

  const modeButtonScale = useRef(new Animated.Value(1)).current;
  const themeButtonScale = useRef(new Animated.Value(1)).current;

  const animatePressIn = (value: Animated.Value) => {
    Animated.spring(value, {
      toValue: 0.94,
      tension: 220,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = (value: Animated.Value) => {
    Animated.spring(value, {
      toValue: 1,
      tension: 220,
      friction: 14,
      useNativeDriver: true,
    }).start();
  };

  const overlayBackgroundColor = isDark ? 'rgba(5, 6, 10, 0.55)' : 'rgba(230, 235, 255, 0.45)';

  const shellResponsiveStyle = useMemo(() => {
    if (isTablet) {
      return {
        width: isLandscape ? '72%' : '80%',
        maxWidth: 560,
        padding: 26,
        paddingTop: 34,
        borderRadius: 50,
      };
    }

    if (isSmallScreen) {
      return {
        padding: 14,
        paddingTop: 20,
        borderRadius: 34,
      };
    }

    if (isLandscape) {
      return {
        width: '85%',
      };
    }

    return {};
  }, [isTablet, isSmallScreen, isLandscape]);

  const headerResponsiveStyle = useMemo(
    () => ({
      paddingBottom: isSmallScreen ? 14 : 20,
      marginBottom: isSmallScreen ? 4 : 8,
    }),
    [isSmallScreen],
  );

  const headerButtonResponsiveStyle = useMemo(
    () => ({
      paddingHorizontal: isTablet ? 24 : isSmallScreen ? 16 : 20,
      paddingVertical: isTablet ? 12 : isSmallScreen ? 8 : 10,
      minWidth: isTablet ? 120 : isSmallScreen ? 78 : 90,
      borderRadius: isTablet ? 32 : isSmallScreen ? 24 : 28,
    }),
    [isSmallScreen, isTablet],
  );

  const toggleSwitchResponsiveStyle = useMemo(
    () => ({
      transform: [{ scale: isTablet ? 1 : isSmallScreen ? 0.78 : 0.85 }],
    }),
    [isSmallScreen, isTablet],
  );

  const modeMenuResponsiveStyle = useMemo(
    () => ({
      top: isTablet ? 84 : isSmallScreen ? 66 : 70,
      left: isSmallScreen ? 16 : 26,
      minWidth: isTablet ? 240 : 200,
    }),
    [isSmallScreen, isTablet],
  );

  const splitContentResponsiveStyle = useMemo(
    () => ({
      paddingHorizontal: isTablet ? 4 : 0,
      paddingBottom: isSmallScreen ? 8 : 0,
    }),
    [isTablet, isSmallScreen],
  );

  const menuTranslateY = bubbleScale.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
  });

  const menuScale = bubbleScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  const toggleModeMenu = () => setIsModeMenuVisible((prev) => !prev);

  const animateModeChange = (mode: CalculatorMode) => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 0.96,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCalculatorMode(mode);

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: 1,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleModeSelect = (mode: CalculatorMode) => {
    if (mode !== calculatorMode) {
      animateModeChange(mode);
    }

    setIsModeMenuVisible(false);
  };

  return (
    <ThemeContext.Provider value={theme}>
      <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <View style={styles.glowContainer}>
          <View style={styles.primaryGlow} />
          <View style={styles.accentGlow} />
        </View>

        <View
          style={[
            styles.calculatorShell,
            isDark ? styles.calculatorShellDark : styles.calculatorShellLight,
            shellResponsiveStyle,
          ]}
        >
          {/* Header con botones simetricos */}
          <View style={[styles.headerInside, headerResponsiveStyle]}>
            {/* Boton de Modo (izquierda) */}
            <AnimatedTouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.headerButton,
                isDark ? styles.headerButtonDark : styles.headerButtonLight,
                headerButtonResponsiveStyle,
                { transform: [{ scale: modeButtonScale }] },
              ]}
              onPress={toggleModeMenu}
              onPressIn={() => animatePressIn(modeButtonScale)}
              onPressOut={() => animatePressOut(modeButtonScale)}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  isDark ? styles.headerButtonTextDark : styles.headerButtonTextLight,
                ]}
              >
                Modo
              </Text>
            </AnimatedTouchableOpacity>

            {/* Boton de Tema (derecha) */}
            <AnimatedTouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.headerButton,
                isDark ? styles.headerButtonDark : styles.headerButtonLight,
                headerButtonResponsiveStyle,
                { transform: [{ scale: themeButtonScale }] },
              ]}
              onPress={() => setTheme(isDark ? 'light' : 'dark')}
              onPressIn={() => animatePressIn(themeButtonScale)}
              onPressOut={() => animatePressOut(themeButtonScale)}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  isDark ? styles.headerButtonTextDark : styles.headerButtonTextLight,
                ]}
              >
                {isDark ? 'Oscuro' : 'Claro'}
              </Text>
            </AnimatedTouchableOpacity>
          </View>

          {/* Overlay para cerrar el menu al hacer clic fuera */}
          {isMenuMounted && (
            <AnimatedPressable
              style={[
                styles.menuOverlay,
                { opacity: overlayOpacity, backgroundColor: overlayBackgroundColor },
              ]}
              onPress={() => setIsModeMenuVisible(false)}
            />
          )}

          {/* Menu desplegable de Modo con animacion de burbuja */}
          {isMenuMounted && (
            <BlurView
              intensity={Platform.OS === 'ios' ? 9 : 9}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.modeMenu,
                isDark ? styles.modeMenuDark : styles.modeMenuLight,
                modeMenuResponsiveStyle,
              ]}
            >
              <Animated.View
                style={{
                  opacity: bubbleOpacity,
                  transform: [{ translateY: menuTranslateY }, { scale: menuScale }],
                }}
              >
                <TouchableOpacity
                  style={styles.modeMenuItem}
                  onPress={() => handleModeSelect('normal')}
                >
                  <View style={styles.modeMenuItemContent}>
                    <Text
                      style={[
                        styles.modeMenuText,
                        isDark ? styles.modeMenuTextDark : styles.modeMenuTextLight,
                      ]}
                    >
                      Calculadora Normal
                    </Text>
                    {calculatorMode === 'normal' && (
                      <View style={styles.activeIndicator} />
                    )}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.modeMenuItem}
                  onPress={() => handleModeSelect('splitExpenses')}
                >
                  <View style={styles.modeMenuItemContent}>
                    <Text
                      style={[
                        styles.modeMenuText,
                        isDark ? styles.modeMenuTextDark : styles.modeMenuTextLight,
                      ]}
                    >
                      Dividir Gastos
                    </Text>
                    {calculatorMode === 'splitExpenses' && (
                      <View style={styles.activeIndicator} />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </BlurView>
          )}

          {/* Contenido dinamico segun el modo */}
          <Animated.View
            style={[
              styles.modeContentWrapper,
              { opacity: contentOpacity, transform: [{ scale: contentScale }] },
            ]}
          >
            {calculatorMode === 'normal' ? (
              <MyKeyboard />
            ) : (
              <View style={[styles.splitExpensesContent, splitContentResponsiveStyle]}>
                <SplitExpensesCalculator />
              </View>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? 55 : 0,
    paddingBottom: Platform.OS === 'android' ? 25 : 0,
    position: 'relative',
  },
  containerLight: {
    backgroundColor: '#E6EBFF',
  },
  containerDark: {
    backgroundColor: '#05060A',
  },
  glowContainer: {
    position: 'absolute',
    top: -120,
    left: -50,
    right: -50,
    height: 380,
  },
  primaryGlow: {
    position: 'absolute',
    top: 80,
    left: 0,
    width: 280,
    height: 280,
    borderRadius: 200,
    backgroundColor: 'rgba(100, 120, 255, 0.35)',
    opacity: 0.75,
  },
  accentGlow: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 220,
    height: 220,
    borderRadius: 180,
    backgroundColor: 'rgba(255, 149, 0, 0.3)',
    opacity: 0.7,
  },
  calculatorShell: {
    flex: 1,
    width: '95%',
    maxWidth: 420,
    borderRadius: 44,
    padding: 20,
    paddingTop: 26,
    borderWidth: 1.5,
    shadowOpacity: 0.3,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 30 },
    elevation: 15,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  calculatorShellLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(200, 210, 230, 0.45)',
    shadowColor: 'rgba(100, 120, 200, 0.3)',
  },
  calculatorShellDark: {
    backgroundColor: 'rgba(25, 27, 38, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: 'rgba(0, 0, 0, 0.6)',
  },
  headerInside: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 20,
    marginBottom: 8,
    width: '100%',
    zIndex: 100,
  },
  headerButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 90,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(200, 210, 230, 0.5)',
    shadowColor: 'rgba(100, 120, 200, 0.3)',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 15 },
    elevation: 8,
  },
  headerButtonDark: {
    backgroundColor: 'rgba(50, 52, 65, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  headerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerButtonTextLight: {
    color: '#1C1D29',
  },
  headerButtonTextDark: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 70,
  },
  toggleSwitch: {
    alignSelf: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  modeMenuContainer: {
    position: 'absolute',
    top: 60,
    left: 26,
    zIndex: 1000,
  },
  modeMenu: {
    position: 'absolute',
    top: 70,
    left: 26,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 8,
    minWidth: 200,
    overflow: 'hidden',
    zIndex: 1000,
  },
  modeMenuLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(180, 190, 220, 0.4)',
    shadowColor: 'rgba(100, 120, 200, 0.35)',
    shadowOpacity: 0.4,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  modeMenuDark: {
    backgroundColor: 'rgba(30, 32, 45, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 9,
  },
  modeMenuItem: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  modeMenuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeMenuText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  modeMenuTextLight: {
    color: '#1C1D29',
  },
  modeMenuTextDark: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: myColors.accent,
    marginLeft: 12,
  },
  splitExpensesContent: {
    flex: 1,
  },
  modeContentWrapper: {
    flex: 1,
    width: '100%',
  },
});


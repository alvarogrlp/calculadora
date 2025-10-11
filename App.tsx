import { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, View, TouchableOpacity, Platform, Pressable, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { myColors } from './src/styles/Colors';
import { ThemeContext } from './src/context/ThemeContext';
import MyKeyboard from './src/components/MyKeyboard';
import SplitExpensesCalculator from './src/components/SplitExpensesCalculator';

type CalculatorMode = 'normal' | 'splitExpenses';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('normal');
  const [showModeMenu, setShowModeMenu] = useState(false);
  
  // Valores animados para el efecto de burbuja
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  const isDark = theme === 'dark';

  useEffect(() => {
    if (showModeMenu) {
      // Animar la burbuja inflándose
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
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar la burbuja desinflándose
      Animated.parallel([
        Animated.timing(bubbleScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showModeMenu]);

  const handleModeSelect = (mode: CalculatorMode) => {
    setCalculatorMode(mode);
    setShowModeMenu(false);
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
          ]}
        >
          {/* Header con botones simétricos */}
          <View style={styles.headerInside}>
            {/* Botón de Modo (izquierda) */}
            <TouchableOpacity
              style={[
                styles.headerButton,
                isDark ? styles.headerButtonDark : styles.headerButtonLight,
              ]}
              onPress={() => setShowModeMenu(!showModeMenu)}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  isDark ? styles.headerButtonTextDark : styles.headerButtonTextLight,
                ]}
              >
                Modo
              </Text>
            </TouchableOpacity>

            {/* Botón de Tema (derecha) */}
            <View
              style={[
                styles.headerButton,
                styles.themeButton,
                isDark ? styles.headerButtonDark : styles.headerButtonLight,
              ]}
            >
              <Switch
                value={isDark}
                onValueChange={() => setTheme(isDark ? 'light' : 'dark')}
                thumbColor={isDark ? myColors.white : myColors.black}
                trackColor={{
                  false: 'rgba(40, 42, 55, 0.35)',
                  true: 'rgba(255, 149, 0, 0.55)',
                }}
                ios_backgroundColor="rgba(40, 42, 55, 0.35)"
                style={styles.toggleSwitch}
              />
            </View>
          </View>

          {/* Overlay para cerrar el menú al hacer clic fuera */}
          {showModeMenu && (
            <Pressable 
              style={styles.menuOverlay}
              onPress={() => setShowModeMenu(false)}
            />
          )}

          {/* Menú desplegable de Modo con animación de burbuja */}
          {showModeMenu && (
            <BlurView
              intensity={Platform.OS === 'ios' ? 9 : 9}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.modeMenu,
                isDark ? styles.modeMenuDark : styles.modeMenuLight,
              ]}
            >
              <Animated.View
                style={{
                  opacity: bubbleOpacity,
                  transform: [
                    { 
                      scaleY: bubbleScale.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      })
                    }
                  ],
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

          {/* Contenido dinámico según el modo */}
          {calculatorMode === 'normal' ? (
            <MyKeyboard />
          ) : (
            <View style={styles.splitExpensesContent}>
              <SplitExpensesCalculator />
            </View>
          )}
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
    paddingTop: 0,
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
    width: 260,
    height: 260,
    borderRadius: 180,
    backgroundColor: 'rgba(84, 102, 255, 0.28)',
    opacity: 0.85,
  },
  accentGlow: {
    position: 'absolute',
    right: 20,
    top: 0,
    width: 220,
    height: 220,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 149, 0, 0.22)',
    opacity: 0.75,
  },
  calculatorShell: {
    flex: 1,
    width: '95%',
    maxWidth: 420,
    borderRadius: 40,
    padding: 18,
    paddingTop: 24,
    borderWidth: 1,
    shadowOpacity: 0.22,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 25 },
    elevation: 12,
    marginHorizontal: 10,
  },
  calculatorShellLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderColor: 'rgba(160, 165, 180, 0.35)',
    shadowColor: 'rgba(72, 92, 200, 0.25)',
  },
  calculatorShellDark: {
    backgroundColor: 'rgba(19, 20, 28, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: 'rgba(0, 0, 0, 0.45)',
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
    paddingVertical: 10,
    borderRadius: 28,
    borderWidth: 1,
    minWidth: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(160, 165, 180, 0.4)',
    shadowColor: 'rgba(118, 132, 220, 0.25)',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  headerButtonDark: {
    backgroundColor: 'rgba(25, 27, 38, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: 'rgba(0, 0, 0, 0.35)',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
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
    transform: [{ scale: 0.85 }],
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(140, 145, 160, 0.3)',
    shadowColor: 'rgba(118, 132, 220, 0.3)',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 15 },
    elevation: 8,
  },
  modeMenuDark: {
    backgroundColor: 'rgba(25, 27, 38, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
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
});

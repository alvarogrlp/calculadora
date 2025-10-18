import * as React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  SafeAreaView,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { myColors } from "../styles/Colors";

type Expense = {
  id: string;
  title: string;
  amount: number;
  tipAmount: number;
};

export default function SplitExpensesCalculator() {
  const theme = React.useContext(ThemeContext);
  const isDark = theme === "dark";
  const blurTint = isDark ? "dark" : "light";
  const blurIntensity = isDark ? 35 : 25;
  const currencySymbol = "\u20AC";

  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [numberOfPeople, setNumberOfPeople] = React.useState(2);
  const [isAddExpenseVisible, setIsAddExpenseVisible] = React.useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = React.useState("");
  const [newExpenseAmount, setNewExpenseAmount] = React.useState("");
  const [newExpenseTipAmount, setNewExpenseTipAmount] = React.useState("0");
  const [selectedTipPreset, setSelectedTipPreset] = React.useState<number | "custom" | null>(null);
  const [customTipPercentage, setCustomTipPercentage] = React.useState("0");
  const [isHydrated, setIsHydrated] = React.useState(false);

  const tipAmountInputRef = React.useRef<TextInput>(null);
  const customTipInputRef = React.useRef<TextInput>(null);

  const STORAGE_KEY = React.useRef("split-expenses-calculator-state").current;

  React.useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  React.useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            expenses?: Expense[];
            numberOfPeople?: number;
          };

          if (parsed?.expenses && Array.isArray(parsed.expenses)) {
            setExpenses(
              parsed.expenses.map((expense) => ({
                ...expense,
                amount: Number(expense.amount) || 0,
                tipAmount: Number(expense.tipAmount) || 0,
              }))
            );
          }

          if (
            parsed?.numberOfPeople &&
            Number.isFinite(parsed.numberOfPeople) &&
            parsed.numberOfPeople >= 2 &&
            parsed.numberOfPeople <= 99
          ) {
            setNumberOfPeople(parsed.numberOfPeople);
          }
        }
      } catch (error) {
        console.warn("Failed to load saved state", error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadState();
  }, [STORAGE_KEY]);

  React.useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveState = async () => {
      try {
        const payload = JSON.stringify({ expenses, numberOfPeople });
        await AsyncStorage.setItem(STORAGE_KEY, payload);
      } catch (error) {
        console.warn("Failed to persist state", error);
      }
    };

    saveState();
  }, [expenses, numberOfPeople, STORAGE_KEY, isHydrated]);

  const sanitizeAmountInput = (text: string) => {
    if (!text) {
      return "";
    }

    let sanitized = text.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const firstDot = sanitized.indexOf(".");

    if (firstDot !== -1) {
      const before = sanitized.slice(0, firstDot + 1);
      const after = sanitized.slice(firstDot + 1).replace(/\./g, "");
      sanitized = before + after;
      if (text.endsWith(".") && !sanitized.endsWith(".")) {
        sanitized += ".";
      }
    }

    if (sanitized.startsWith(".")) {
      sanitized = `0${sanitized}`;
    }

    return sanitized;
  };

  const openAddExpenseModal = () => {
    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setNewExpenseTipAmount("0");
    setSelectedTipPreset(null);
    setCustomTipPercentage("0");
    setIsAddExpenseVisible(true);
  };

  const closeAddExpenseModal = () => {
    setIsAddExpenseVisible(false);
    Keyboard.dismiss();
  };

  const handleExpenseAmountChange = (text: string) => {
    setNewExpenseAmount(sanitizeAmountInput(text));
  };

  const handleTipAmountChange = (text: string) => {
    const sanitized = sanitizeAmountInput(text);
    setNewExpenseTipAmount(sanitized);
    setSelectedTipPreset(null);
  };

  const handleTipAmountFocus = () => {
    if (newExpenseTipAmount === "0") {
      setNewExpenseTipAmount("");
    }
  };

  const handleTipAmountBlur = () => {
    if (newExpenseTipAmount === "" || newExpenseTipAmount === ".") {
      setNewExpenseTipAmount("0");
    }
  };

  const formatTipValue = (value: number) => {
    if (!Number.isFinite(value) || value < 0) {
      return "0";
    }
    return value.toFixed(2);
  };

  const computeTipFromPercentage = (percentage: number) => {
    const amountValue = parseFloat(newExpenseAmount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return "0";
    }
    return formatTipValue(amountValue * (percentage / 100));
  };

  const handleSelectTipPreset = (percentage: number) => {
    setSelectedTipPreset(percentage);
    setNewExpenseTipAmount(computeTipFromPercentage(percentage));
    setCustomTipPercentage(String(percentage));
  };

  const handleSelectCustomTip = () => {
    setSelectedTipPreset("custom");
    if (customTipPercentage === "0") {
      setCustomTipPercentage("");
    }
    customTipInputRef.current?.focus();
  };

  const handleCustomTipPercentageChange = (text: string) => {
    const sanitized = sanitizeAmountInput(text);
    setCustomTipPercentage(sanitized);
    const percentageValue = parseFloat(sanitized);
    if (Number.isNaN(percentageValue) || percentageValue < 0) {
      setNewExpenseTipAmount("0");
      return;
    }
    setNewExpenseTipAmount(computeTipFromPercentage(percentageValue));
  };

  const handleCustomTipBlur = () => {
    if (customTipPercentage === "" || customTipPercentage === ".") {
      setCustomTipPercentage("0");
      setNewExpenseTipAmount("0");
    }
  };

  React.useEffect(() => {
    if (!isAddExpenseVisible || selectedTipPreset === null) {
      return;
    }

    if (selectedTipPreset === "custom") {
      const percentageValue = parseFloat(customTipPercentage);
      const computed = Number.isNaN(percentageValue)
        ? "0"
        : computeTipFromPercentage(percentageValue);
      if (computed !== newExpenseTipAmount) {
        setNewExpenseTipAmount(computed);
      }
      return;
    }

    const computed = computeTipFromPercentage(selectedTipPreset);
    if (computed !== newExpenseTipAmount) {
      setNewExpenseTipAmount(computed);
    }
  }, [newExpenseAmount, selectedTipPreset, customTipPercentage, isAddExpenseVisible, newExpenseTipAmount]);

  const handleAddExpense = () => {
    const trimmedTitle = newExpenseTitle.trim();
    const amountValue = parseFloat(newExpenseAmount);
    const tipAmountValue = parseFloat(newExpenseTipAmount);
    const tipAmount = Number.isNaN(tipAmountValue) || tipAmountValue < 0 ? 0 : tipAmountValue;

    if (!trimmedTitle || Number.isNaN(amountValue) || amountValue <= 0) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpenses((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: trimmedTitle,
        amount: amountValue,
        tipAmount,
      },
    ]);

    setIsAddExpenseVisible(false);
    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setNewExpenseTipAmount("0");
    setSelectedTipPreset(null);
    setCustomTipPercentage("0");
    Keyboard.dismiss();
  };

  const handleRemoveExpense = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const handleClearExpenses = () => {
    if (expenses.length === 0) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpenses([]);
  };

  const increasePeople = () => {
    if (numberOfPeople < 99) {
      setNumberOfPeople((prev) => prev + 1);
    }
  };

  const decreasePeople = () => {
    if (numberOfPeople > 2) {
      setNumberOfPeople((prev) => prev - 1);
    }
  };

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalTip = expenses.reduce((sum, expense) => sum + expense.tipAmount, 0);
  const totalWithTip = total + totalTip;
  const perPerson = numberOfPeople > 0 ? totalWithTip / numberOfPeople : 0;
  const parsedAmount = parseFloat(newExpenseAmount);
  const isAddExpenseDisabled =
    !newExpenseTitle.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0;

  return (
    <SafeAreaView style={[styles.root, isDark ? styles.rootDark : styles.rootLight]}>
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        onTouchStart={() => {
          if (!isAddExpenseVisible) {
            Keyboard.dismiss();
          }
        }}
        onScrollBeginDrag={() => {
          if (!isAddExpenseVisible) {
            Keyboard.dismiss();
          }
        }}
      >
              <BlurView
                intensity={blurIntensity}
                tint={blurTint}
                style={[
                  styles.section,
                  isDark ? styles.sectionDark : styles.sectionLight,
                  Platform.OS === "android" &&
                    (isDark ? styles.sectionAndroidFallbackDark : styles.sectionAndroidFallbackLight),
                ]}
              >
                <View style={styles.expensesHeader}>
                  <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                    Gastos
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.addExpenseButton,
                      isDark ? styles.addExpenseButtonDark : styles.addExpenseButtonLight,
                    ]}
                    onPress={openAddExpenseModal}
                  >
                    <Text
                      style={[
                        styles.addExpenseButtonText,
                        isDark ? styles.addExpenseButtonTextDark : styles.addExpenseButtonTextLight,
                      ]}
                    >
                      + Anadir gasto
                    </Text>
                  </TouchableOpacity>
                </View>

                {expenses.length === 0 ? (
                  <Text
                    style={[
                      styles.emptyExpensesText,
                      isDark ? styles.emptyExpensesTextDark : styles.emptyExpensesTextLight,
                    ]}
                  >
                    Anade tus gastos para comenzar a dividirlos.
                  </Text>
                ) : (
                  <View>
                    <View style={styles.expensesListWrapper}>
                      <View style={styles.expensesListContent}>
                        {expenses.map((expense) => (
                          <View
                            key={expense.id}
                            style={[
                              styles.expenseItem,
                              isDark ? styles.expenseItemDark : styles.expenseItemLight,
                            ]}
                          >
                            <View style={styles.expenseInfo}>
                              <Text
                                style={[
                                  styles.expenseTitle,
                                  isDark ? styles.expenseTitleDark : styles.expenseTitleLight,
                                ]}
                              >
                                {expense.title}
                              </Text>
                              <View style={styles.expenseAmountGroup}>
                                <Text
                                  style={[
                                    styles.expenseAmount,
                                    isDark ? styles.expenseAmountDark : styles.expenseAmountLight,
                                  ]}
                                >
                                  {(expense.amount + expense.tipAmount).toFixed(2)} {currencySymbol}
                                </Text>
                                {expense.tipAmount > 0 && (
                                  <Text
                                    style={[
                                      styles.expenseTipSummary,
                                      isDark ? styles.expenseTipSummaryDark : styles.expenseTipSummaryLight,
                                    ]}
                                  >
                                    ({expense.amount.toFixed(2)} {currencySymbol} + {expense.tipAmount.toFixed(2)} {currencySymbol})
                                  </Text>
                                )}
                              </View>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleRemoveExpense(expense.id)}
                              style={styles.removeExpenseButton}
                              accessibilityLabel={`Eliminar ${expense.title}`}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={20}
                                color={isDark ? "#FF6B6B" : "#D13B3B"}
                              />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.expensesFooter}>
                      <View style={styles.expensesTotalRow}>
                        <Text
                          style={[
                            styles.expensesTotalLabel,
                            isDark
                              ? styles.expensesTotalLabelDark
                              : styles.expensesTotalLabelLight,
                          ]}
                        >
                          Total
                        </Text>
                        <Text
                          style={[
                            styles.expensesTotalValue,
                            isDark ? styles.expensesTotalValueDark : styles.expensesTotalValueLight,
                          ]}
                        >
                          {total.toFixed(2)} {currencySymbol}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.clearExpensesButton,
                          isDark ? styles.clearExpensesButtonDark : styles.clearExpensesButtonLight,
                        ]}
                        onPress={handleClearExpenses}
                      >
                        <Text
                          style={[
                            styles.clearExpensesButtonText,
                            isDark
                              ? styles.clearExpensesButtonTextDark
                              : styles.clearExpensesButtonTextLight,
                          ]}
                        >
                          Limpiar todo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
            </BlurView>

            <BlurView
              intensity={blurIntensity}
              tint={blurTint}
              style={[
                styles.section,
                isDark ? styles.sectionDark : styles.sectionLight,
                Platform.OS === "android" &&
                  (isDark ? styles.sectionAndroidFallbackDark : styles.sectionAndroidFallbackLight),
              ]}
            >
              <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                Numero de personas
              </Text>
              <View style={styles.peopleControl}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    isDark ? styles.controlButtonDark : styles.controlButtonLight,
                    numberOfPeople <= 2 && styles.controlButtonDisabled,
                  ]}
                  onPress={decreasePeople}
                  disabled={numberOfPeople <= 2}
                >
                  <Text
                    style={[
                      styles.controlButtonText,
                      isDark ? styles.controlButtonTextDark : styles.controlButtonTextLight,
                      numberOfPeople <= 2 && styles.controlButtonTextDisabled,
                    ]}
                  >
                    -
                  </Text>
                </TouchableOpacity>

                <View
                  style={[
                    styles.peopleNumberContainer,
                    isDark ? styles.peopleNumberContainerDark : styles.peopleNumberContainerLight,
                  ]}
                >
                  <Text
                    style={[
                      styles.peopleNumber,
                      isDark ? styles.peopleNumberDark : styles.peopleNumberLight,
                    ]}
                  >
                    {numberOfPeople}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    isDark ? styles.controlButtonDark : styles.controlButtonLight,
                  ]}
                  onPress={increasePeople}
                  disabled={numberOfPeople >= 99}
                >
                  <Text
                    style={[
                      styles.controlButtonText,
                      isDark ? styles.controlButtonTextDark : styles.controlButtonTextLight,
                    ]}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>

            <BlurView
              intensity={blurIntensity}
              tint={blurTint}
              style={[
                styles.resultSection,
                isDark ? styles.resultSectionDark : styles.resultSectionLight,
                Platform.OS === "android" &&
                  (isDark
                    ? styles.resultSectionAndroidFallbackDark
                    : styles.resultSectionAndroidFallbackLight),
              ]}
            >
              <Text style={[styles.resultLabel, isDark ? styles.resultLabelDark : styles.resultLabelLight]}>
                Por persona
              </Text>
              <View style={styles.resultAmount}>
                <Text
                  style={[
                    styles.resultValue,
                    isDark ? styles.resultValueDark : styles.resultValueLight,
                  ]}
                >
                  {perPerson.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.resultCurrency,
                    isDark ? styles.resultCurrencyDark : styles.resultCurrencyLight,
                  ]}
                >
                  {currencySymbol}
                </Text>
              </View>
              <View style={styles.resultBreakdown}>
                <View style={styles.resultBreakdownRow}>
                  <Text
                    style={[
                      styles.resultBreakdownLabel,
                      isDark ? styles.resultBreakdownLabelDark : styles.resultBreakdownLabelLight,
                    ]}
                  >
                    Subtotal
                  </Text>
                  <Text
                    style={[
                      styles.resultBreakdownValue,
                      isDark ? styles.resultBreakdownValueDark : styles.resultBreakdownValueLight,
                    ]}
                  >
                    {total.toFixed(2)} {currencySymbol}
                  </Text>
                </View>
                <View style={styles.resultBreakdownRow}>
                  <Text
                    style={[
                      styles.resultBreakdownLabel,
                      isDark ? styles.resultBreakdownLabelDark : styles.resultBreakdownLabelLight,
                    ]}
                  >
                    Propina
                  </Text>
                  <Text
                    style={[
                      styles.resultBreakdownValue,
                      isDark ? styles.resultBreakdownValueDark : styles.resultBreakdownValueLight,
                    ]}
                  >
                    {totalTip.toFixed(2)} {currencySymbol}
                  </Text>
                </View>
                <View style={styles.resultBreakdownRow}>
                  <Text
                    style={[
                      styles.resultBreakdownLabel,
                      isDark ? styles.resultBreakdownLabelDark : styles.resultBreakdownLabelLight,
                    ]}
                  >
                    Total con propina
                  </Text>
                  <Text
                    style={[
                      styles.resultBreakdownValue,
                      isDark ? styles.resultBreakdownValueDark : styles.resultBreakdownValueLight,
                    ]}
                  >
                    {totalWithTip.toFixed(2)} {currencySymbol}
                  </Text>
                </View>
              </View>
              {totalTip > 0 && (
                <Text
                  style={[
                    styles.tipPerPersonText,
                    isDark ? styles.tipPerPersonTextDark : styles.tipPerPersonTextLight,
                  ]}
                >
                  (Propina: {(totalTip / numberOfPeople).toFixed(2)} {currencySymbol} por persona)
                </Text>
              )}
            </BlurView>
      </ScrollView>

      <Modal
        visible={isAddExpenseVisible}
        animationType="fade"
        transparent
        onRequestClose={closeAddExpenseModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            <BlurView
              intensity={isDark ? 55 : 45}
              tint={blurTint}
              style={[
                styles.modalContent,
                isDark ? styles.modalContentDark : styles.modalContentLight,
                Platform.OS === "android" &&
                  (isDark
                    ? styles.modalContentAndroidFallbackDark
                    : styles.modalContentAndroidFallbackLight),
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                  <Text
                    style={[
                      styles.modalTitle,
                      isDark ? styles.modalTitleDark : styles.modalTitleLight,
                    ]}
                  >
                    Nuevo gasto
                  </Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      isDark ? styles.modalInputDark : styles.modalInputLight,
                    ]}
                    value={newExpenseTitle}
                    onChangeText={setNewExpenseTitle}
                    placeholder="Descripcion"
                    placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.35)"}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <TextInput
                    style={[
                      styles.modalInput,
                      isDark ? styles.modalInputDark : styles.modalInputLight,
                    ]}
                    value={newExpenseAmount}
                    onChangeText={handleExpenseAmountChange}
                    keyboardType="decimal-pad"
                    placeholder="Cantidad"
                    placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.35)"}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <TextInput
                    ref={tipAmountInputRef}
                    style={[
                      styles.modalInput,
                      isDark ? styles.modalInputDark : styles.modalInputLight,
                    ]}
                    value={newExpenseTipAmount}
                    onChangeText={handleTipAmountChange}
                    onFocus={handleTipAmountFocus}
                    onBlur={handleTipAmountBlur}
                    keyboardType="decimal-pad"
                    placeholder="Propina (importe)"
                    placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.35)"}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <View style={styles.tipOptions}>
                    {[5, 10, 15].map((percentage) => (
                      <TouchableOpacity
                        key={percentage}
                        style={[
                          styles.tipButton,
                          isDark ? styles.tipButtonDark : styles.tipButtonLight,
                          selectedTipPreset === percentage && styles.tipButtonActive,
                        ]}
                        onPress={() => handleSelectTipPreset(percentage)}
                      >
                        <Text
                          style={[
                            styles.tipButtonText,
                            isDark ? styles.tipButtonTextDark : styles.tipButtonTextLight,
                            selectedTipPreset === percentage && styles.tipButtonTextActive,
                          ]}
                        >
                          {percentage}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[
                        styles.tipButton,
                        isDark ? styles.tipButtonDark : styles.tipButtonLight,
                        selectedTipPreset === "custom" && styles.tipButtonActive,
                      ]}
                      onPress={handleSelectCustomTip}
                    >
                      <Text
                        style={[
                          styles.tipButtonText,
                          isDark ? styles.tipButtonTextDark : styles.tipButtonTextLight,
                          selectedTipPreset === "custom" && styles.tipButtonTextActive,
                        ]}
                      >
                        Personalizado
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {selectedTipPreset === "custom" && (
                    <TextInput
                      ref={customTipInputRef}
                      style={[
                        styles.modalInput,
                        isDark ? styles.modalInputDark : styles.modalInputLight,
                      ]}
                      value={customTipPercentage}
                      onChangeText={handleCustomTipPercentageChange}
                      onBlur={handleCustomTipBlur}
                      keyboardType="decimal-pad"
                      placeholder="% personalizado"
                      placeholderTextColor={
                        isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.35)"
                      }
                      returnKeyType="done"
                      blurOnSubmit
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  )}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionButtonSecondary]}
                    onPress={closeAddExpenseModal}
                  >
                    <Text
                      style={[
                        styles.modalCancelText,
                        isDark ? styles.modalCancelTextDark : styles.modalCancelTextLight,
                      ]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      isDark
                        ? styles.modalActionButtonPrimaryDark
                        : styles.modalActionButtonPrimaryLight,
                      isAddExpenseDisabled && styles.modalActionButtonDisabled,
                    ]}
                    onPress={handleAddExpense}
                    disabled={isAddExpenseDisabled}
                  >
                    <Text
                      style={[
                        styles.modalActionButtonText,
                        isDark ? styles.modalActionButtonTextDark : styles.modalActionButtonTextLight,
                      ]}
                    >
                      Anadir
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootLight: {
    backgroundColor: "transparent",
  },
  rootDark: {
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 56,
  },
  section: {
    borderRadius: 32,
    padding: 22,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 20,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  sectionLight: {
    borderColor: "rgba(200, 210, 230, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    shadowColor: "rgba(100, 120, 200, 0.25)",
  },
  sectionDark: {
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(35, 38, 55, 0.45)",
    shadowColor: "rgba(0, 0, 0, 0.5)",
  },
  sectionAndroidFallbackLight: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  sectionAndroidFallbackDark: {
    backgroundColor: "rgba(15, 18, 28, 0.45)",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  labelLight: {
    color: "#1C1D29",
  },
  labelDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  expensesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addExpenseButton: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  addExpenseButtonLight: {
    borderColor: "rgba(120, 140, 220, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    shadowColor: "rgba(100, 120, 200, 0.2)",
  },
  addExpenseButtonDark: {
    borderColor: "rgba(120, 140, 220, 0.4)",
    backgroundColor: "rgba(50, 55, 75, 0.5)",
    shadowColor: "rgba(0, 0, 0, 0.4)",
  },
  addExpenseButtonText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  addExpenseButtonTextLight: {
    color: "#1C1D29",
  },
  addExpenseButtonTextDark: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  emptyExpensesText: {
    textAlign: "center",
    fontSize: 14,
    paddingVertical: 16,
  },
  emptyExpensesTextLight: {
    color: "#5A5D72",
  },
  emptyExpensesTextDark: {
    color: "rgba(255, 255, 255, 0.65)",
  },
  expensesListWrapper: {
    marginBottom: 14,
  },
  expensesListContent: {
    paddingBottom: 8,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  expenseItemLight: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderColor: "rgba(160, 165, 180, 0.35)",
  },
  expenseItemDark: {
    backgroundColor: "rgba(25, 27, 38, 0.45)",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  expenseTitleLight: {
    color: "#1C1D29",
  },
  expenseTitleDark: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "500",
  },
  expenseAmountLight: {
    color: myColors.accent,
  },
  expenseAmountDark: {
    color: myColors.accent,
  },
  expenseAmountGroup: {
    alignItems: "flex-end",
  },
  expenseTipSummary: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  expenseTipSummaryLight: {
    color: "#5A5D72",
  },
  expenseTipSummaryDark: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  removeExpenseButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  expensesFooter: {
    marginTop: 12,
  },
  expensesTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expensesTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  expensesTotalLabelLight: {
    color: "#5A5D72",
  },
  expensesTotalLabelDark: {
    color: "rgba(255, 255, 255, 0.65)",
  },
  expensesTotalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  expensesTotalValueLight: {
    color: myColors.accent,
  },
  expensesTotalValueDark: {
    color: myColors.accent,
  },
  clearExpensesButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
  },
  clearExpensesButtonLight: {
    borderColor: "rgba(209, 59, 59, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  clearExpensesButtonDark: {
    borderColor: "rgba(255, 107, 107, 0.4)",
    backgroundColor: "rgba(25, 27, 38, 0.5)",
  },
  clearExpensesButtonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  clearExpensesButtonTextLight: {
    color: "#D13B3B",
  },
  clearExpensesButtonTextDark: {
    color: "#FF6B6B",
  },
  tipOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tipButton: {
    width: "48%",
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tipButtonLight: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderColor: "rgba(160, 165, 180, 0.4)",
  },
  tipButtonDark: {
    backgroundColor: "rgba(25, 27, 38, 0.45)",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  tipButtonActive: {
    backgroundColor: myColors.accent,
    borderColor: myColors.accent,
  },
  tipButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  tipButtonTextLight: {
    color: "#1C1D29",
  },
  tipButtonTextDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  tipButtonTextActive: {
    color: "#FFFFFF",
  },
  peopleControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    marginHorizontal: 12,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  controlButtonLight: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderColor: "rgba(180, 195, 220, 0.5)",
    shadowColor: "rgba(100, 120, 200, 0.25)",
  },
  controlButtonDark: {
    backgroundColor: "rgba(50, 55, 75, 0.5)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "rgba(0, 0, 0, 0.5)",
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  controlButtonText: {
    fontSize: 30,
    fontWeight: "300",
  },
  controlButtonTextLight: {
    color: "#1C1D29",
  },
  controlButtonTextDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  controlButtonTextDisabled: {
    opacity: 0.4,
  },
  peopleNumberContainer: {
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 20,
    minWidth: 72,
    alignItems: "center",
    marginHorizontal: 12,
  },
  peopleNumberContainerLight: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  peopleNumberContainerDark: {
    backgroundColor: "rgba(25, 27, 38, 0.4)",
  },
  peopleNumber: {
    fontSize: 36,
    fontWeight: "300",
  },
  peopleNumberLight: {
    color: "#1C1D29",
  },
  peopleNumberDark: {
    color: "rgba(255, 255, 255, 0.95)",
  },
  resultSection: {
    borderRadius: 32,
    padding: 26,
    borderWidth: 1.5,
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  resultSectionLight: {
    borderColor: "rgba(180, 195, 220, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "rgba(100, 120, 200, 0.3)",
  },
  resultSectionDark: {
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(35, 38, 55, 0.5)",
    shadowColor: "rgba(0, 0, 0, 0.5)",
  },
  resultSectionAndroidFallbackLight: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  resultSectionAndroidFallbackDark: {
    backgroundColor: "rgba(15, 18, 28, 0.55)",
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  resultLabelLight: {
    color: "#5A5D72",
  },
  resultLabelDark: {
    color: "rgba(255, 255, 255, 0.65)",
  },
  resultAmount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resultValue: {
    fontSize: 46,
    fontWeight: "200",
  },
  resultValueLight: {
    color: myColors.accent,
  },
  resultValueDark: {
    color: myColors.accent,
  },
  resultCurrency: {
    fontSize: 46,
    fontWeight: "200",
    marginLeft: 10,
  },
  resultCurrencyLight: {
    color: myColors.accent,
  },
  resultCurrencyDark: {
    color: myColors.accent,
  },
  resultBreakdown: {
    alignSelf: "stretch",
    marginTop: 18,
  },
  resultBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultBreakdownLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultBreakdownLabelLight: {
    color: "#5A5D72",
  },
  resultBreakdownLabelDark: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  resultBreakdownValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultBreakdownValueLight: {
    color: "#1C1D29",
  },
  resultBreakdownValueDark: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  tipPerPersonText: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
  },
  tipPerPersonTextLight: {
    color: "#5A5D72",
  },
  tipPerPersonTextDark: {
    color: "rgba(255, 255, 255, 0.65)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingHorizontal: 22,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalContentLight: {
    borderColor: "rgba(160, 165, 180, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  modalContentDark: {
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(20, 24, 40, 0.45)",
  },
  modalContentAndroidFallbackLight: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  modalContentAndroidFallbackDark: {
    backgroundColor: "rgba(15, 18, 28, 0.88)",
  },
  modalScrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
  },
  modalTitleLight: {
    color: "#1C1D29",
  },
  modalTitleDark: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  modalInput: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  modalInputLight: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderColor: "rgba(160, 165, 180, 0.4)",
    color: "#1C1D29",
  },
  modalInputDark: {
    backgroundColor: "rgba(25, 27, 38, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    color: "rgba(255, 255, 255, 0.85)",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  modalActionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 12,
  },
  modalActionButtonSecondary: {
    marginLeft: 0,
  },
  modalActionButtonPrimaryLight: {
    backgroundColor: myColors.accent,
  },
  modalActionButtonPrimaryDark: {
    backgroundColor: myColors.accent,
  },
  modalActionButtonDisabled: {
    opacity: 0.5,
  },
  modalActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalActionButtonTextLight: {
    color: "#1C1D29",
  },
  modalActionButtonTextDark: {
    color: "#FFFFFF",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalCancelTextLight: {
    color: "#5A5D72",
  },
  modalCancelTextDark: {
    color: "rgba(255, 255, 255, 0.7)",
  },
});


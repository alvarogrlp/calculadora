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
} from "react-native";
import { BlurView } from "expo-blur";
import { ThemeContext } from "../context/ThemeContext";
import { myColors } from "../styles/Colors";

type Expense = {
  id: string;
  title: string;
  amount: number;
};

export default function SplitExpensesCalculator() {
  const theme = React.useContext(ThemeContext);
  const isDark = theme === "dark";
  const blurTint = isDark ? "dark" : "light";
  const blurIntensity = isDark ? 45 : 85;

  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [numberOfPeople, setNumberOfPeople] = React.useState(2);
  const [tipPercentage, setTipPercentage] = React.useState(0);
  const [isAddExpenseVisible, setIsAddExpenseVisible] = React.useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = React.useState("");
  const [newExpenseAmount, setNewExpenseAmount] = React.useState("");

  React.useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

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
    setIsAddExpenseVisible(true);
  };

  const closeAddExpenseModal = () => {
    setIsAddExpenseVisible(false);
    Keyboard.dismiss();
  };

  const handleExpenseAmountChange = (text: string) => {
    setNewExpenseAmount(sanitizeAmountInput(text));
  };

  const handleAddExpense = () => {
    const trimmedTitle = newExpenseTitle.trim();
    const amountValue = parseFloat(newExpenseAmount);

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
      },
    ]);

    setIsAddExpenseVisible(false);
    setNewExpenseTitle("");
    setNewExpenseAmount("");
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
    setTipPercentage(0);
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
  const tipAmount = total > 0 ? total * (tipPercentage / 100) : 0;
  const totalWithTip = total + tipAmount;
  const perPerson = numberOfPeople > 0 ? totalWithTip / numberOfPeople : 0;
  const parsedAmount = parseFloat(newExpenseAmount);
  const isAddExpenseDisabled =
    !newExpenseTitle.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0;

  return (
    <View style={styles.root}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        disabled={isAddExpenseVisible}
      >
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <BlurView
              intensity={blurIntensity}
              tint={blurTint}
              style={[styles.section, isDark ? styles.sectionDark : styles.sectionLight]}
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
                    + Añadir gasto
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
                  Añade tus gastos para comenzar a dividirlos.
                </Text>
              ) : (
                <View>
                  <View style={styles.expensesListWrapper}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.expensesListContent}
                    >
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
                            <Text
                              style={[
                                styles.expenseAmount,
                                isDark ? styles.expenseAmountDark : styles.expenseAmountLight,
                              ]}
                            >
                              {expense.amount.toFixed(2)} €
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveExpense(expense.id)}
                            style={styles.removeExpenseButton}
                          >
                            <Text
                              style={[
                                styles.removeExpenseText,
                                isDark ? styles.removeExpenseTextDark : styles.removeExpenseTextLight,
                              ]}
                            >
                              Eliminar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
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
                        {total.toFixed(2)} €
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
              style={[styles.section, isDark ? styles.sectionDark : styles.sectionLight]}
            >
              <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                Propina
              </Text>
              <View style={styles.tipOptions}>
                {[0, 5, 10, 15].map((percentage) => (
                  <TouchableOpacity
                    key={percentage}
                    style={[
                      styles.tipButton,
                      isDark ? styles.tipButtonDark : styles.tipButtonLight,
                      tipPercentage === percentage && styles.tipButtonActive,
                    ]}
                    onPress={() => setTipPercentage(percentage)}
                  >
                    <Text
                      style={[
                        styles.tipButtonText,
                        isDark ? styles.tipButtonTextDark : styles.tipButtonTextLight,
                        tipPercentage === percentage && styles.tipButtonTextActive,
                      ]}
                    >
                      {percentage}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {tipAmount > 0 && (
                <View style={styles.tipAmountDisplay}>
                  <Text
                    style={[
                      styles.tipAmountText,
                      isDark ? styles.tipAmountTextDark : styles.tipAmountTextLight,
                    ]}
                  >
                    Propina: {tipAmount.toFixed(2)} €
                  </Text>
                </View>
              )}
            </BlurView>

            <BlurView
              intensity={blurIntensity}
              tint={blurTint}
              style={[styles.section, isDark ? styles.sectionDark : styles.sectionLight]}
            >
              <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                Número de personas
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
              style={[styles.resultSection, isDark ? styles.resultSectionDark : styles.resultSectionLight]}
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
                  €
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
                    {total.toFixed(2)} €
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
                    {tipAmount.toFixed(2)} €
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
                    {totalWithTip.toFixed(2)} €
                  </Text>
                </View>
              </View>
              {tipAmount > 0 && (
                <Text
                  style={[
                    styles.tipPerPersonText,
                    isDark ? styles.tipPerPersonTextDark : styles.tipPerPersonTextLight,
                  ]}
                >
                  (Propina: {(tipAmount / numberOfPeople).toFixed(2)} € por persona)
                </Text>
              )}
            </BlurView>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={isAddExpenseVisible}
        animationType="fade"
        transparent
        onRequestClose={closeAddExpenseModal}
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={blurIntensity}
            tint={blurTint}
            style={[
              styles.modalContent,
              isDark ? styles.modalContentDark : styles.modalContentLight,
            ]}
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
              placeholder="Descripción"
              placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.35)"}
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
            />
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
                  Añadir
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingBottom: 48,
    gap: 14,
  },
  section: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionLight: {
    borderColor: "rgba(160, 165, 180, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  sectionDark: {
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(20, 24, 40, 0.35)",
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
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  addExpenseButtonLight: {
    borderColor: "rgba(118, 132, 220, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  addExpenseButtonDark: {
    borderColor: "rgba(118, 132, 220, 0.35)",
    backgroundColor: "rgba(25, 27, 38, 0.55)",
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
    maxHeight: 220,
    marginBottom: 14,
  },
  expensesListContent: {
    gap: 12,
    paddingRight: 6,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
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
  removeExpenseButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  removeExpenseText: {
    fontSize: 13,
    fontWeight: "600",
  },
  removeExpenseTextLight: {
    color: "#D13B3B",
  },
  removeExpenseTextDark: {
    color: "#FF6B6B",
  },
  expensesFooter: {
    marginTop: 6,
    gap: 12,
  },
  expensesTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    justifyContent: "space-between",
    gap: 12,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
  tipAmountDisplay: {
    marginTop: 16,
    alignItems: "center",
  },
  tipAmountText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tipAmountTextLight: {
    color: myColors.accent,
  },
  tipAmountTextDark: {
    color: myColors.accent,
  },
  peopleControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  controlButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  controlButtonLight: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderColor: "rgba(160, 165, 180, 0.45)",
  },
  controlButtonDark: {
    backgroundColor: "rgba(25, 27, 38, 0.5)",
    borderColor: "rgba(255, 255, 255, 0.12)",
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
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    alignItems: "center",
    overflow: "hidden",
  },
  resultSectionLight: {
    borderColor: "rgba(160, 165, 180, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  resultSectionDark: {
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(20, 24, 40, 0.4)",
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
    gap: 8,
  },
  resultBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    gap: 12,
    marginTop: 10,
  },
  modalActionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalActionButtonSecondary: {},
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


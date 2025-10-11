import * as React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { myColors } from "../styles/Colors";

export default function SplitExpensesCalculator() {
  const theme = React.useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [totalAmount, setTotalAmount] = React.useState("");
  const [numberOfPeople, setNumberOfPeople] = React.useState(2);
  const [tipPercentage, setTipPercentage] = React.useState(0);

  const handleInputChange = (text: string) => {
    // Solo permitir números, punto y coma
    const sanitized = text.replace(/[^0-9.,]/g, '');
    // Reemplazar coma por punto para estandarizar
    const normalized = sanitized.replace(',', '.');
    setTotalAmount(normalized);
  };

  const handleInputFocus = () => {
    // Limpiar el placeholder al hacer clic
    if (totalAmount === "" || totalAmount === "0.00") {
      setTotalAmount("");
    }
  };

  const increasePeople = () => {
    if (numberOfPeople < 99) {
      setNumberOfPeople(prev => prev + 1);
    }
  };

  const decreasePeople = () => {
    if (numberOfPeople > 2) {
      setNumberOfPeople(prev => prev - 1);
    }
  };

  const total = parseFloat(totalAmount) || 0;
  const tipAmount = total * (tipPercentage / 100);
  const totalWithTip = total + tipAmount;
  const perPerson = numberOfPeople > 0 ? totalWithTip / numberOfPeople : 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
      {/* Total Amount Input */}
      <View style={[styles.section, isDark ? styles.sectionDark : styles.sectionLight]}>
        <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
          Total de la cuenta
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.totalInput, isDark ? styles.totalInputDark : styles.totalInputLight]}
            value={totalAmount}
            onChangeText={handleInputChange}
            onFocus={handleInputFocus}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
          />
          <Text style={[styles.currencySymbol, isDark ? styles.currencySymbolDark : styles.currencySymbolLight]}>
            €
          </Text>
        </View>
      </View>

      {/* Tip Selection */}
      <View style={[styles.section, isDark ? styles.sectionDark : styles.sectionLight]}>
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
            <Text style={[styles.tipAmountText, isDark ? styles.tipAmountTextDark : styles.tipAmountTextLight]}>
              Propina: {tipAmount.toFixed(2)} €
            </Text>
          </View>
        )}
      </View>

      {/* Number of People */}
      <View style={[styles.section, isDark ? styles.sectionDark : styles.sectionLight]}>
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
              −
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.peopleNumberContainer, isDark ? styles.peopleNumberContainerDark : styles.peopleNumberContainerLight]}>
            <Text style={[styles.peopleNumber, isDark ? styles.peopleNumberDark : styles.peopleNumberLight]}>
              {numberOfPeople}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.controlButton, isDark ? styles.controlButtonDark : styles.controlButtonLight]}
            onPress={increasePeople}
            disabled={numberOfPeople >= 99}
          >
            <Text style={[styles.controlButtonText, isDark ? styles.controlButtonTextDark : styles.controlButtonTextLight]}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result */}
      <View style={[styles.resultSection, isDark ? styles.resultSectionDark : styles.resultSectionLight]}>
        <Text style={[styles.resultLabel, isDark ? styles.resultLabelDark : styles.resultLabelLight]}>
          Por persona
        </Text>
        <View style={styles.resultAmount}>
          <Text style={[styles.resultValue, isDark ? styles.resultValueDark : styles.resultValueLight]}>
            {perPerson.toFixed(2)}
          </Text>
          <Text style={[styles.resultCurrency, isDark ? styles.resultCurrencyDark : styles.resultCurrencyLight]}>
            €
          </Text>
        </View>
        {tipAmount > 0 && (
          <Text style={[styles.tipPerPersonText, isDark ? styles.tipPerPersonTextDark : styles.tipPerPersonTextLight]}>
            (Propina: {(tipAmount / numberOfPeople).toFixed(2)} €)
          </Text>
        )}
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'flex-start',
  },
  section: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  sectionLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderColor: 'rgba(160, 165, 180, 0.4)',
  },
  sectionDark: {
    backgroundColor: 'rgba(25, 27, 38, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  labelLight: {
    color: '#1C1D29',
  },
  labelDark: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalInput: {
    fontSize: 42,
    fontWeight: '300',
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 130,
  },
  totalInputLight: {
    color: '#1C1D29',
  },
  totalInputDark: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  currencySymbol: {
    fontSize: 42,
    fontWeight: '300',
    marginLeft: 6,
  },
  currencySymbolLight: {
    color: '#5A5D72',
  },
  currencySymbolDark: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  peopleControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  controlButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(160, 165, 180, 0.45)',
  },
  controlButtonDark: {
    backgroundColor: 'rgba(25, 27, 38, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  controlButtonText: {
    fontSize: 28,
    fontWeight: '300',
  },
  controlButtonTextLight: {
    color: '#1C1D29',
  },
  controlButtonTextDark: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  peopleNumberContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 18,
    minWidth: 70,
    alignItems: 'center',
  },
  peopleNumberContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  peopleNumberContainerDark: {
    backgroundColor: 'rgba(25, 27, 38, 0.4)',
  },
  peopleNumber: {
    fontSize: 36,
    fontWeight: '300',
  },
  peopleNumberLight: {
    color: '#1C1D29',
  },
  peopleNumberDark: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  resultSection: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  resultSectionLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(160, 165, 180, 0.5)',
  },
  resultSectionDark: {
    backgroundColor: 'rgba(25, 27, 38, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultLabelLight: {
    color: '#5A5D72',
  },
  resultLabelDark: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  resultAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultValue: {
    fontSize: 46,
    fontWeight: '200',
  },
  resultValueLight: {
    color: myColors.accent,
  },
  resultValueDark: {
    color: myColors.accent,
  },
  resultCurrency: {
    fontSize: 46,
    fontWeight: '200',
    marginLeft: 10,
  },
  resultCurrencyLight: {
    color: myColors.accent,
  },
  resultCurrencyDark: {
    color: myColors.accent,
  },
  // Tip styles
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(160, 165, 180, 0.45)',
  },
  tipButtonDark: {
    backgroundColor: 'rgba(25, 27, 38, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tipButtonActive: {
    backgroundColor: myColors.accent,
    borderColor: myColors.accent,
  },
  tipButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  tipButtonTextLight: {
    color: '#1C1D29',
  },
  tipButtonTextDark: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  tipButtonTextActive: {
    color: '#FFFFFF',
  },
  tipAmountDisplay: {
    marginTop: 16,
    alignItems: 'center',
  },
  tipAmountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipAmountTextLight: {
    color: myColors.accent,
  },
  tipAmountTextDark: {
    color: myColors.accent,
  },
  controlButtonTextDisabled: {
    opacity: 0.3,
  },
  tipPerPersonText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.75,
  },
  tipPerPersonTextLight: {
    color: '#5A5D72',
  },
  tipPerPersonTextDark: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
});

import * as React from "react";
import {
  View,
  Text,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Button from "./Button";
import { Styles } from "../styles/GlobalStyles";
import { ThemeContext } from "../context/ThemeContext";
import { myColors } from "../styles/Colors";

type Operator = "+" | "-" | "×" | "÷";

const MULTIPLY_SYMBOL: Operator = "×";
const DIVIDE_SYMBOL: Operator = "÷";

const isOperator = (token: string): token is Operator =>
  token === "+" || token === "-" || token === MULTIPLY_SYMBOL || token === DIVIDE_SYMBOL;

const runOperation = (left: number, right: number, operator: Operator): number => {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case MULTIPLY_SYMBOL:
      return left * right;
    case DIVIDE_SYMBOL:
      return right === 0 ? Infinity : left / right;
    default:
      return right;
  }
};

const sanitizeNumber = (value: number, keepTrailingZeros: boolean = false): string => {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  if (Object.is(value, -0) || value === 0) {
    return "0";
  }

  if (Math.abs(value) >= 1e9 || Math.abs(value) < 1e-6) {
    const exponential = value.toExponential(6);
    return exponential.replace(/\.?0+e/, "e");
  }

  let asString = value.toString();

  if (!Number.isInteger(value)) {
    asString = value.toFixed(10);
    // Solo eliminar ceros decimales finales, no ceros en la parte entera
    return asString.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }

  // Si es un entero, devolverlo como está (mantiene 100, 200, etc.)
  return asString;
};

const sanitizeInputString = (input: string): string => {
  const trimmed = input.trim();

  if (trimmed === "Error") {
    return "Error";
  }

  if (trimmed === "" || trimmed === "-") {
    return "0";
  }

  if (trimmed === ".") {
    return "0";
  }

  const normalized = trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;

  const numeric = parseFloat(normalized);
  if (Number.isNaN(numeric)) {
    return "0";
  }

  return sanitizeNumber(numeric);
};

const evaluateExpression = (tokens: string[]): number => {
  const output: (number | Operator)[] = [];
  const operators: Operator[] = [];
  const precedence: Record<Operator, number> = {
    "+": 1,
    "-": 1,
    [MULTIPLY_SYMBOL]: 2,
    [DIVIDE_SYMBOL]: 2,
  };

  tokens.forEach((token) => {
    if (isOperator(token)) {
      while (
        operators.length &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop() as Operator);
      }
      operators.push(token);
    } else {
      output.push(parseFloat(token));
    }
  });

  while (operators.length) {
    output.push(operators.pop() as Operator);
  }

  const stack: number[] = [];

  output.forEach((item) => {
    if (typeof item === "number") {
      stack.push(item);
    } else {
      const right = stack.pop();
      const left = stack.pop();

      if (right === undefined || left === undefined) {
        stack.push(0);
        return;
      }

      stack.push(runOperation(left, right, item));
    }
  });

  return stack[0] ?? 0;
};

export default function MyKeyboard() {
  const theme = React.useContext(ThemeContext);

  const [expressionTokens, setExpressionTokens] = React.useState<string[]>([]);
  const [currentInput, setCurrentInput] = React.useState("0");
  const [overwriteInput, setOverwriteInput] = React.useState(true);
  const [resultLocked, setResultLocked] = React.useState(false);
  const [historyDisplay, setHistoryDisplay] = React.useState("");
  const [lastOperator, setLastOperator] = React.useState<Operator | null>(null);
  const [lastOperand, setLastOperand] = React.useState<string | null>(null);

  const scrollRef = React.useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [contentWidth, setContentWidth] = React.useState(0);
  const [scrollX, setScrollX] = React.useState(0);
  const [userScrolling, setUserScrolling] = React.useState(false);
  const [shrinkDisplay, setShrinkDisplay] = React.useState(false);
  const latestHandlersRef = React.useRef({
    handleDigitPress: (digit: string) => {},
    handleOperatorPress: (_operator: Operator) => {},
    handleEquals: () => {},
    handleDelete: () => {},
    resetAll: () => {},
  });

  const resetAll = () => {
    setExpressionTokens([]);
    setCurrentInput("0");
    setOverwriteInput(true);
    setResultLocked(false);
    setHistoryDisplay("");
    setLastOperator(null);
    setLastOperand(null);
    setShrinkDisplay(false);
  };

  const startNewExpressionIfNeeded = () => {
    if (resultLocked) {
      setExpressionTokens([]);
      setHistoryDisplay("");
      setResultLocked(false);
      setLastOperator(null);
      setLastOperand(null);
      setShrinkDisplay(false);
    }
  };

  const handleDigitPress = (digit: string) => {
    startNewExpressionIfNeeded();

    if (overwriteInput) {
      if (digit === ".") {
        setCurrentInput("0.");
      } else if (digit === "0") {
        setCurrentInput("0");
      } else {
        setCurrentInput(digit);
      }
      setOverwriteInput(false);
      return;
    }

    if (digit === "." && currentInput.includes(".")) {
      return;
    }

    if (currentInput === "0" && digit !== ".") {
      setCurrentInput(digit);
      return;
    }

    setCurrentInput((prev) => {
      const next = `${prev}${digit}`;
      return next;
    });
  };

  const commitCurrentInput = React.useCallback((preserveFormat: boolean = false) => {
    if (currentInput === "Error") {
      return "0";
    }
    // Si queremos preservar el formato (ej: mantener "100" en lugar de convertirlo)
    if (preserveFormat) {
      return currentInput;
    }
    return sanitizeInputString(currentInput);
  }, [currentInput]);

  const handleOperatorPress = (operator: Operator) => {
    if (currentInput === "Error") {
      resetAll();
      return;
    }

    if (resultLocked) {
      setExpressionTokens([currentInput]);
      setResultLocked(false);
      setHistoryDisplay("");
    }

    const updatedTokens = [...expressionTokens];

    if (!overwriteInput || updatedTokens.length === 0) {
      // Mantener el número tal cual (preservar "100" en lugar de sanitizarlo)
      const committed = currentInput;
      if (updatedTokens.length === 0) {
        updatedTokens.push(committed);
      } else {
        updatedTokens.push(committed);
      }
    }

    if (updatedTokens.length && isOperator(updatedTokens[updatedTokens.length - 1])) {
      updatedTokens[updatedTokens.length - 1] = operator;
    } else {
      updatedTokens.push(operator);
    }

    setExpressionTokens(updatedTokens);
    setOverwriteInput(true);
  };

  const handleEquals = () => {
    if (currentInput === "Error") {
      resetAll();
      return;
    }

    if (resultLocked && lastOperator && lastOperand !== null && currentInput !== "Error") {
      const left = currentInput;
      const right = lastOperand;
      const tokens = [left, lastOperator, right];
      const rawResult = runOperation(parseFloat(left), parseFloat(right), lastOperator);
      const sanitized = sanitizeNumber(rawResult);

      setHistoryDisplay(tokens.join(" "));
      setCurrentInput(sanitized);
      setLastOperand(right);
      setResultLocked(true);
      setOverwriteInput(true);
      setShrinkDisplay(false);
      return;
    }

    const tokensForEvaluation = [...expressionTokens];

    if (!overwriteInput || tokensForEvaluation.length === 0) {
      // Mantener el valor actual tal cual (incluyendo "0")
      tokensForEvaluation.push(currentInput);
    }

    while (tokensForEvaluation.length && isOperator(tokensForEvaluation[tokensForEvaluation.length - 1])) {
      tokensForEvaluation.pop();
    }

    if (tokensForEvaluation.length < 2) {
      return;
    }

    // Procesar porcentajes antes de evaluar
    const processedTokens = tokensForEvaluation.map((token, index) => {
      // Si el token contiene %, procesarlo
      if (typeof token === 'string' && token.includes('%')) {
        const percentValue = parseFloat(token.replace('%', ''));
        
        // Si hay un operador antes y un número base
        if (index >= 2 && isOperator(tokensForEvaluation[index - 1])) {
          const baseValue = parseFloat(tokensForEvaluation[index - 2]);
          const operator = tokensForEvaluation[index - 1];
          
          // Para suma y resta, calcular el porcentaje del valor base
          if (operator === '+' || operator === '-') {
            return sanitizeNumber(baseValue * (percentValue / 100));
          }
        }
        
        // Para otros casos, convertir a decimal
        return sanitizeNumber(percentValue / 100);
      }
      return token;
    });

    const result = evaluateExpression(processedTokens);
    const sanitizedResult = sanitizeNumber(result);

    const operator =
      tokensForEvaluation.length >= 3
        ? (tokensForEvaluation[tokensForEvaluation.length - 2] as Operator)
        : null;
    const operand =
      tokensForEvaluation.length >= 2
        ? tokensForEvaluation[tokensForEvaluation.length - 1]
        : null;

    setHistoryDisplay(tokensForEvaluation.join(" "));
    setCurrentInput(sanitizedResult);
    setExpressionTokens([]);
    setOverwriteInput(true);
    setResultLocked(true);
    setShrinkDisplay(false);

    setLastOperator(operator);
    setLastOperand(operand);
  };

  const handleClear = () => {
    resetAll();
  };

  const handleDelete = () => {
    if (resultLocked) {
      resetAll();
      return;
    }

    if (currentInput === "Error") {
      resetAll();
      return;
    }

    if (overwriteInput && expressionTokens.length) {
      const tokens = [...expressionTokens];

      if (isOperator(tokens[tokens.length - 1])) {
        tokens.pop();
      }

      const lastNumber = tokens.pop();

      setExpressionTokens(tokens);
      setCurrentInput(lastNumber ?? "0");
      setOverwriteInput(false);
      return;
    }

    if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith("-"))) {
      setCurrentInput("0");
      setOverwriteInput(true);
      return;
    }

    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleToggleSign = () => {
    if (currentInput === "Error") {
      resetAll();
      return;
    }

    if (currentInput === "0") {
      return;
    }

    if (resultLocked) {
      setResultLocked(false);
      setHistoryDisplay("");
    }

    setCurrentInput((prev) => {
      if (prev.startsWith("-")) {
        return prev.slice(1);
      }
      return `-${prev}`;
    });
    setOverwriteInput(false);
  };

  const handlePercent = () => {
    if (currentInput === "Error") {
      resetAll();
      return;
    }

    startNewExpressionIfNeeded();

    // Agregar el símbolo % al número actual
    if (!currentInput.includes("%")) {
      setCurrentInput((prev) => `${prev}%`);
      setOverwriteInput(false);
    }
  };

  latestHandlersRef.current = {
    handleDigitPress,
    handleOperatorPress,
    handleEquals,
    handleDelete,
    resetAll,
  };

  React.useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement) {
        const tagName = activeElement.tagName.toLowerCase();
        if (tagName === "input" || tagName === "textarea" || activeElement.isContentEditable) {
          return;
        }
      }

      const handlers = latestHandlersRef.current;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handlers.handleDigitPress(event.key);
        return;
      }

      if (event.key === "." || event.key === "," || event.key === ";") {
        event.preventDefault();
        handlers.handleDigitPress(".");
        return;
      }

      if (event.key === "+" || event.key === "-") {
        event.preventDefault();
        handlers.handleOperatorPress(event.key as Operator);
        return;
      }

      if (event.key === "*" || event.key.toLowerCase() === "x") {
        event.preventDefault();
        handlers.handleOperatorPress(MULTIPLY_SYMBOL);
        return;
      }

      if (event.key === "/" || event.key === ":") {
        event.preventDefault();
        handlers.handleOperatorPress(DIVIDE_SYMBOL);
        return;
      }

      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        handlers.handleEquals();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        handlers.handleDelete();
        return;
      }

      if (event.key === "Delete" || event.key === "Escape") {
        event.preventDefault();
        handlers.resetAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const expressionDisplay = React.useMemo(() => {
    if (expressionTokens.length === 0 && (currentInput === "" || currentInput === "0") && !resultLocked) {
      return "0";
    }

    if (resultLocked) {
      return currentInput === "Error" ? "Error" : sanitizeInputString(currentInput);
    }

    if (currentInput === "Error") {
      return "Error";
    }

    const tokens = [...expressionTokens];
    if (!overwriteInput || tokens.length === 0) {
      const activeDisplay = currentInput === "" ? "0" : currentInput;
      tokens.push(activeDisplay);
    }

    return tokens.join(" ");
  }, [expressionTokens, currentInput, overwriteInput, resultLocked]);

  const mainDisplayContent = resultLocked ? expressionDisplay : expressionDisplay;

  const dynamicSizeStyle = React.useMemo(
    () => (shrinkDisplay ? Styles.mainDisplayTextMedium : null),
    [shrinkDisplay]
  );

  React.useEffect(() => {
    if (
      !shrinkDisplay &&
      !resultLocked &&
      containerWidth > 0 &&
      contentWidth > containerWidth - 24
    ) {
      setShrinkDisplay(true);
    }
  }, [contentWidth, containerWidth, shrinkDisplay, resultLocked]);

  React.useEffect(() => {
    if (userScrolling) {
      return;
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    });
    const target = Math.max(contentWidth - containerWidth, 0);
    setScrollX(target);
  }, [mainDisplayContent, resultLocked, userScrolling, contentWidth, containerWidth, shrinkDisplay]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  };

  const onContentSizeChange = (width: number, _height: number) => {
    setContentWidth(width);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const showLeftFade = contentWidth > containerWidth && scrollX > 2;

  const fadeColors: [string, string] =
    theme === "dark"
      ? [myColors.displayFadeDark || "rgba(9, 10, 18, 1)", "rgba(9, 10, 18, 0)"]
      : [myColors.displayFadeLight || "rgba(230, 235, 255, 1)", "rgba(230, 235, 255, 0)"];

  return (
    <View style={Styles.keyboardWrapper}>
      <View
        style={[
          Styles.displayWrapper,
          theme === "dark" ? Styles.displayWrapperDark : Styles.displayWrapperLight,
        ]}
      >
        <Text
          style={[
            Styles.historyText,
            theme === "dark" ? Styles.historyTextDark : Styles.historyTextLight,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {historyDisplay}
        </Text>
        <View style={Styles.displayScrollContainer} onLayout={onLayout}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={Styles.displayScrollContent}
            scrollEventThrottle={16}
            onScroll={onScroll}
            onScrollBeginDrag={() => setUserScrolling(true)}
            onScrollEndDrag={() => setUserScrolling(false)}
            onMomentumScrollEnd={() => setUserScrolling(false)}
            onContentSizeChange={onContentSizeChange}
          >
            <Text
              style={[
                Styles.mainDisplayText,
                theme === "dark" ? Styles.mainDisplayTextDark : Styles.mainDisplayTextLight,
                dynamicSizeStyle,
              ]}
              numberOfLines={1}
            >
              {mainDisplayContent}
            </Text>
          </ScrollView>
          {showLeftFade && (
            <LinearGradient
              pointerEvents="none"
              colors={fadeColors}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={Styles.fadeEdge}
            />
          )}
        </View>
      </View>

      <View style={Styles.rowsContainer}>
        <View style={Styles.row}>
          <Button title="AC" isUtility onPress={handleClear} />
          <Button title="±" isUtility onPress={handleToggleSign} />
          <Button title="%" isUtility onPress={handlePercent} />
          <Button title={DIVIDE_SYMBOL} isAccent onPress={() => handleOperatorPress(DIVIDE_SYMBOL)} />
        </View>
        <View style={Styles.row}>
          <Button title="7" onPress={() => handleDigitPress("7")} />
          <Button title="8" onPress={() => handleDigitPress("8")} />
          <Button title="9" onPress={() => handleDigitPress("9")} />
          <Button title={MULTIPLY_SYMBOL} isAccent onPress={() => handleOperatorPress(MULTIPLY_SYMBOL)} />
        </View>
        <View style={Styles.row}>
          <Button title="4" onPress={() => handleDigitPress("4")} />
          <Button title="5" onPress={() => handleDigitPress("5")} />
          <Button title="6" onPress={() => handleDigitPress("6")} />
          <Button title="-" isAccent onPress={() => handleOperatorPress("-")} />
        </View>
        <View style={Styles.row}>
          <Button title="1" onPress={() => handleDigitPress("1")} />
          <Button title="2" onPress={() => handleDigitPress("2")} />
          <Button title="3" onPress={() => handleDigitPress("3")} />
          <Button title="+" isAccent onPress={() => handleOperatorPress("+")} />
        </View>
        <View style={Styles.row}>
          <Button title="0" span onPress={() => handleDigitPress("0")} />
          <Button title="." onPress={() => handleDigitPress(".")} />
          <Button title="⌫" isUtility onPress={handleDelete} />
          <Button title="=" isAccent onPress={handleEquals} />
        </View>
      </View>
    </View>
  );
}

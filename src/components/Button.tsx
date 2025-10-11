import { useContext } from "react";
import { TouchableOpacity, Text } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { Styles } from "../styles/GlobalStyles";

interface ButtonProps {
  onPress: () => void;
  title: string;
  isAccent?: boolean;
  isUtility?: boolean;
  span?: boolean;
}

export default function Button({ title, onPress, isAccent, isUtility, span }: ButtonProps) {
  const theme = useContext(ThemeContext);

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
      ? Styles.buttonTextUtility
      : theme === "dark"
      ? Styles.buttonTextPrimaryDark
      : Styles.buttonTextPrimaryLight,
  ];

  return (
    <TouchableOpacity style={baseStyle} activeOpacity={0.7} onPress={onPress}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

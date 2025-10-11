import { StyleSheet, Platform } from "react-native";
import { myColors } from "./Colors";

export const Styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    paddingTop: 20,
    paddingHorizontal: 8,
    paddingBottom: 20,
    ...(Platform.OS !== "web" && { alignItems: "center" }),
  },
  rowsContainer: {
    width: "100%",
    flexGrow: 1,
    justifyContent: "flex-end",
    ...(Platform.OS !== "web" && { alignItems: "center" }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  displayWrapper: {
    width: "100%",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 24,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  displayWrapperLight: {
    backgroundColor: myColors.glassLight,
    borderColor: myColors.glassBorderLight,
  },
  displayWrapperDark: {
    backgroundColor: myColors.glassDark,
    borderColor: myColors.glassBorderDark,
  },
  historyText: {
    fontSize: 18,
    fontWeight: "300",
    marginBottom: 12,
    textAlign: "right",
  },
  historyTextLight: {
    color: myColors.historyLight,
  },
  historyTextDark: {
    color: myColors.historyDark,
  },
  mainDisplayText: {
    fontSize: 72,
    fontWeight: "300",
    letterSpacing: 0.5,
    textAlign: "right",
  },
  mainDisplayTextMedium: {
    fontSize: 64,
  },
  mainDisplayTextSmall: {
    fontSize: 52,
  },
  mainDisplayTextSmallest: {
    fontSize: 42,
  },
  mainDisplayTextTiny: {
    fontSize: 36,
  },
  mainDisplayTextLight: {
    color: myColors.primaryTextLight,
  },
  mainDisplayTextDark: {
    color: myColors.primaryTextDark,
  },
  displayScrollContainer: {
    width: "100%",
  },
  displayScrollContent: {
    flexGrow: 1,
    minHeight: 72,
    paddingRight: 16,
    alignItems: "center",
  },
  fadeEdge: {
    position: "absolute",
    left: -28,
    top: -32,
    bottom: -32,
    width: 36,
  },
  buttonBase: {
    flexGrow: 1,
    flexBasis: 76,
    height: 76,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  buttonSingle: {
    flex: 1,
  },
  buttonDouble: {
    flex: 2,
  },
  buttonAccent: {
    backgroundColor: myColors.accent,
    borderColor: myColors.accent,
    shadowColor: myColors.accent,
  },
  buttonPrimaryLight: {
    backgroundColor: myColors.buttonPrimaryLight,
    borderColor: myColors.glassBorderLight,
    shadowColor: myColors.shadowLight,
  },
  buttonPrimaryDark: {
    backgroundColor: myColors.buttonPrimaryDark,
    borderColor: myColors.glassBorderDark,
    shadowColor: myColors.shadowDark,
  },
  buttonUtilityLight: {
    backgroundColor: myColors.buttonUtilityLight,
    borderColor: myColors.buttonUtilityLight,
    shadowColor: myColors.shadowLight,
  },
  buttonUtilityDark: {
    backgroundColor: myColors.buttonUtilityDark,
    borderColor: myColors.buttonUtilityDark,
    shadowColor: myColors.shadowDark,
  },
  buttonText: {
    fontSize: 30,
    fontWeight: "500",
  },
  buttonTextAccent: {
    color: myColors.white,
  },
  buttonTextUtility: {
    color: myColors.utilityText,
  },
  buttonTextPrimaryLight: {
    color: myColors.primaryTextLight,
  },
  buttonTextPrimaryDark: {
    color: myColors.primaryTextDark,
  },
});

# Calculadora Pro (Expo)

Aplicación móvil de calculadora profesional con **diseño Liquid Glass** inspirado en Apple. Combina una interfaz estética moderna con una lógica compleja para la gestión de gastos compartidos, demostrando dominio en **React Native**, animaciones fluidas y persistencia de datos.

## Características Principales

### UI/UX Premium

* **Liquid Glass Effect:** Interfaz moderna basada en transparencias, desenfoques (BlurView) y sombras dinámicas.
* **Modo Claro/Oscuro:** Implementación de temas con transiciones suaves.
* **Totalmente Responsive:** Diseño adaptado para smartphones, tablets y entorno web.
* **Animaciones:** Feedback táctil y efectos *spring* con alto nivel de pulido.

### Funcionalidades Core

* **Calculadora Estándar:** Operaciones matemáticas completas, historial visible y manejo inteligente de porcentajes.
* **Gestor de Gastos Compartidos:** * Añadir múltiples conceptos con montos individuales.
* Sistema de propinas personalizables por ítem.
* Cálculo automático por persona en tiempo real.
* **Persistencia Local:** Guardado automático de datos mediante `AsyncStorage`.

## Stack Tecnológico

* **Frontend Core:** React Native (Expo), TypeScript.
* **Estilos y Animaciones:** Expo Blur, Linear Gradient, Styled Components (o lógica de estilos dinámicos).
* **Almacenamiento:** AsyncStorage para persistencia offline.
* **Plataformas:** iOS, Android y Web.

## Aspectos Técnicos Destacados (Para Entrevistas)

1. **Arquitectura Limpia:** Uso de **Context API** para la gestión global del tema y estados.
2. **Optimización:** Implementación de memoización (`useMemo`) y optimización de renderizado en listas de gastos.
3. **Animaciones Complejas:** Uso de layouts animados y física de resortes para una experiencia de usuario fluida.
4. **Lógica de Negocio:** Evaluación de expresiones matemáticas y algoritmos de división de gastos con impuestos/propinas.

## Instalación Rápida

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npx expo start

```

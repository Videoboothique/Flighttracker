import { NavigationContainer, DefaultTheme, NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { ChecklistScreen } from '../screens/ChecklistScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { FlightDetailScreen } from '../screens/FlightDetailScreen';
import { FlightFormScreen } from '../screens/FlightFormScreen';
import { FlightsListScreen } from '../screens/FlightsListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type FlightsStackParamList = {
  VluchtenLijst: undefined;
  VluchtAanmaken: undefined;
  VluchtDetail: { flightId: string };
  VluchtBewerken: { flightId: string };
};

export type RootTabParamList = {
  Dashboard: undefined;
  MijnVluchten: NavigatorScreenParams<FlightsStackParamList> | undefined;
  Checklist: undefined;
  Profiel: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<FlightsStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

function FlightsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="VluchtenLijst" component={FlightsListScreen} options={{ title: 'Mijn vluchten' }} />
      <Stack.Screen name="VluchtAanmaken" component={FlightFormScreen} options={{ title: 'Nieuwe vlucht' }} />
      <Stack.Screen name="VluchtDetail" component={FlightDetailScreen} options={{ title: 'Vluchtdetails' }} />
      <Stack.Screen name="VluchtBewerken" component={FlightFormScreen} options={{ title: 'Vlucht bewerken' }} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { isLoaded } = useAppContext();

  if (!isLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Gegevens worden geladen...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Tab.Screen name="MijnVluchten" component={FlightsStackNavigator} options={{ title: 'Mijn vluchten' }} />
        <Tab.Screen name="Checklist" component={ChecklistScreen} options={{ title: 'Checklist' }} />
        <Tab.Screen name="Profiel" component={ProfileScreen} options={{ title: 'Profiel' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 14,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  tabBar: {
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabBarLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';
import type { MainTabParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';

import HomeScreen from '@screens/home/HomeScreen';
import CardsScreen from '@screens/cards/CardsScreen';
import SendScreen from '@screens/send/SendScreen';
import EarningScreen from '@screens/earning/EarningScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Icon Assets ──────────────────────────────────────────────────────────────
const ICONS: Record<string, { active: any; inactive: any }> = {
    Home: {
        active: require('@assets/images/icons/navbar/home_active.png'),
        inactive: require('@assets/images/icons/navbar/home_inactive.png'),
    },
    Cards: {
        active: require('@assets/images/icons/navbar/card_active.png'),
        inactive: require('@assets/images/icons/navbar/card_inactive.png'),
    },
    Send: {
        active: require('@assets/images/icons/navbar/send_active.png'),
        inactive: require('@assets/images/icons/navbar/send_inactive.png'),
    },
    Earn: {
        active: require('@assets/images/icons/navbar/invest_active.png'),
        inactive: require('@assets/images/icons/navbar/invest_inactive.png'),
    },
    Profile: {
        active: require('@assets/images/icons/navbar/manage_active.png'),
        inactive: require('@assets/images/icons/navbar/manage_inactive.png'),
    },
};

// ─── Tab Labels ───────────────────────────────────────────────────────────────
const TAB_LABELS: Record<string, string> = {
    Home: 'Home',
    Cards: 'Card',
    Send: 'Send',
    Earn: 'Invest',
    Profile: 'Manage',
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────
export default function MainTabs(): React.ReactElement {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => {
                    const icons = ICONS[route.name];
                    if (!icons) return null;
                    return (
                        <Image
                            source={focused ? icons.active : icons.inactive}
                            style={s.icon}
                            resizeMode="contain"
                        />
                    );
                },
                tabBarLabel: TAB_LABELS[route.name] ?? route.name,
                tabBarStyle: {
                    backgroundColor: colors.tabBarBg,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 88,
                    paddingBottom: 30,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: colors.tabBarActive,
                tabBarInactiveTintColor: colors.tabBarInactive,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Cards" component={CardsScreen} />
            <Tab.Screen name="Send" component={SendScreen} />
            <Tab.Screen name="Earn" component={EarningScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    icon: {
        width: 26,
        height: 26,
    },
});

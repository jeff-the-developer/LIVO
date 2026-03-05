import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import type { MainTabParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';

import HomeScreen from '@screens/home/HomeScreen';
import CardsScreen from '@screens/cards/CardsScreen';
import SendScreen from '@screens/send/SendScreen';
import EarningScreen from '@screens/earning/EarningScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label }: { label: string }): React.ReactElement {
    const icons: Record<string, string> = {
        Home: '⌂',
        Cards: '▤',
        Send: '↑',
        Earn: '%',
        Profile: '○',
    };
    return (
        <Text style={{ fontSize: 18, lineHeight: 22 }}>{icons[label] ?? '•'}</Text>
    );
}

export default function MainTabs(): React.ReactElement {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: () => <TabIcon label={route.name} />,
                tabBarStyle: {
                    backgroundColor: colors.tabBarBackground,
                    borderTopColor: colors.tabBarBorder,
                    borderTopWidth: 1,
                    height: 88,
                    paddingBottom: 30,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: colors.tabBarActive,
                tabBarInactiveTintColor: colors.tabBarInactive,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 2,
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

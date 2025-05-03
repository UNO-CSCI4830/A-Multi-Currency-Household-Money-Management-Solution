import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name='index'
                options={{ tabBarLabel: 'Home', title: 'Home' }}
            />
            <Tabs.Screen
                name='accounts'
                options={{ tabBarLabel: 'Manage', title: 'Manage' }}
            />
            <Tabs.Screen
                name='account'
                options={{ tabBarLabel: 'Settings', title: 'Settings' }}
            />
        </Tabs>
    )
}
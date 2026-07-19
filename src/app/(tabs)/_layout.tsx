import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font } from '@/theme';

export const unstable_settings = { initialRouteName: 'home' };

/** Wraps a tab icon so the active tab shows a rounded indigo pill behind it. */
function TabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  return <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>{children}</View>;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: font.semibold, fontSize: 10 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.hairline,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="house"
        options={{
          title: '내 집',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name={focused ? 'office-building' : 'office-building-outline'}
                size={20}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 48,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.hairline },
});

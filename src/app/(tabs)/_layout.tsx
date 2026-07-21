import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { colors } from '@/theme';

export const unstable_settings = { initialRouteName: 'home' };

/** Wraps a tab icon so the active tab shows a rounded indigo pill behind it. */
function TabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  return <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>{children}</View>;
}

/** Minimal shape of the props React Navigation hands the `tabBar` renderer. */
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => ReactNode;
      };
    }
  >;
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

/**
 * Custom tab bar. React Navigation's default web label flex-shrinks to a few
 * pixels with `overflow: hidden`, clipping the bottoms of the Korean labels
 * (홈 / 내 집 / 마이페이지). Rendering the label ourselves as an `AppText`
 * sidesteps that layout entirely and gives us full control of the spacing.
 */
function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  // Web reports no bottom safe-area inset; give the bar a small cushion there.
  const bottomInset = insets.bottom || (Platform.OS === 'web' ? 12 : 0);

  return (
    <View style={[styles.bar, { height: 64 + bottomInset, paddingBottom: bottomInset + 8 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? colors.brand : colors.textSecondary;
        const label = typeof options.title === 'string' ? options.title : route.name;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            {options.tabBarIcon?.({ focused, color, size: 20 })}
            <AppText weight="semibold" color={color} style={styles.label}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...(props as unknown as TabBarProps)} />} screenOptions={{ headerShown: false }}>
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
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 4 },
  pressed: { opacity: 0.6 },
  label: { fontSize: 11, lineHeight: 15 },
  iconWrap: {
    width: 46,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.hairline },
});

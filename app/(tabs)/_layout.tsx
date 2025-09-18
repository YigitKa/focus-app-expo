import { Tabs } from 'expo-router';
import { Timer, SquareCheck as CheckSquare, ChartBar as BarChart3, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000011',
          borderTopColor: '#FF00FF',
          borderTopWidth: 2,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00FFFF',
        tabBarInactiveTintColor: '#666699',
        tabBarLabelStyle: {
          fontFamily: 'Courier New',
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'TIMER',
          tabBarIcon: ({ size, color }) => (
            <Timer size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'TASKS',
          tabBarIcon: ({ size, color }) => (
            <CheckSquare size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'STATS',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'CONFIG',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
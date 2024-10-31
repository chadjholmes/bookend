// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LibraryScreen from './src/screens/LibraryScreen';
import AddBookScreen from './src/screens/AddBookScreen';
import BookDetailsScreen from './src/screens/BookDetailsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddReadingSessionScreen from './src/screens/AddReadingSessionScreen';
import { BookProvider } from './src/context/BookContext';
import { ReadingSessionProvider } from './src/context/ReadingSessionContext';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/theme';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons or any preferred icon set

// Add this type definition at the top of the file, after imports
type LibraryStackParamList = {
  Library: undefined;
  AddBook: undefined;
  BookDetails: { bookId: string };
  AddReadingSession: { bookId: string };
};

const Stack = createStackNavigator<LibraryStackParamList>();
const Tab = createBottomTabNavigator();

// Stack Navigator for Library Screens
const LibraryStack = () => (
  <Stack.Navigator initialRouteName="Library">
    <Stack.Screen
      name="Library"
      component={LibraryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddBook"
      component={AddBookScreen}
      options={{ title: 'Add New Book' }}
    />
    <Stack.Screen
      name="BookDetails"
      component={BookDetailsScreen}
      options={{ title: 'Book Details' }}
    />
    <Stack.Screen
      name="AddReadingSession"
      component={AddReadingSessionScreen}
      options={{ title: 'Add Reading Session' }}
    />
  </Stack.Navigator>
);

// Stack Navigator for Dashboard Screens (if you have more screens in Dashboard)
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    {/* Add more Dashboard-related screens here */}
  </Stack.Navigator>
);

const App: React.FC = () => {
  return (
    <BookProvider>
      <ReadingSessionProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <Tab.Navigator
              initialRouteName="Library"
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: string = '';

                  if (route.name === 'Library') {
                    iconName = focused ? 'book' : 'book-outline';
                  } else if (route.name === 'Dashboard') {
                    iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                  }

                  // Return the appropriate icon
                  return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false, // Hide header for Tab Navigator
              })}
            >
              <Tab.Screen name="Library" component={LibraryStack} />
              <Tab.Screen name="Dashboard" component={DashboardStack} />
            </Tab.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </ReadingSessionProvider>
    </BookProvider>
  );
};

export default App;
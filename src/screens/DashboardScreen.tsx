// src/screens/DashboardScreen.tsx

import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ReadingSessionContext } from '../context/ReadingSessionContext';
import TotalPagesChart from '../components/TotalPagesChart';
import TimeSpentChart from '../components/TimeSpentChart';
import { ReadingSession } from '../models/ReadingSession';

const DashboardScreen: React.FC = () => {
  const { sessions } = useContext(ReadingSessionContext);
  const [allSessions, setAllSessions] = useState<ReadingSession[]>([]);

  useEffect(() => {
    // Fetch all sessions from all books
    // Implement a service method to get all sessions
    const fetchAllSessions = async () => {
      // Assuming getAllSessions is implemented
      const fetchedSessions = await getAllSessions();
      setAllSessions(fetchedSessions);
    };
    fetchAllSessions();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Reading Dashboard</Text>

      <Text style={styles.subHeader}>Total Pages Read Over Time</Text>
      <TotalPagesChart sessions={allSessions} />

      <Text style={styles.subHeader}>Time Spent Reading</Text>
      <TimeSpentChart sessions={allSessions} />

      {/* Add more charts like Genre Distribution, Books Completed, etc. */}
    </ScrollView>
  );
};

// Dummy implementation for getAllSessions
// Replace with actual implementation
const getAllSessions = async (): Promise<ReadingSession[]> => {
  // Implement fetching all reading sessions across books
  return [];
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default DashboardScreen;
// src/screens/BookDetailsScreen.tsx

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { BookContext } from '../context/BookContext';
import { Book } from '../models/Book';
import { ReadingSession } from '../models/ReadingSession';
import { getReadingSessions } from '../services/ReadingSessionService';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  BookDetails: { bookId: number };
  AddReadingSession: { bookId: number };
  EditBook: { book: Book };
};

type BookDetailsScreenRouteProp = RouteProp<RootStackParamList, 'BookDetails'>;
type BookDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BookDetails'>;

const BookDetailsScreen: React.FC = () => {
  const route = useRoute<BookDetailsScreenRouteProp>();
  const navigation = useNavigation<BookDetailsScreenNavigationProp>();
  const { books } = useContext(BookContext);
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);

  useEffect(() => {
    const currentBook = books.find(b => b.id === route.params.bookId);
    setBook(currentBook);
    fetchSessions(route.params.bookId);
  }, [books, route.params.bookId]);

  const fetchSessions = async (bookId: number) => {
    const fetchedSessions = await getReadingSessions(bookId);
    setSessions(fetchedSessions);
  };

  if (!book) {
    return (
      <View style={styles.container}>
        <Text>Book not found.</Text>
      </View>
    );
  }

  const renderSession = ({ item }: { item: ReadingSession }) => (
    <View style={styles.sessionItem}>
      <Text style={styles.sessionDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text>Duration: {item.duration} mins</Text>
      <Text>Pages Read: {item.pagesRead}</Text>
      {item.notes ? <Text>Notes: {item.notes}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {book.coverImage ? (
        <Image source={{ uri: book.coverImage }} style={styles.coverImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>by {book.author}</Text>
      {book.genre ? <Text>Genre: {book.genre}</Text> : null}
      {book.totalPages ? <Text>Total Pages: {book.totalPages}</Text> : null}
      {book.currentPage && book.totalPages ? (
        <Text>
          Progress: {book.currentPage}/{book.totalPages} pages
        </Text>
      ) : null}
      {book.startDate ? <Text>Start Date: {new Date(book.startDate).toLocaleDateString()}</Text> : null}
      {book.endDate ? <Text>End Date: {new Date(book.endDate).toLocaleDateString()}</Text> : null}
      {book.notes ? <Text>Notes: {book.notes}</Text> : null}

      <Button
        title="Edit Book"
        onPress={() => navigation.navigate('EditBook', { book })}
      />

      <View style={styles.sessionsHeader}>
        <Text style={styles.sessionsTitle}>Reading Sessions</Text>
        <TouchableOpacity onPress={() => book?.id && navigation.navigate('AddReadingSession', { bookId: book.id })}>
          <Text style={styles.addSession}>+ Add Session</Text>
        </TouchableOpacity>
      </View>

      {sessions.length === 0 ? (
        <Text>No reading sessions logged yet.</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderSession}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  coverImage: {
    width: 100,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 100,
    height: 150,
    alignSelf: 'center',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  author: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addSession: {
    color: '#007AFF',
    fontSize: 16,
  },
  sessionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sessionDate: {
    fontWeight: 'bold',
  },
});

export default BookDetailsScreen;
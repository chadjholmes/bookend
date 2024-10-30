// src/screens/LibraryScreen.tsx

import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BookContext } from '../context/BookContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Book } from '../models/Book';
import { FAB } from 'react-native-paper';

type LibraryScreenNavigationProp = StackNavigationProp<any, 'Library'>;

const LibraryScreen: React.FC = () => {
  const { books } = useContext(BookContext);
  const navigation = useNavigation<LibraryScreenNavigationProp>();

  const renderItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('BookDetails', { bookId: item.id })}
    >
      {item.coverImage ? (
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>by {item.author}</Text>
        {item.currentPage && item.totalPages ? (
          <Text style={styles.progress}>
            {item.currentPage}/{item.totalPages} pages
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books added yet.</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
        />
      )}
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => navigation.navigate('AddBook')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  coverImage: {
    width: 50,
    height: 75,
    marginRight: 10,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 50,
    height: 75,
    marginRight: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  author: {
    color: '#555',
  },
  progress: {
    marginTop: 5,
    color: '#007AFF',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#777',
    fontSize: 16,
  },
});

export default LibraryScreen;
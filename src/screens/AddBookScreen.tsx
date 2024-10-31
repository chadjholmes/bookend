// src/screens/AddBookScreen.tsx

import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { Formik, FormikProps, FormikHandlers } from 'formik';
import * as Yup from 'yup';
import { BookContext } from '../context/BookContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Book } from '../models/Book';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

type AddBookScreenNavigationProp = StackNavigationProp<any, 'AddBook'>;

interface BookFormValues {
  title: string;
  author: string;
  genre: string;
  totalPages: string;
  startDate: string;
  notes: string;
}

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
  cover_i?: number;
}

const BookSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  author: Yup.string().required('Author is required'),
  genre: Yup.string().required('Genre is required'),
  totalPages: Yup.number().integer().positive('Must be a positive number'),
  startDate: Yup.date()
    .transform((value, originalValue) => {
      if (originalValue && typeof originalValue === 'string') {
        const date = new Date(originalValue);
        return isNaN(date.getTime()) ? undefined : date;
      }
      return value;
    })
    .max(new Date(), "Start date cannot be in the future")
    .typeError('Please enter a valid date (YYYY-MM-DD)')
    .nullable()
});

const AddBookScreen: React.FC = () => {
  const { addNewBook } = useContext(BookContext);
  const navigation = useNavigation<AddBookScreenNavigationProp>();
  const [coverImageUri, setCoverImageUri] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OpenLibraryBook[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formikSetFieldValue, setFormikSetFieldValue] = useState<((field: string, value: any) => void) | null>(null);

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.5,
      },
      (response: any) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets?.[0]?.uri) {
          setCoverImageUri(response.assets[0].uri);
        }
      }
    );
  };

  const searchBooks = async (query: string) => {
    if (query.length < 2) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&fields=key,title,author_name,first_publish_year,number_of_pages_median,subject,cover_i&limit=10`
      );
      const data = await response.json();
      setSearchResults(data.docs || []);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSelect = async (book: OpenLibraryBook) => {
    try {
      const workResponse = await fetch(`https://openlibrary.org${book.key}.json`);
      const workData = await workResponse.json();

      if (book.cover_i) {
        setCoverImageUri(`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`);
      }

      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);

      return {
        title: book.title || '',
        author: book.author_name ? book.author_name[0] : '',
        genre: workData.subjects ? workData.subjects[0] : '',
        totalPages: book.number_of_pages_median?.toString() || ''
      };

    } catch (error) {
      console.error('Error fetching book details:', error);
      return null;
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Only hide on Android
    if (event.type === 'set' && date && formikSetFieldValue) {
      setSelectedDate(date);
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      formikSetFieldValue('startDate', formattedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={{ title: '', author: '', genre: '', totalPages: '', startDate: '', notes: '' }}
        validationSchema={BookSchema}
        onSubmit={async (values: {
          title: string;
          author: string;
          genre: string;
          totalPages: string;
          startDate: string;
          notes: string;
        }) => {
          try {
            setIsSubmitting(true);
            const newBook: Book = {
              title: values.title.trim(),
              author: values.author.trim(),
              genre: values.genre,
              coverImage: coverImageUri,
              totalPages: values.totalPages ? parseInt(values.totalPages) : undefined,
              startDate: values.startDate,
              notes: values.notes?.trim(),
              currentPage: 0,
            };
            await addNewBook(newBook);
            navigation.goBack();
          } catch (error) {
            console.error('Error adding book:', error);
            // You might want to show an error message to the user here
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => {
          React.useEffect(() => {
            setFormikSetFieldValue(() => setFieldValue);
          }, [setFieldValue]);

          return (
            <View>
              <Text>Title</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                value={values.title}
              />
              {errors.title && touched.title ? <Text style={styles.error}>{errors.title}</Text> : null}

              <Text>Author</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('author')}
                onBlur={handleBlur('author')}
                value={values.author}
              />
              {errors.author && touched.author ? <Text style={styles.error}>{errors.author}</Text> : null}

              <View style={styles.formGroup}>
                <Text>Genre</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={styles.inputText}>
                    {values.genre || 'Select Genre'}
                  </Text>
                </TouchableOpacity>
                {errors.genre && touched.genre ? (
                  <Text style={styles.error}>{errors.genre}</Text>
                ) : null}
                
                <Modal
                  visible={showPicker}
                  transparent={true}
                  animationType="slide"
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <SafeAreaView>
                        <View style={styles.modalHeader}>
                          <TouchableOpacity onPress={() => setShowPicker(false)}>
                            <Text style={styles.doneButton}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <Picker
                          selectedValue={values.genre}
                          onValueChange={handleChange('genre')}
                        >
                          <Picker.Item label="Select Genre" value="" />
                          <Picker.Item label="Fiction" value="Fiction" />
                          <Picker.Item label="Non-Fiction" value="Non-Fiction" />
                          <Picker.Item label="Mystery" value="Mystery" />
                          <Picker.Item label="Fantasy" value="Fantasy" />
                          <Picker.Item label="Biography" value="Biography" />
                        </Picker>
                      </SafeAreaView>
                    </View>
                  </View>
                </Modal>
              </View>

              <Text>Total Pages</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('totalPages')}
                onBlur={handleBlur('totalPages')}
                value={values.totalPages}
                keyboardType="numeric"
              />
              {errors.totalPages && touched.totalPages ? <Text style={styles.error}>{errors.totalPages}</Text> : null}

              <View style={styles.formGroup}>
                <Text>Start Date</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.inputText}>
                    {values.startDate || 'Select Date'}
                  </Text>
                </TouchableOpacity>
                {errors.startDate && touched.startDate ? (
                  <Text style={styles.error}>{errors.startDate}</Text>
                ) : null}

                {(showDatePicker || Platform.OS === 'ios') && (
                  <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <SafeAreaView>
                          <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                              <Text style={styles.doneButton}>Done</Text>
                            </TouchableOpacity>
                          </View>
                          <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                          />
                        </SafeAreaView>
                      </View>
                    </View>
                  </Modal>
                )}
              </View>

              <Text>Notes</Text>
              <TextInput
                style={styles.textArea}
                onChangeText={handleChange('notes')}
                onBlur={handleBlur('notes')}
                value={values.notes}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity style={styles.photoButton} onPress={handleChoosePhoto}>
                <Text style={styles.photoButtonText}>Choose Cover Image</Text>
              </TouchableOpacity>
              {coverImageUri ? (
                <Image source={{ uri: coverImageUri }} style={styles.coverPreview} />
              ) : null}

              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Text style={styles.searchButtonText}>Search by Title</Text>
              </TouchableOpacity>

              <Modal
                visible={showSearch}
                animationType="slide"
                transparent={true}
              >
                <SafeAreaView style={styles.searchModal}>
                  <View style={styles.searchHeader}>
                    <TouchableOpacity onPress={() => setShowSearch(false)}>
                      <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by title"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => searchBooks(searchQuery)}
                  >
                    <Text style={styles.searchButtonText}>Search</Text>
                  </TouchableOpacity>
                  {isLoading && (
                    <ActivityIndicator size="small" color="#0000ff" />
                  )}
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.searchResult}
                        onPress={async () => {
                          const bookDetails = await handleBookSelect(item);
                          if (bookDetails) {
                            setFieldValue('title', bookDetails.title);
                            setFieldValue('author', bookDetails.author);
                            setFieldValue('genre', bookDetails.genre);
                            setFieldValue('totalPages', bookDetails.totalPages);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.resultContent}>
                          <Text style={styles.bookTitle}>{item.title}</Text>
                          {item.author_name && (
                            <Text style={styles.bookAuthor}>by {item.author_name[0]}</Text>
                          )}
                          {item.first_publish_year && (
                            <Text style={styles.bookYear}>Published: {item.first_publish_year}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      searchQuery.length > 0 && !isLoading ? (
                        <Text style={styles.noResults}>No books found</Text>
                      ) : null
                    }
                  />
                </SafeAreaView>
              </Modal>

              <Button 
                onPress={() => handleSubmit()} 
                title={isSubmitting ? "Adding..." : "Add Book"} 
                disabled={isSubmitting}
              />
            </View>
          );
        }}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  picker: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
  },
  pickerItem: {
    fontSize: 16,
    color: '#000000',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  photoButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  coverPreview: {
    width: 100,
    height: 150,
    marginBottom: 10,
    alignSelf: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  inputText: {
    fontSize: 16,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchModal: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  searchHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  searchResult: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  resultContent: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#007AFF',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
  bookYear: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  noResults: {
    color: '#999',
    marginBottom: 10,
  },
});

export default AddBookScreen;
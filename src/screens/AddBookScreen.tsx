// src/screens/AddBookScreen.tsx

import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { BookContext } from '../context/BookContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Book } from '../models/Book';
import { Picker } from '@react-native-picker/picker';

type AddBookScreenNavigationProp = StackNavigationProp<any, 'AddBook'>;

const BookSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  author: Yup.string().required('Author is required'),
  totalPages: Yup.number().integer().positive('Must be a positive number'),
  // Additional validations as needed
});

const AddBookScreen: React.FC = () => {
  const { addNewBook } = useContext(BookContext);
  const navigation = useNavigation<AddBookScreenNavigationProp>();
  const [coverImageUri, setCoverImageUri] = useState<string | undefined>(undefined);

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.5,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setCoverImageUri(response.assets[0].uri);
        }
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={{ title: '', author: '', genre: '', totalPages: '', startDate: '', notes: '' }}
        validationSchema={BookSchema}
        onSubmit={async (values) => {
          const newBook: Book = {
            title: values.title,
            author: values.author,
            genre: values.genre,
            coverImage: coverImageUri,
            totalPages: values.totalPages ? parseInt(values.totalPages) : undefined,
            startDate: values.startDate,
            notes: values.notes,
            currentPage: 0,
          };
          await addNewBook(newBook);
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
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

            <Text>Genre</Text>
            <Picker
              selectedValue={values.genre}
              onValueChange={handleChange('genre')}
              style={styles.picker}
            >
              <Picker.Item label="Select Genre" value="" />
              <Picker.Item label="Fiction" value="Fiction" />
              <Picker.Item label="Non-Fiction" value="Non-Fiction" />
              <Picker.Item label="Mystery" value="Mystery" />
              <Picker.Item label="Fantasy" value="Fantasy" />
              <Picker.Item label="Biography" value="Biography" />
              {/* Add more genres as needed */}
            </Picker>
            {errors.genre && touched.genre ? <Text style={styles.error}>{errors.genre}</Text> : null}

            <Text>Total Pages</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('totalPages')}
              onBlur={handleBlur('totalPages')}
              value={values.totalPages}
              keyboardType="numeric"
            />
            {errors.totalPages && touched.totalPages ? <Text style={styles.error}>{errors.totalPages}</Text> : null}

            <Text>Start Date</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('startDate')}
              onBlur={handleBlur('startDate')}
              value={values.startDate}
              placeholder="YYYY-MM-DD"
            />
            {errors.startDate && touched.startDate ? <Text style={styles.error}>{errors.startDate}</Text> : null}

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

            <Button onPress={() => handleSubmit()} title="Add Book" />
          </View>
        )}
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
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
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
});

export default AddBookScreen;
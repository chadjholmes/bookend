// src/screens/AddReadingSessionScreen.tsx

import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ReadingSession } from '../models/ReadingSession';
import { ReadingSessionContext } from '../context/ReadingSessionContext';
import { BookContext } from '../context/BookContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

interface AddReadingSessionScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'AddReadingSession'>;
}

const SessionSchema = Yup.object().shape({
  bookId: Yup.number().required('Book is required'),
  date: Yup.date().required('Date is required'),
  duration: Yup.number().integer().positive('Duration must be a positive number').required('Duration is required'),
  pagesRead: Yup.number().integer().positive('Pages read must be a positive number').required('Pages read is required'),
  notes: Yup.string(),
});

const AddReadingSessionScreen: React.FC<AddReadingSessionScreenProps> = ({ navigation }) => {
  const { addReadingSession } = useContext(ReadingSessionContext);
  const { books } = useContext(BookContext);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={{ bookId: 0, date: new Date().toISOString(), duration: '', pagesRead: '', notes: '' }}
        validationSchema={SessionSchema}
        onSubmit={async (values) => {
          const newSession: ReadingSession = {
            bookId: values.bookId,
            date: values.date,
            duration: parseInt(values.duration),
            pagesRead: parseInt(values.pagesRead),
            notes: values.notes,
          };
          await addReadingSession(newSession);
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View>
            <Text>Select Book</Text>
            <Picker
              selectedValue={values.bookId}
              onValueChange={(itemValue: any) => setFieldValue('bookId', itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a book" value={0} />
              {books.map((book) => (
                <Picker.Item key={book.id} label={book.title} value={book.id} />
              ))}
            </Picker>
            {errors.bookId && touched.bookId ? <Text style={styles.error}>{errors.bookId}</Text> : null}

            <Text>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>{new Date(values.date).toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(values.date)}
                mode="date"
                display="default"
                onChange={(event: any, selectedDate?: Date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setFieldValue('date', selectedDate.toISOString());
                  }
                }}
              />
            )}
            {errors.date && touched.date ? <Text style={styles.error}>{errors.date}</Text> : null}

            <Text>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('duration')}
              onBlur={handleBlur('duration')}
              value={values.duration}
              keyboardType="numeric"
            />
            {errors.duration && touched.duration ? <Text style={styles.error}>{errors.duration}</Text> : null}

            <Text>Pages Read</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('pagesRead')}
              onBlur={handleBlur('pagesRead')}
              value={values.pagesRead}
              keyboardType="numeric"
            />
            {errors.pagesRead && touched.pagesRead ? <Text style={styles.error}>{errors.pagesRead}</Text> : null}

            <Text>Notes</Text>
            <TextInput
              style={styles.textArea}
              onChangeText={handleChange('notes')}
              onBlur={handleBlur('notes')}
              value={values.notes}
              multiline
              numberOfLines={4}
            />
            {errors.notes && touched.notes ? <Text style={styles.error}>{errors.notes}</Text> : null}

            <Button onPress={() => handleSubmit()} title="Log Reading Session" />
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
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
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
  error: {
    color: 'red',
    marginBottom: 10,
  },
  datePickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  datePickerText: {
    color: '#333',
  },
});

export default AddReadingSessionScreen;
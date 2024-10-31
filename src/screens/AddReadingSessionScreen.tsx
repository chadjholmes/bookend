// src/screens/AddReadingSessionScreen.tsx

import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, SafeAreaView } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ReadingSession } from '../models/ReadingSession';
import { ReadingSessionContext } from '../context/ReadingSessionContext';
import { BookContext } from '../context/BookContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';

type AddReadingSessionScreenProps = {
  route: { params: { bookId: string } };
  navigation: any; // Or use proper navigation type
};

const SessionSchema = Yup.object().shape({
  bookId: Yup.number().required('Book is required'),
  date: Yup.date().required('Date is required'),
  duration: Yup.number().integer().positive('Duration must be a positive number').required('Duration is required'),
  pagesRead: Yup.number().integer().positive('Pages read must be a positive number').required('Pages read is required'),
  notes: Yup.string(),
});

const AddReadingSessionScreen: React.FC<AddReadingSessionScreenProps> = ({ navigation, route }) => {
  const { addReadingSession } = useContext(ReadingSessionContext);
  const { books } = useContext(BookContext);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formikSetFieldValue, setFormikSetFieldValue] = useState<((field: string, value: any) => void) | null>(null);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && date && formikSetFieldValue) {
      setSelectedDate(date);
      formikSetFieldValue('date', date.toISOString());
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={{ 
          bookId: route.params.bookId,
          date: new Date().toISOString(),
          duration: '',
          pagesRead: '',
          notes: ''
        }}
        validationSchema={SessionSchema}
        onSubmit={async (values) => {
          const newSession: ReadingSession = {
            bookId: parseInt(values.bookId),
            date: values.date,
            duration: parseInt(values.duration),
            pagesRead: parseInt(values.pagesRead),
            notes: values.notes,
          };
          await addReadingSession(newSession);
          navigation.goBack();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => {
          React.useEffect(() => {
            setFormikSetFieldValue(() => setFieldValue);
          }, [setFieldValue]);

          return (
            <View>
              <View style={styles.formGroup}>
                <Text>Select Book</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={styles.inputText}>
                    {books.find(b => b.id === Number(values.bookId))?.title || 'Select a book'}
                  </Text>
                </TouchableOpacity>
                {errors.bookId && touched.bookId ? 
                  <Text style={styles.error}>{errors.bookId}</Text>
                : null}

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
                          selectedValue={values.bookId}
                          onValueChange={(itemValue: any) => setFieldValue('bookId', itemValue)}
                        >
                          <Picker.Item label="Select a book" value={0} />
                          {books.map((book) => (
                            <Picker.Item key={book.id} label={book.title} value={book.id} />
                          ))}
                        </Picker>
                      </SafeAreaView>
                    </View>
                  </View>
                </Modal>
              </View>

              <View style={styles.formGroup}>
                <Text>Date</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.inputText}>
                    {new Date(values.date).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {errors.date && touched.date ? 
                  <Text style={styles.error}>{errors.date}</Text> 
                : null}

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
                          value={selectedDate}
                          mode="date"
                          display="spinner"
                          onChange={handleDateChange}
                          maximumDate={new Date()}
                        />
                      </SafeAreaView>
                    </View>
                  </View>
                </Modal>
              </View>

              <View style={styles.formGroup}>
                <Text>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('duration')}
                  onBlur={handleBlur('duration')}
                  value={values.duration}
                  keyboardType="numeric"
                />
                {errors.duration && touched.duration ? 
                  <Text style={styles.error}>{errors.duration}</Text> 
                : null}
              </View>

              <View style={styles.formGroup}>
                <Text>Pages Read</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('pagesRead')}
                  onBlur={handleBlur('pagesRead')}
                  value={values.pagesRead}
                  keyboardType="numeric"
                />
                {errors.pagesRead && touched.pagesRead ? 
                  <Text style={styles.error}>{errors.pagesRead}</Text> 
                : null}
              </View>

              <View style={styles.formGroup}>
                <Text>Notes</Text>
                <TextInput
                  style={styles.textArea}
                  onChangeText={handleChange('notes')}
                  onBlur={handleBlur('notes')}
                  value={values.notes}
                  multiline
                  numberOfLines={4}
                />
                {errors.notes && touched.notes ? 
                  <Text style={styles.error}>{errors.notes}</Text> 
                : null}
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => handleSubmit()}
              >
                <Text style={styles.submitButtonText}>Log Reading Session</Text>
              </TouchableOpacity>
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
  formGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  inputText: {
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
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
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddReadingSessionScreen;
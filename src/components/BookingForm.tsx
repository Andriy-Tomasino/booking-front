import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth } from '../../firebaseConfig';

export default function BookingForm({ computerId, visible, onClose, onBookingSuccess }) {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Форматирование для отображения
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const formatTime = (date) => {
    return date.toTimeString().slice(0, 5); // HH:mm
  };

  // Обработка изменений для веба
  const handleWebDateChange = (value) => {
    console.log('[BookingForm] Web date input:', value);
    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      // Создаём новые объекты Date для избежания мутации
      const newStartTime = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), startTime.getHours(), startTime.getMinutes());
      const newEndTime = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), endTime.getHours(), endTime.getMinutes());
      setDate(newDate);
      setStartTime(newStartTime);
      setEndTime(newEndTime);
      console.log('[BookingForm] Web date updated:', { date: newDate.toISOString(), startTime: newStartTime.toISOString(), endTime: newEndTime.toISOString() });
    } else {
      console.warn('[BookingForm] Invalid date:', value);
      setError('Invalid date format');
    }
  };

  const handleWebTimeChange = (value, setter) => {
    console.log('[BookingForm] Web time input:', value);
    const [hours, minutes] = value.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const newTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
      setter(newTime);
      console.log('[BookingForm] Web time updated:', newTime.toISOString());
    } else {
      console.warn('[BookingForm] Invalid time:', value);
      setError('Invalid time format');
    }
  };

  // Обработка изменений для мобильных
  const handleDateChange = (event, selectedDate) => {
    console.log('[BookingForm] Mobile date change:', { event, selectedDate });
    setShowDatePicker(false);
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      const newDate = new Date(selectedDate);
      const newStartTime = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), startTime.getHours(), startTime.getMinutes());
      const newEndTime = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), endTime.getHours(), endTime.getMinutes());
      setDate(newDate);
      setStartTime(newStartTime);
      setEndTime(newEndTime);
      console.log('[BookingForm] Mobile date updated:', { date: newDate.toISOString(), startTime: newStartTime.toISOString(), endTime: newEndTime.toISOString() });
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    console.log('[BookingForm] Mobile start time change:', { event, selectedTime });
    setShowStartTimePicker(false);
    if (selectedTime && !isNaN(selectedTime.getTime())) {
      const newStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), selectedTime.getHours(), selectedTime.getMinutes());
      setStartTime(newStartTime);
      console.log('[BookingForm] Mobile startTime updated:', newStartTime.toISOString());
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    console.log('[BookingForm] Mobile end time change:', { event, selectedTime });
    setShowEndTimePicker(false);
    if (selectedTime && !isNaN(selectedTime.getTime())) {
      const newEndTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), selectedTime.getHours(), selectedTime.getMinutes());
      setEndTime(newEndTime);
      console.log('[BookingForm] Mobile endTime updated:', newEndTime.toISOString());
    }
  };

  const handleSubmit = async () => {
    if (startTime >= endTime) {
      setError('Start time must be before end time');
      console.log('[BookingForm] Validation failed: startTime >= endTime', { startTime: startTime.toISOString(), endTime: endTime.toISOString() });
      return;
    }

    console.log('[BookingForm] Submitting booking:', { computerId, startTime: startTime.toISOString(), endTime: endTime.toISOString() });

    setIsLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const idToken = await user.getIdToken(true);
      console.log('[BookingForm] idToken:', idToken);
      const response = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          computerId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('[BookingForm] Backend error:', errorData);
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const booking = await response.json();
      console.log('[BookingForm] Booking created:', booking);
      Alert.alert('Success', 'Booking created successfully!');
      onBookingSuccess();
      onClose();
    } catch (err) {
      console.error('[BookingForm] Error:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Booking</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          {Platform.OS === 'web' ? (
            <>
              <TextInput
                style={styles.input}
                value={formatDate(date)}
                onChangeText={handleWebDateChange}
                type="date"
                placeholder="Select Date"
              />
              <TextInput
                style={styles.input}
                value={formatTime(startTime)}
                onChangeText={(value) => handleWebTimeChange(value, setStartTime)}
                type="time"
                placeholder="Start Time"
              />
              <TextInput
                style={styles.input}
                value={formatTime(endTime)}
                onChangeText={(value) => handleWebTimeChange(value, setEndTime)}
                type="time"
                placeholder="End Time"
              />
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text>{formatDate(date)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.input}>
                <Text>Start Time: {formatTime(startTime)}</Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onChange={handleStartTimeChange}
                />
              )}

              <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.input}>
                <Text>End Time: {formatTime(endTime)}</Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="default"
                  onChange={handleEndTimeChange}
                />
              )}
            </>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Booking...' : 'Book'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#4285F4',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
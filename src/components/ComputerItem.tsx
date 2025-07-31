import React from 'react';
   import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
   import { useRouter } from 'expo-router';

   export default function ComputerItem({ computer }) {
     const router = useRouter();

     // Форматирование дат
     const formatDateTime = (date) => {
       if (!date) return '';
       return new Date(date).toLocaleString('en-US', {
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
       });
     };

     return (
       <TouchableOpacity
         style={styles.container}
         onPress={() => router.push(`/computer/${computer._id}`)}
       >
         <Text style={styles.name}>{computer.name}</Text>
         <View style={styles.info}>
           <Text style={styles.status}>Status: {computer.status}</Text>
           {computer.nextBooking && (
             <Text style={styles.booking}>
               Next Booking: {formatDateTime(computer.nextBooking.startTime)} - {formatDateTime(computer.nextBooking.endTime)}
             </Text>
           )}
         </View>
       </TouchableOpacity>
     );
   }

   const styles = StyleSheet.create({
     container: {
       padding: 16,
       marginVertical: 8,
       backgroundColor: '#fff',
       borderRadius: 8,
       boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
     },
     name: {
       fontSize: 18,
       fontWeight: 'bold',
     },
     info: {
       marginTop: 8,
     },
     status: {
       fontSize: 14,
       color: '#666',
     },
     booking: {
       fontSize: 14,
       color: '#333',
       marginTop: 4,
     },
   });
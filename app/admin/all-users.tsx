// app/admin/all-users.tsx
import { View, FlatList } from 'react-native';
import { List, Button } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

export default function AllUsers() {
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => api.get('/users/all').then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: async (uid) => api.delete(`/users/${uid}`),
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <List.Item
          title={`${item.firstName || 'N/A'} ${item.lastName || 'N/A'}`}
          description={`Нік: ${item.nickname || 'N/A'}, Телефон: ${item.phoneNumber || 'N/A'}, Email: ${item.email || 'N/A'}, Роль: ${item.role || 'N/A'}`}
          right={() => <Button onPress={() => deleteMutation.mutate(item.uid)}>Видалити</Button>}
        />
      )}
      keyExtractor={item => item.uid}
    />
  );
}
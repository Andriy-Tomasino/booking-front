import { View, FlatList } from 'react-native';
import { List, Button } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

export default function NewUsers() {
  const queryClient = useQueryClient();

  const { data: pendings = [] } = useQuery({
    queryKey: ['pendings'],
    queryFn: async () => api.get('/registrations').then(res => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: async (id) => api.post(`/registrations/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries(['pendings']),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => api.delete(`/registrations/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['pendings']),
  });

  return (
    <FlatList
      data={pendings}
      renderItem={({ item }) => (
        <List.Item
          title={`${item.firstName} ${item.lastName}`}
          description={`Нік: ${item.nickname}, Тел: ${item.phoneNumber}`}
          right={() => (
            <View style={{ flexDirection: 'row' }}>
              <Button onPress={() => approveMutation.mutate(item._id)}>Додати</Button>
              <Button onPress={() => rejectMutation.mutate(item._id)}>Відхилити</Button>
            </View>
          )}
        />
      )}
      keyExtractor={item => item._id}
    />
  );
}
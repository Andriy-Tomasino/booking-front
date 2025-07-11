import { Redirect } from 'expo-router';

console.log('Index screen loaded');

export default function Index() {
  return <Redirect href="/auth/login" />;
}
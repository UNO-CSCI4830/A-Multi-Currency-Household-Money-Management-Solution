import { Alert, StyleSheet, Text, View, Button } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { getData, getstoreddata, isUpdated } from '@/utils/data';
import React from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState<any | null>(null)
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    if (user === null)
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
      })
  }, [])
  async function doLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) Alert.alert(String(error))
  }

  useEffect(() => {
    async function name() {
      if (!isUpdated())
        getData(user).then(data => setUserData(getstoreddata()))
      else
        setUserData(getstoreddata())
    }
    name()
  }, [user])
  if (!userData)
    return (
      <>
        <View style={styles.container}>
          <Text style={{ fontSize: 20 }}>Loading...</Text>
        </View>
      </>

    );
  return (
    <>
      <View style={styles.container}>
        <Text style={{ fontSize: 20 }}>Index of Settings Tab</Text>
        <Text>{String(userData['usd'])}</Text>
        <Button title="logout" onPress={() => doLogout()}></Button>
      </View>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
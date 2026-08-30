import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Alert } from 'react-native';
import { CustomInput } from './CustomInput';
import { CustomButton } from './CustomButton';
import { getCustomApiUrl, setCustomApiUrl } from '../api/client';
import { Server } from 'lucide-react-native';

interface ApiConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ visible, onClose }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (visible) {
      getCustomApiUrl().then(setUrl);
    }
  }, [visible]);

  const handleSave = async () => {
    await setCustomApiUrl(url);
    Alert.alert('Success', 'Backend API URL updated successfully!');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Server size={20} color="#0d9488" style={{ marginRight: 8 }} />
            <Text style={styles.title}>Backend API Settings</Text>
          </View>

          <Text style={styles.desc}>
            Enter backend server URL (e.g. http://192.168.0.100:5000/api or http://localhost:5000/api)
          </Text>

          <CustomInput
            label="API Base URL"
            value={url}
            onChangeText={setUrl}
            placeholder="http://192.168.1.100:5000/api"
            autoCapitalize="none"
          />

          <View style={styles.btnRow}>
            <CustomButton
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: 6 }}
            />
            <CustomButton
              title="Save URL"
              onPress={handleSave}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  desc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 12
  }
});

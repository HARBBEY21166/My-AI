import React, { useState } from 'react';
import { 
  Modal, 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Model } from '../../types';

interface SettingsModalProps {
  visible: boolean;
  theme: Theme;
  models: Model[];
  activeModel: Model;
  onSelectModel: (model: Model) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  visible, 
  theme, 
  models, 
  activeModel, 
  onSelectModel, 
  onClose 
}) => {
  const [newModel, setNewModel] = useState<Omit<Model, 'id'>>({
    name: '',
    endpoint: '',
    systemPrompt: '',
  });

  const handleAddModel = () => {
    if (!newModel.name || !newModel.endpoint) return;
    
    const model: Model = {
      ...newModel,
      id: `custom-${Date.now()}`,
    };
    
    const updatedModels = [...models, model];
    onSelectModel(model);
    // Save to AsyncStorage would go here
    setNewModel({ name: '', endpoint: '', systemPrompt: '' });
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.header }]}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          {/* Model Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Model</Text>
            {models.map(model => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelButton,
                  { backgroundColor: theme.inputBackground },
                  activeModel.id === model.id && { borderColor: theme.bubbleUser }
                ]}
                onPress={() => onSelectModel(model)}
              >
                <Text style={[styles.modelName, { color: theme.text }]}>{model.name}</Text>
                <Text style={[styles.modelEndpoint, { color: theme.timestamp }]}>
                  {model.endpoint}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Add New Model */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Model</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBackground, color: theme.text }
              ]}
              placeholder="Model Name"
              placeholderTextColor={theme.timestamp}
              value={newModel.name}
              onChangeText={text => setNewModel(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBackground, color: theme.text }
              ]}
              placeholder="API Endpoint"
              placeholderTextColor={theme.timestamp}
              value={newModel.endpoint}
              onChangeText={text => setNewModel(prev => ({ ...prev, endpoint: text }))}
            />
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.inputBackground, 
                  color: theme.text,
                  height: 100,
                  textAlignVertical: 'top'
                }
              ]}
              placeholder="System Prompt"
              placeholderTextColor={theme.timestamp}
              multiline
              value={newModel.systemPrompt}
              onChangeText={text => setNewModel(prev => ({ ...prev, systemPrompt: text }))}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.bubbleUser }
              ]}
              onPress={handleAddModel}
            >
              <Text style={styles.addButtonText}>Add Model</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modelButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modelName: {
    fontSize: 16,
  },
  modelEndpoint: {
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SettingsModal;
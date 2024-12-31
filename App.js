import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useState } from 'react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState(null);

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const analyzeText = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text.');
      return;
    }

    try {
      const res = await fetch('https://apparently-advanced-macaque.ngrok-free.app/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while connecting to the server.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.miniheader}>Bias Detector</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your job posting"
            placeholderTextColor="#aaa"
            value={inputText}
            multiline
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.button} onPress={analyzeText}>
            <Text>Detect Bias</Text>
          </TouchableOpacity>
          {response && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.result}>Bias Score: {response.bias_score}%</Text>
              <Text style={styles.description}>This score indicates the likelhood that your posting has biased text</Text>
              <Text style={styles.result}>Neutral Score: {response.neutral_score}%</Text>
              <Text style={styles.description}>This score indicates the likelhood that your posting has neutral text</Text>

            </View>
          )}
          <StatusBar style="auto" />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292929',
    padding: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    margin: 30,
    fontSize: 15,
    borderWidth: 1,
    padding: 15,
    height: 150,
    textAlignVertical: 'top',
    width: '100%',
    borderRadius: 20,
    color: 'white',
    borderColor: 'white',
    backgroundColor: '#333',
  },
  miniheader: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
  },
  button: {
    margin: 8,
    padding: 12,
    backgroundColor: '#dd9911',
    borderRadius: 10,
    alignItems: 'center',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center'
  }
});

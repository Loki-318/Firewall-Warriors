import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';

const LOCAL_IP = "192.168.19.18"; 
const API_URL = `http://${LOCAL_IP}:8000/api`;

const AQIChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input and show loading
    const userInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Based on the error message, FastAPI is expecting a dictionary/object
      // even though the function signature defines request as a string
      // Let's create a request body as FastAPI expects
      const requestBody = {
        request: userInput
      };

      const response = await axios.post(`${API_URL}/chat`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add bot response to chat
      const botMessage = {
        id: `bot-${Date.now()}`,
        text: response.data.response,
        sender: 'bot',
      };
      
      // Add AQI info if available
      if (response.data.current_aqi) {
        const aqiInfo = {
          id: `aqi-${Date.now()}`,
          text: `Current AQI: ${response.data.current_aqi} in ${response.data.location}`,
          sender: 'bot',
        };
        setMessages(prevMessages => [...prevMessages, botMessage, aqiInfo]);
      } else {
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Enhanced error logging for debugging
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: error.response 
          ? `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`
          : 'Network error. Please check your connection.',
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userBubble : styles.botBubble
    ]}>
      <Text style={item.sender === 'user' ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>AQI Assistant</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
          disabled={isLoading || inputText.trim() === ''}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  userText: {
    color: '#000',
  },
  botText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AQIChatScreen;
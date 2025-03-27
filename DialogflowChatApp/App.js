import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import axios from 'axios';
import * as Crypto from 'expo-crypto';

export default function DialogflowChat() {
  const [messages, setMessages] = useState([]);

  // Dialogflow API Config
  const projectId = 'sublime-flux-455017-i8'; // From Google Cloud
  const sessionId = Crypto.randomUUID(); // Unique session ID
  const languageCode = 'en-US';

  // Get Access Token from Service Account JSON
  const getAccessToken = async () => {
    try {
      const { data } = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: generateJWT(), // JWT from service account
        }
      );
      return data.access_token;
    } catch (error) {
      console.error('Token Error:', error);
      return null;
    }
  };

  // Generate JWT for authentication
  const generateJWT = () => {
    // Replace with your service account credentials
    const serviceAccount = {
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDaRJ5/wJldJni/\nUSiOpbjfVOpIAg7dF8w/k7e9izC5snQ09k//l9rVvXLs8MinYyEDVOd2sh6lVP43\nUizfAp564Uk2cCxTDPSGiew/OooBGUPapx+cL6xxd5yRMl10BCH7GQAxtXKGrt8j\nxligk8hVSOXzf/fobfcRh9lLTJy0Odr7wjHSLuirPnupnjvpgTzJQ/kLjWrffuYC\nyf32+nIFAWGykYVyhmr35V1ZTSAlwQxBekjkTQ3hYz1m1MRfwQqS3Lmxy14/YPx9\n9M3QpjdHCYdFYy381knd7jgzQ8xrMxq2t6xi6UlA1TLrZx1yaKt0OGU1PFWdtYjU\npOkqR9xVAgMBAAECggEACLBggrHFZaIxYghddQRKAA7nfrNaRgO0WOJ3lx8kHZhb\nyO2En210GR+ch+Tz+p1zkkSo81dPzKwhV00AVGZo5wXyWnR98eSpacnrQOKta2rH\nAiAoSJkpeYRyaVNQ5hVG7FyPe0BxhhpHfeQmxS1CPIp44QDzwenPNNWeWUGKWJIT\nUP6X9lwKnBX53dQQpl1q6slQwRXCRpxbFdrP65nwuuI78RCH+FjHfFvmjdkPaIBi\nE8eu/wtIxlcuLRRdtnuCwg2Cy/+fHTyppS8XjhH+Iao+mv2A2dAkTxC27kq8FTKY\nNcXARmMP1JkbbJBFGVoDWG40/VQ0nv+4ENQN7Mep1wKBgQD3Qe/N1UmMdzlfalaL\nJTCHPYxZc3gzCb+5l2f6CZKqQymX+ieq4vc2yndBh1d7Erw34tMW72yEBgbH+65n\nkNfPylKgQCdJJAXllv3PE4/BZP3sPS81czYCRgmFczFSZRdVIe8iORLepN4tHeTd\npYOkpNRFQF8QEvJoBLw3BpmVlwKBgQDh/EhL1QkRxOWk/FxaaeonIEVAH674YLzE\nPuNkXrKfMHWcOhkPxbXTmr2POOb2CAtD67JzyUsecUb2YelB0pn58ytzptDX2mzS\nw8Ob8zQxrULnlXgUO2ZzbGwQ6+ESl2sLEOXMPINz/dxR4vk0AK6kIVSUfHEOhJ4v\nALVaJ5/S8wKBgBeeIL3UhbX5HW3Txnh8EOqaInHY6b5WTA36PGBR0cSZrbtqladp\nDpwZMtL7joue+oOMEwW50O+7c6JelAYoe7TJaqML/bSq0DVh+tRw1eZvMyIBpiTA\n4IPPFNG+cxOfvF7RYvot4XOK4/4DQP069hwf8na681mhta3h5eiLpNf5AoGAcvFU\n/G0xHb6eZ5qMhthUZu49Cu6SmnbpzI+ILWcVR27ogzvxv1n6r9SHEjAJGZ7hy/w4\nWjhKYwOO6obGk9pAwydyNHLmysOoklNMTSgYpiPQYeZemzvTUmYVWU4AvuoRYiGI\nIKeu3PKEe4oM4uxt58GkOZpKDu5ZXuLnWyHIYw0CgYAdFGncVyk7nJGKuDZL3iMX\nnprGB+Lhz5ODMYFG4eLT/gWxb/w0TwgXQ7+i+slNaZFrfvCOaTKySJLpktrPPndN\nprHlHi1lmRYEaXmuOqDStLbnGiSUHQi7RBnnyJ+mM/Xfgj7Lg1d82QYa71ep2loa\ntYG7uo7zT4u8pDyj0U8+xg==\n-----END PRIVATE KEY-----\n",
      "client_email": "mytwin-lecj@sublime-flux-455017-i8.iam.gserviceaccount.com",
    };

    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
    };

    // In a real app, use a JWT library like 'jsonwebtoken'
    // For Expo, use `expo-crypto` or a similar solution
    return "manually_generated_jwt";
  };

  // Send message to Dialogflow
  const sendToDialogflow = async (text) => {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    try {
      const response = await axios.post(
        `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`,
        {
          queryInput: {
            text: {
              text: text,
              languageCode: languageCode,
            },
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const botReply = response.data.queryResult.fulfillmentText;
      return botReply;
    } catch (error) {
      console.error('Dialogflow Error:', error);
      return "Sorry, I couldn't process that.";
    }
  };

  // Handle user messages
  const handleSend = useCallback(async (newMessages = []) => {
    setMessages(prev => GiftedChat.append(prev, newMessages));
    const userMessage = newMessages[0].text;

    const botReply = await sendToDialogflow(userMessage);
    
    setMessages(prev => GiftedChat.append(prev, [{
      _id: Math.random().toString(36).substring(7),
      text: botReply,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'Bot',
        avatar: 'https://i.imgur.com/7k12EPD.png',
      },
    }]));
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{ _id: 1 }} // User ID
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const testGroqDirect = async () => {
  try {
    console.log('\n🧪 TESTING GROQ API DIRECTLY\n');

    const token = process.env.GROQ_API_TOKEN;
    const model = process.env.GROQ_MODEL;

    console.log('📋 Configuration:');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Model: ${model}`);

    console.log('\n🚀 Sending direct request to Groq...\n');

    const startTime = Date.now();

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a data analytics expert. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: `Analyze this data and provide JSON response:
Data: [{"Campaign_ID": "C001", "Budget": 5000}, {"Campaign_ID": "C002", "Budget": 8000}]
Provide EXACTLY this JSON format: {"answer": "brief answer", "insights": ["insight1", "insight2"], "recommendations": "recommendations"}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const duration = Date.now() - startTime;

    console.log(`✅ Response received in ${duration}ms\n`);
    console.log('📩 Raw response:');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\n💬 Message content:');
    console.log(response.data.choices[0].message.content);

  } catch (error) {
    console.error('\n❌ ERROR:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data));
    } else {
      console.error('   Message:', error.message);
    }
  }
};

testGroqDirect();

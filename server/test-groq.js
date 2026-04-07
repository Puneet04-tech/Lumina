import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const testGroq = async () => {
  try {
    console.log('\n🧪 TESTING GROQ API (COMPLETELY FREE TIER)\n');

    const token = process.env.GROQ_API_TOKEN;
    const model = process.env.GROQ_MODEL;

    if (!token) {
      console.error('❌ GROQ_API_TOKEN not found in .env');
      process.exit(1);
    }

    console.log('📋 Configuration:');
    console.log(`   API Token: ${token.substring(0, 20)}...`);
    console.log(`   Model: ${model}`);
    console.log(`   Endpoint: https://api.groq.com/openai/v1/chat/completions`);

    console.log('\n🚀 Sending test request to Groq...\n');

    const startTime = Date.now();

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a data analytics expert. Provide concise insights.'
          },
          {
            role: 'user',
            content: 'Analyze sales data: Revenue increased 25% YoY, but customer acquisition cost rose 15%. What does this mean?'
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const duration = Date.now() - startTime;

    console.log(`✅ SUCCESS! Response received in ${duration}ms\n`);
    console.log('🤖 Analytics Insight:');
    console.log(response.data.choices[0].message.content);
    console.log('\n💡 Usage:');
    console.log(`   Input tokens: ${response.data.usage.prompt_tokens}`);
    console.log(`   Output tokens: ${response.data.usage.completion_tokens}`);
    console.log(`   Total tokens: ${response.data.usage.total_tokens}`);
    console.log('\n🎉 GROQ IS WORKING PERFECTLY!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.error?.message || JSON.stringify(error.response.data));
    } else if (error.code === 'ECONNABORTED') {
      console.error('   Timeout: Request took too long');
    } else {
      console.error('   Message:', error.message);
    }
    console.error('\n⚠️ TEST FAILED\n');
    process.exit(1);
  }
};

testGroq();

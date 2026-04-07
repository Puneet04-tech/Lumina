import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const testHuggingFace = async () => {
  try {
    console.log('\n🧪 TESTING HUGGING FACE INFERENCE API\n');

    const token = process.env.HF_API_TOKEN;
    const model = process.env.HF_MODEL;

    if (!token) {
      console.error('❌ HF_API_TOKEN not found in .env');
      process.exit(1);
    }

    console.log('📋 Configuration:');
    console.log(`   API Token: ${token.substring(0, 20)}...`);
    console.log(`   Model: ${model}`);

    console.log('\n🚀 Testing multiple endpoint formats...\n');

    const endpoints = [
      {
        name: 'Direct router.huggingface.co (v1)',
        url: `https://router.huggingface.co/${model}`,
        method: 'POST'
      },
      {
        name: 'Direct api-inference.huggingface.co',
        url: `https://api-inference.huggingface.co/models/${model}`,
        method: 'POST'
      },
      {
        name: 'router with /models prefix',
        url: `https://router.huggingface.co/models/${model}`,
        method: 'POST'
      },
      {
        name: 'Hugging Face API inference',
        url: `https://huggingface.co/api/inference/${model}`,
        method: 'POST'
      }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n📌 Trying: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      try {
        const response = await axios.post(
          endpoint.url,
          {
            inputs: "Data analysis"
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
            validateStatus: () => true // Don't throw on any status
          }
        );

        console.log(`   Status: ${response.status}`);
        if (response.status < 300) {
          console.log('   ✅ SUCCESS!');
          console.log('   Response:', JSON.stringify(response.data).substring(0, 200) + '...');
          process.exit(0);
        } else {
          console.log('   ❌ Failed');
          console.log('   Error:', JSON.stringify(response.data).substring(0, 150) + '...');
        }
      } catch (error) {
        console.log(`   ⚠️ Error:`, error.message.substring(0, 100));
      }
    }
    
    console.log('\n\n❌ All endpoints failed. Trying fallback: check model serverless status...\n');
    
    // Check if model has serverless inference enabled
    const modelInfo = await axios.get(
      `https://huggingface.co/api/models/${model}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000,
      }
    );
    
    console.log('Model inference status:');
    console.log('  - gated:', modelInfo.data.gated);
    console.log('  - disabled:', modelInfo.data.disabled);
    console.log('  - tags:', modelInfo.data.tags.slice(0, 5).join(', '));
    
    if (modelInfo.data.disabled) {
      console.log('\n⚠️ Model is disabled for inference');
    }

    process.exit(1);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:');
    console.error(error.message);
    process.exit(1);
  }
};

testHuggingFace();

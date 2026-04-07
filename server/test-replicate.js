import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const testReplicate = async () => {
  try {
    console.log('\n🧪 TESTING REPLICATE API\n');

    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      console.error('❌ REPLICATE_API_TOKEN not found in .env');
      process.exit(1);
    }

    console.log('📋 Configuration:');
    console.log(`   API Token: ${token.substring(0, 15)}...`);
    console.log(`   Model: meta-llama/Llama-2-7b (via Replicate)`);

    console.log('\n🚀 Testing Replicate API...\n');

    // Create a test prediction with a text generation model
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: '58e6f9d876e45c72010182e0e46e85e3ea5e1b4e41e1f4c1d2c5f3a9e8b7d6c5',
        input: {
          prompt: 'Data analysis insights: Business metrics show'
        }
      },
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Prediction created!');
    console.log('  ID:', response.data.id);
    console.log('  Status:', response.data.status);
    console.log('  URL:', response.data.url);

    // Poll for completion
    console.log('\n⏳ Waiting for prediction to complete (max 30 seconds)...\n');

    let predictionData = response.data;
    let attempts = 0;
    const maxAttempts = 15;

    while ((predictionData.status === 'processing' || predictionData.status === 'starting') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const pollResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionData.id}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      predictionData = pollResponse.data;
      console.log(`  Attempt ${++attempts}: Status = ${predictionData.status}`);
    }

    if (predictionData.status === 'succeeded') {
      console.log('\n✅ SUCCESS!');
      console.log('\n🤖 Model Output:');
      console.log(predictionData.output.join(''));
      console.log('\n🎉 REPLICATE API IS WORKING!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️ Prediction did not complete. Status:', predictionData.status);
      if (predictionData.error) {
        console.log('Error:', predictionData.error);
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data));
    } else {
      console.error('   Message:', error.message);
    }
    console.error('\n⚠️ TEST FAILED\n');
    process.exit(1);
  }
};

testReplicate();

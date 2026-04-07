import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const testFullAnalysis = async () => {
  try {
    console.log('\n🧪 TESTING FULL ANALYSIS RESPONSE\n');

    // Get auth token
    let token;
    try {
      const loginRes = await axios.post('http://localhost:3500/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      token = loginRes.data.token;
      console.log('✅ Logged in\n');
    } catch (loginErr) {
      console.log('❌ Login failed:', loginErr.response?.data?.message || loginErr.message);
      return;
    }

    // Get user's files
    const filesRes = await axios.get('http://localhost:3500/api/files', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let fileId;
    if (filesRes.data.files && filesRes.data.files.length > 0) {
      fileId = filesRes.data.files[0]._id;
      console.log(`📂 Using file: ${filesRes.data.files[0].name}\n`);
    } else {
      // Try the fileId from screenshot
      fileId = '69d4f8e04760ef9290d89ab9';
      console.log(`📂 Using file ID from screenshot: ${fileId}\n`);
    }

    // Run analysis
    console.log('🤖 Running analysis...\n');
    const analysisRes = await axios.post(
      'http://localhost:3500/api/analysis/query',
      {
        query: 'Analyze top performers and provide insights',
        fileId: fileId
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const results = analysisRes.data.results;
    
    console.log('✅ FULL RESPONSE:\n');
    console.log(JSON.stringify(results, null, 2));

    console.log('\n\n🔍 CHECKING KEY FIELDS:\n');
    console.log(`topPerformers: ${JSON.stringify(results.topPerformers)}`);
    console.log(`bottomPerformers: ${JSON.stringify(results.bottomPerformers)}`);
    console.log(`trend: ${JSON.stringify(results.trend)}`);
    console.log(`outliers: ${JSON.stringify(results.outliers)}`);
    console.log(`dataQuality: ${JSON.stringify(results.dataQuality)}`);
    console.log(`stats: ${JSON.stringify(results.stats)}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testFullAnalysis();

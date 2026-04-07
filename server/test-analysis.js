import axios from 'axios';

const testAnalysis = async () => {
  try {
    console.log('🧪 Testing Analysis Query with Groq...\n');

    // First try login, if fails try register
    let token;
    try {
      const loginRes = await axios.post('http://localhost:3500/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      token = loginRes.data.token;
      console.log('✅ Logged in successfully\n');
    } catch (loginErr) {
      console.log('📝 Creating test account...');
      try {
        const signupRes = await axios.post('http://localhost:3500/api/auth/register', {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
        token = signupRes.data.token;
        console.log('✅ Account created and logged in\n');
      } catch (regErr) {
        console.log('❌ Register failed:', regErr.response?.data?.message || regErr.message);
        return;
      }
    }

    // Get list of files
    console.log('📂 Fetching files...');
    const filesRes = await axios.get('http://localhost:3500/api/files', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!filesRes.data.files || filesRes.data.files.length === 0) {
      console.log('⚠️ No files found. Please upload a CSV file first.');
      return;
    }

    const fileId = filesRes.data.files[0]._id;
    console.log(`✅ Found file: ${filesRes.data.files[0].name} (ID: ${fileId})\n`);

    // Test query
    console.log('🤖 Running analysis...\n');
    const analysisRes = await axios.post(
      'http://localhost:3500/api/analysis/query',
      {
        query: 'Analyze the top performers and provide business insights',
        fileId: fileId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ GROQ ANALYSIS RESPONSE:\n');
    console.log(JSON.stringify(analysisRes.data.results, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testAnalysis();

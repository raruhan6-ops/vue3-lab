import axios from 'axios';

const API_URL = 'http://localhost:3000/api/students';

async function testValidation() {
    console.log('🧪 Starting Validation Tests...');

    // Test 1: Invalid Score (> 100)
    try {
        console.log('\n[Test 1] Sending Invalid Score (150)...');
        await axios.post(API_URL, {
            name: 'Bad Student',
            course: 'Test 101',
            score: 150, // Invalid
            semester: '2025'
        });
        console.error('❌ FAILED: Should have rejected score 150');
    } catch (err) {
        if (err.response && err.response.status === 400) {
            console.log('✅ PASSED: Correctly rejected invalid score.');
            console.log('   Error Detail:', JSON.stringify(err.response.data));
        } else {
            console.error('❌ FAILED: Unexpected error Code', err.response?.status);
        }
    }

    // Test 2: Valid Student
    try {
        console.log('\n[Test 2] Sending Valid Student...');
        const res = await axios.post(API_URL, {
            name: 'Good Student',
            course: 'Test 101',
            score: 95,
            semester: '2025'
        });
        console.log('✅ PASSED: Created student with ID:', res.data.id);

        // Cleanup
        await axios.delete(`${API_URL}/${res.data.id}`);
        console.log('   (Cleaned up test data)');
    } catch (err) {
        console.error('❌ FAILED: Should have accepted valid data', err.message);
    }
}

testValidation();

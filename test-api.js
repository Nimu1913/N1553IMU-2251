// Test your API endpoints
const baseURL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');
  
  try {
    // 1. Test health endpoint
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // 2. Test lead capture
    console.log('\n2. Testing lead capture...');
    const leadResponse = await fetch(`${baseURL}/leads/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0123',
        source: 'website',
        vehicle_interest: '2024 Tesla Model 3',
        message: 'I would like to schedule a test drive'
      })
    });
    
    const leadData = await leadResponse.json();
    console.log('✅ Lead captured:', leadData);
    
    // 3. Test availability check
    console.log('\n3. Testing availability...');
    const availabilityResponse = await fetch(
      `${baseURL}/appointments/availability?date=2024-12-15`
    );
    const availability = await availabilityResponse.json();
    console.log('✅ Available slots:', availability);
    
    // 4. Test appointment booking
    if (leadData.lead_id) {
      console.log('\n4. Testing appointment booking...');
      const appointmentResponse = await fetch(`${baseURL}/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadData.lead_id,
          appointment_date: '2024-12-15T14:00:00',
          appointment_type: 'test_drive',
          notes: 'Customer prefers electric vehicles'
        })
      });
      
      const appointmentData = await appointmentResponse.json();
      console.log('✅ Appointment booked:', appointmentData);
    }
    
    console.log('\n✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testAPI();
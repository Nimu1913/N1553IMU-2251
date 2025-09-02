const express = require('express');
const router = express.Router();

router.get('/book', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Schedule Test Drive</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, system-ui, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    .form-container {
      padding: 24px;
    }
    .step {
      display: none;
    }
    .step.active {
      display: block;
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    input, select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 16px;
      transition: border 0.3s ease;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #4F46E5;
    }
    .btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
    }
    .calendar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin: 20px 0;
    }
    .date-slot, .time-slot {
      padding: 12px 8px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .date-slot:hover, .time-slot:hover {
      border-color: #4F46E5;
      background: #f3f4f6;
    }
    .date-slot.selected, .time-slot.selected {
      background: #4F46E5;
      color: white;
      border-color: #4F46E5;
    }
    .time-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    .success-msg {
      text-align: center;
      padding: 40px 20px;
    }
    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Schedule Test Drive</h1>
      <p>Experience your dream car today</p>
    </div>
    
    <div class="form-container">
      <!-- Step 1: Contact Info -->
      <div class="step active" id="step1">
        <input type="text" id="name" placeholder="Full Name" required>
        <input type="email" id="email" placeholder="Email Address" required>
        <input type="tel" id="phone" placeholder="Phone Number" required>
        <select id="vehicle">
          <option value="">Select Vehicle</option>
          <option>Tesla Model 3</option>
          <option>Tesla Model Y</option>
          <option>BMW i4</option>
          <option>Mercedes EQS</option>
          <option>Porsche Taycan</option>
        </select>
        <button class="btn" onclick="nextStep()">Select Date →</button>
      </div>
      
      <!-- Step 2: Date Selection -->
      <div class="step" id="step2">
        <h3 style="margin-bottom: 16px;">Select Date</h3>
        <div class="calendar" id="calendar"></div>
        <button class="btn" onclick="selectTime()">Select Time →</button>
      </div>
      
      <!-- Step 3: Time Selection -->
      <div class="step" id="step3">
        <h3 style="margin-bottom: 16px;">Select Time</h3>
        <div class="time-grid">
          <div class="time-slot" onclick="setTime(this,'9:00 AM')">9:00 AM</div>
          <div class="time-slot" onclick="setTime(this,'10:00 AM')">10:00 AM</div>
          <div class="time-slot" onclick="setTime(this,'11:00 AM')">11:00 AM</div>
          <div class="time-slot" onclick="setTime(this,'2:00 PM')">2:00 PM</div>
          <div class="time-slot" onclick="setTime(this,'3:00 PM')">3:00 PM</div>
          <div class="time-slot" onclick="setTime(this,'4:00 PM')">4:00 PM</div>
        </div>
        <button class="btn" onclick="confirmBooking()">Confirm Booking</button>
      </div>
      
      <!-- Success -->
      <div class="step" id="success">
        <div class="success-msg">
          <div class="success-icon">
            <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <h2>Booking Confirmed!</h2>
          <p style="color: #6b7280; margin-top: 12px;">Check your email for details</p>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    let booking = {};
    
    function nextStep() {
      booking.name = document.getElementById('name').value;
      booking.email = document.getElementById('email').value;
      booking.phone = document.getElementById('phone').value;
      booking.vehicle = document.getElementById('vehicle').value;
      
      if (!booking.name || !booking.email || !booking.phone) {
        alert('Please fill all fields');
        return;
      }
      
      document.getElementById('step1').classList.remove('active');
      document.getElementById('step2').classList.add('active');
      generateCalendar();
    }
    
    function generateCalendar() {
      const cal = document.getElementById('calendar');
      const today = new Date();
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const slot = document.createElement('div');
        slot.className = 'date-slot';
        slot.innerHTML = date.getDate() + '<br><small>' + 
          date.toLocaleDateString('en', {weekday: 'short'}) + '</small>';
        slot.onclick = () => selectDate(slot, date.toISOString());
        cal.appendChild(slot);
      }
    }
    
    function selectDate(el, date) {
      document.querySelectorAll('.date-slot').forEach(s => s.classList.remove('selected'));
      el.classList.add('selected');
      booking.date = date;
    }
    
    function selectTime() {
      if (!booking.date) {
        alert('Please select a date');
        return;
      }
      document.getElementById('step2').classList.remove('active');
      document.getElementById('step3').classList.add('active');
    }
    
    function setTime(el, time) {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      el.classList.add('selected');
      booking.time = time;
    }
    
    async function confirmBooking() {
      if (!booking.time) {
        alert('Please select a time');
        return;
      }
      
      try {
        const response = await fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: booking.name.split(' ')[0],
            last_name: booking.name.split(' ')[1] || '',
            email: booking.email,
            phone: booking.phone,
            vehicle_interest: booking.vehicle,
            appointment_date: booking.date,
            appointment_time: booking.time,
            source: 'widget'
          })
        });
        
        if (response.ok) {
          document.getElementById('step3').classList.remove('active');
          document.getElementById('success').classList.add('active');
          window.parent.postMessage({ type: 'booking-complete' }, '*');
        }
      } catch (error) {
        alert('Booking failed. Please try again.');
      }
    }
  </script>
</body>
</html>`;
  
  res.send(html);
});

module.exports = router;

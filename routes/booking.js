// routes/booking.js
const express = require('express');
const router = express.Router();

router.get('/book', (req, res) => {
  const dealerId = req.query.dealer || 'default';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .booking-container { padding: 24px; }
        .step { display: none; }
        .step.active { display: block; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin: 20px 0; }
        .time-slots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 20px 0; }
        .slot { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; text-align: center; }
        .slot:hover { background: #f3f4f6; }
        .slot.selected { background: #4F46E5; color: white; }
        .btn { padding: 12px 24px; background: #4F46E5; color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%; margin-top: 16px; }
        input, select { width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="booking-container">
        <!-- Step 1: Quick Info -->
        <div class="step active" id="step1">
          <h2>Schedule Your Test Drive</h2>
          <p style="margin: 16px 0; color: #6b7280;">Takes only 30 seconds</p>
          
          <input type="text" id="name" placeholder="Your Name" required>
          <input type="email" id="email" placeholder="Email" required>
          <input type="tel" id="phone" placeholder="Phone" required>
          
          <select id="vehicle">
            <option>Select Vehicle Interest</option>
            <option>Model S</option>
            <option>Model 3</option>
            <option>Model X</option>
            <option>Model Y</option>
          </select>
          
          <button class="btn" onclick="nextStep()">Choose Time →</button>
        </div>

        <!-- Step 2: Calendar -->
        <div class="step" id="step2">
          <h3>Select Date</h3>
          <div class="calendar-grid" id="calendar"></div>
          <button class="btn" onclick="showTimes()">Select Time →</button>
        </div>

        <!-- Step 3: Time -->
        <div class="step" id="step3">
          <h3>Select Time</h3>
          <div class="time-slots">
            <div class="slot" onclick="selectTime(this, '9:00 AM')">9:00 AM</div>
            <div class="slot" onclick="selectTime(this, '10:00 AM')">10:00 AM</div>
            <div class="slot" onclick="selectTime(this, '11:00 AM')">11:00 AM</div>
            <div class="slot" onclick="selectTime(this, '2:00 PM')">2:00 PM</div>
            <div class="slot" onclick="selectTime(this, '3:00 PM')">3:00 PM</div>
            <div class="slot" onclick="selectTime(this, '4:00 PM')">4:00 PM</div>
          </div>
          <button class="btn" onclick="confirmBooking()">Confirm Booking</button>
        </div>

        <!-- Success -->
        <div class="step" id="success">
          <div style="text-align: center; padding: 40px 0;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#10b981">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <h2 style="margin: 16px 0;">Test Drive Scheduled!</h2>
            <p style="color: #6b7280;">We'll send confirmation to your email</p>
          </div>
        </div>
      </div>

      <script>
        let bookingData = {};
        
        function nextStep() {
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const phone = document.getElementById('phone').value;
          const vehicle = document.getElementById('vehicle').value;
          
          if (!name || !email || !phone) {
            alert('Please fill all fields');
            return;
          }
          
          bookingData = { name, email, phone, vehicle };
          document.getElementById('step1').classList.remove('active');
          document.getElementById('step2').classList.add('active');
          generateCalendar();
        }
        
        function generateCalendar() {
          const calendar = document.getElementById('calendar');
          const today = new Date();
          
          for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'slot';
            dayDiv.innerHTML = date.getDate() + '<br><small>' + date.toLocaleDateString('en', {weekday: 'short'}) + '</small>';
            dayDiv.onclick = () => selectDate(dayDiv, date.toISOString());
            calendar.appendChild(dayDiv);
          }
        }
        
        function selectDate(el, date) {
          document.querySelectorAll('#calendar .slot').forEach(s => s.classList.remove('selected'));
          el.classList.add('selected');
          bookingData.date = date;
        }
        
        function showTimes() {
          if (!bookingData.date) {
            alert('Please select a date');
            return;
          }
          document.getElementById('step2').classList.remove('active');
          document.getElementById('step3').classList.add('active');
        }
        
        function selectTime(el, time) {
          document.querySelectorAll('.time-slots .slot').forEach(s => s.classList.remove('selected'));
          el.classList.add('selected');
          bookingData.time = time;
        }
        
        async function confirmBooking() {
          if (!bookingData.time) {
            alert('Please select a time');
            return;
          }
          
          // Send to your API
          const response = await fetch('/api/appointments/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
          });
          
          if (response.ok) {
            document.getElementById('step3').classList.remove('active');
            document.getElementById('success').classList.add('active');
            
            // Notify parent window
            window.parent.postMessage({ type: 'booking-complete', data: bookingData }, '*');
          }
        }
      </script>
    </body>
    </html>
  `);
});

module.exports = router;
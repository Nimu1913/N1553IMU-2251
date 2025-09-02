// public/widget.js in your Railway app
(function() {
  // Create iframe container
  const container = document.createElement('div');
  container.id = 'testride-booking-widget';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 120px;
    height: 120px;
    z-index: 99999;
    transition: all 0.3s ease;
  `;

  // Create launcher button
  const launcher = document.createElement('button');
  launcher.innerHTML = `
    <svg viewBox="0 0 24 24" width="60" height="60">
      <path fill="#4F46E5" d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M19,8H5V6H19V8M12,13H17V18H12V13Z"/>
    </svg>
  `;
  launcher.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    cursor: pointer;
  `;

  // Create modal iframe
  const modal = document.createElement('div');
  modal.id = 'testride-modal';
  modal.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100000;
  `;

  const iframe = document.createElement('iframe');
  iframe.src = 'https://dealership-backend-production.up.railway.app/book';
  iframe.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    height: 600px;
    border: none;
    border-radius: 12px;
    background: white;
  `;

  modal.appendChild(iframe);
  container.appendChild(launcher);
  document.body.appendChild(container);
  document.body.appendChild(modal);

  // Handle events
  launcher.onclick = () => modal.style.display = 'block';
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };

  // Listen for messages from iframe
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://dealership-backend-production.up.railway.app') return;
    
    if (e.data.type === 'booking-complete') {
      modal.style.display = 'none';
      // Show success message
      alert('Test drive scheduled! Check your email for confirmation.');
    }
  });
})();
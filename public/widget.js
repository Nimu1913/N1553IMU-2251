(function() {
  const script = document.currentScript;
  const dealerId = script.getAttribute('data-dealer-id') || 'default';
  
  // Create widget styles
  const style = document.createElement('style');
  style.innerHTML = `
    #testride-launcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: #4F46E5;
      border-radius: 30px;
      box-shadow: 0 4px 12px rgba(79,70,229,0.3);
      cursor: pointer;
      z-index: 99998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    #testride-launcher:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(79,70,229,0.4);
    }
    #testride-launcher svg {
      width: 30px;
      height: 30px;
      fill: white;
    }
    #testride-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99999;
      animation: fadeIn 0.3s ease;
    }
    #testride-iframe {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 450px;
      height: 600px;
      border: none;
      border-radius: 12px;
      background: white;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Create launcher button
  const launcher = document.createElement('div');
  launcher.id = 'testride-launcher';
  launcher.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>';
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'testride-modal';
  modal.innerHTML = `<iframe id="testride-iframe" src="https://dealership-backend-production.up.railway.app/book?dealer=${dealerId}"></iframe>`;
  
  document.body.appendChild(launcher);
  document.body.appendChild(modal);
  
  // Event handlers
  launcher.onclick = () => modal.style.display = 'block';
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
  
  // Listen for booking completion
  window.addEventListener('message', (e) => {
    if (e.data.type === 'booking-complete') {
      modal.style.display = 'none';
      launcher.style.background = '#10B981';
      setTimeout(() => launcher.style.background = '#4F46E5', 3000);
    }
  });
})();

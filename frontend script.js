// Show specific section
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.style.display='none');
  document.getElementById(sectionId).style.display='block';

  if(sectionId==='dashboard') loadMetrics();
  if (sectionId==='campaigns') loadCampaigns();
}

// Toggle login/signup forms
document.querySelectorAll('.login-signup-form').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (form.id==='loginForm') handleLogin();
    if (form.id==='signupForm') handleSignup();
  });
});

function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  alert(`Logging in as ${email} (simulated).`);
  showSection('dashboard');
}

function handleSignup() {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  alert(`Registered ${name} (${email}) (simulated).`);
  showSection('login');
}

// Load metrics
function loadMetrics() {
  fetch('/api/metrics')
    .then(res => res.json())
    .then(data => {
      document.getElementById('campaignCount').innerText = data.campaigns;
      document.getElementById('activeUsers').innerText = data.users;
    });
}

// Load campaigns
function loadCampaigns() {
  fetch('/api/campaigns')
    .then(res => res.json())
    .then(campaigns => {
      const list = document.getElementById('campaignList');
      list.innerHTML = '';
      campaigns.forEach(c => {
        const li = document.createElement('li');
        li.innerText = c.name;
        list.appendChild(li);
      });
    });
}

// Create campaign
document.getElementById('campaignForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('campaignName').value;
  fetch('/api/campaigns', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({name})
  }).then(res=>res.json())
    .then(campaign => {
      loadCampaigns();
      document.getElementById('campaignForm').reset();
    });
});

// Profile update
document.getElementById('profileForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  alert(`Profile updated: ${name} (${email}) (simulated).`);
});

// Log engagement
function logEngagement() {
  alert('Engagement logged! (simulated)');
}

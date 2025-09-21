// Show specific section
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.style.display='none');
  document.getElementById(sectionId).style.display='block';
  if(sectionId==='dashboard') { loadMetrics(); loadDashboardAnalytics(); }
  if(sectionId==='campaigns') loadCampaigns();
  if(sectionId==='forum') loadForum();
  if(sectionId==='talent') loadTalent();
  if(sectionId==='cocreation') loadFeedback();
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
// Update to call backend API

document.getElementById('profileForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  fetch('/api/profile', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({name, email})
  })
    .then(res => res.json())
    .then(data => {
      alert(`Profile updated: ${name} (${email})`);
    })
    .catch(() => alert('Failed to update profile.'));
});

// Log engagement
function logEngagement() {
  fetch('/api/engagement', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ timestamp: new Date().toISOString() })
  })
    .then(res => res.json())
    .then(data => {
      alert('Engagement logged!');
    })
    .catch(() => alert('Failed to log engagement.'));
}

// Ensure engagement and liveintegration sections can be shown from nav
const nav = document.querySelector('nav');
if (nav) {
  if (!nav.querySelector('[onclick*="engagement"]')) {
    const btn = document.createElement('button');
    btn.textContent = 'Engagement';
    btn.onclick = () => showSection('engagement');
    nav.appendChild(btn);
  }
  if (!nav.querySelector('[onclick*="liveintegration"]')) {
    const btn = document.createElement('button');
    btn.textContent = 'Live Integration';
    btn.onclick = () => showSection('liveintegration');
    nav.appendChild(btn);
  }
}

// Live Integration logic
import("./frontend/integration.js").then(({ handleIntegration }) => {
  const integrateBtn = document.getElementById('integrateBtn');
  if (integrateBtn) {
    integrateBtn.onclick = async () => {
      const platform = document.getElementById('platformSelect').value;
      // Example payload, can be extended to collect more data from UI
      const payload = { message: "Test integration" };
      const resultDiv = document.getElementById('integrationResult');
      resultDiv.innerText = 'Integrating...';
      try {
        await handleIntegration(platform, payload);
        resultDiv.innerText = `Integration with ${platform} successful!`;
      } catch (err) {
        resultDiv.innerText = `Integration failed: ${err.message}`;
      }
    };
  }
});

// Chart.js analytics for dashboard
function renderMarketChart(data) {
  const ctx = document.getElementById('marketChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{ label: 'Gen Z & Millennials', data: data.values, backgroundColor: '#36a2eb' }]
    }
  });
}
function renderSentimentChart(data) {
  const ctx = document.getElementById('sentimentChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{ data: data, backgroundColor: ['#4caf50','#ffc107','#f44336'] }]
    }
  });
}

// Load dashboard analytics
function loadDashboardAnalytics() {
  fetch('/api/market-analytics').then(res=>res.json()).then(renderMarketChart);
  fetch('/api/sentiment-analytics').then(res=>res.json()).then(renderSentimentChart);
}

// Forum
function loadForum() {
  fetch('/api/forum').then(res=>res.json()).then(posts => {
    const forumPosts = document.getElementById('forumPosts');
    forumPosts.innerHTML = posts.map(p=>`<div><b>${p.user}</b>: ${p.text}</div>`).join('');
  });
}
document.getElementById('forumForm').addEventListener('submit', function(e){
  e.preventDefault();
  const text = document.getElementById('forumInput').value;
  fetch('/api/forum', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({text})
  }).then(()=>{ loadForum(); document.getElementById('forumForm').reset(); });
});

// Talent
function loadTalent() {
  fetch('/api/talent').then(res=>res.json()).then(list => {
    const ul = document.getElementById('talentList');
    ul.innerHTML = list.map(t=>`<li>${t.name} (${t.skills})</li>`).join('');
  });
}
document.getElementById('talentForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('talentName').value;
  const skills = document.getElementById('talentSkills').value;
  fetch('/api/talent', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name,skills})
  }).then(()=>{ loadTalent(); document.getElementById('talentForm').reset(); });
});

// Co-Creation
function loadFeedback() {
  fetch('/api/feedback').then(res=>res.json()).then(list => {
    const ul = document.getElementById('feedbackList');
    ul.innerHTML = list.map(f=>`<li>${f.text}</li>`).join('');
  });
}
document.getElementById('feedbackForm').addEventListener('submit', function(e){
  e.preventDefault();
  const text = document.getElementById('feedbackInput').value;
  fetch('/api/feedback', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({text})
  }).then(()=>{ loadFeedback(); document.getElementById('feedbackForm').reset(); });
});

// Live Interaction
function startLiveSession(platform) {
  fetch(`/api/live/${platform}`)
    .then(res=>res.json())
    .then(data=>{ document.getElementById('liveStatus').innerText = data.status; })
    .catch(()=>{ document.getElementById('liveStatus').innerText = 'Failed to start session.'; });
}

// A/B Testing
function runABTest() {
  fetch('/api/abtest').then(res=>res.json()).then(result => {
    document.getElementById('abTestResult').innerText = result.summary;
  });
}

// Language
function setLanguage() {
  const lang = document.getElementById('languageSelect').value;
  fetch('/api/language', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({lang})
  }).then(()=>{ alert('Language set!'); });
}

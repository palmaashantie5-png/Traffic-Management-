# Traffic-Management-
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Quezon City Smart Traffic Management System">
  <title>Smart Traffic Management</title>
  <style>
    :root{--navy:#0f172a;--blue:#2563eb;--blue-dark:#1d4ed8;--bg:#f1f5f9;--line:#e2e8f0;--muted:#64748b;--green:#10b981;--amber:#f59e0b;--red:#ef4444}
    *{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--navy)}
    .login{min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#0f172a,#2563eb)}
    .login.hidden,.shell.hidden{display:none}.login-card{width:min(100%,420px);padding:32px 28px;background:#fff;border-radius:18px;box-shadow:0 24px 60px #0f172a59}.logo{text-align:center;font-size:52px;margin-bottom:8px}h1{margin:0 0 8px;text-align:center;font-size:32px}.muted{text-align:center;color:var(--muted);margin:0 0 24px}.field{margin-bottom:18px}label{display:block;font-weight:600;font-size:14px;margin-bottom:8px}input,button{font:inherit}input{width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:10px;font-size:15px}input:focus{outline:0;border-color:var(--blue);box-shadow:0 0 0 4px #2563eb1f}.primary-btn,.btn{width:100%;padding:12px 16px;border:0;border-radius:10px;background:var(--blue);color:#fff;font-weight:700;cursor:pointer}.primary-btn:hover,.btn:hover{background:var(--blue-dark)}
    .shell{display:grid;grid-template-columns:240px 1fr;grid-template-rows:72px auto;min-height:100vh}.header{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:16px 24px;background:#fff;border-bottom:1px solid var(--line)}.brand{font-size:24px;font-weight:700}.brand small{display:block;font-size:12px;font-weight:400;color:var(--muted);margin-top:4px}.user-info{text-align:right}.user-name{font-weight:700}.user-role{font-size:12px;color:var(--muted);margin-top:4px}.logout-btn{margin-top:8px;padding:8px 16px;border:0;border-radius:8px;background:var(--red);color:#fff;font-weight:600;cursor:pointer}.sidebar{padding:20px 0;background:#fff;border-right:1px solid var(--line)}.nav{margin:0;padding:0;list-style:none}.nav button{width:100%;padding:12px 20px;border:0;border-left:4px solid transparent;background:0;color:var(--navy);font-weight:600;text-align:left;cursor:pointer}.nav button:hover,.nav button.active{background:#2563eb1f;border-left-color:var(--blue);color:var(--blue)}.content{padding:24px;overflow-y:auto}.page{display:none}.page.active{display:block}.content h2{margin:0 0 24px;font-size:28px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:24px}.card{padding:20px;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 1px 3px #0f172a14}.card h3{margin:0 0 8px;font-size:16px}.card p{margin:0;color:var(--muted);font-size:14px}.card-value{margin:12px 0;font-size:32px;font-weight:700}.status{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}.good{background:#10b9811f;color:var(--green)}.warning{background:#f59e0b1f;color:var(--amber)}.critical{background:#ef44441f;color:var(--red)}.btn-group{display:flex;gap:12px;margin-top:16px}.btn-secondary{flex:1;padding:10px 16px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--navy);font-weight:600;cursor:pointer}.btn-secondary:hover{background:var(--bg);border-color:var(--blue);color:var(--blue)}
    @media(max-width:700px){.shell{grid-template-columns:1fr;grid-template-rows:auto auto 1fr}.header{grid-column:1;padding:14px 18px}.sidebar{border-right:0;border-bottom:1px solid var(--line);padding:8px 0}.nav{display:flex;overflow:auto}.nav button{white-space:nowrap}.content{padding:18px}.btn-group{flex-direction:column}}
  </style>
</head>
<body>
  <section id="login" class="login">
    <form id="loginForm" class="login-card">
      <div class="logo">🚦</div><h1>Smart Traffic Management</h1><p class="muted">Sign in to continue</p>
      <div class="field"><label for="username">Username</label><input id="username" type="text" autocomplete="username" required></div>
      <div class="field"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" required></div>
      <button type="submit" class="primary-btn">Sign In</button>
    </form>
  </section>

  <div id="app" class="shell hidden">
    <header class="header"><div class="brand">🚦 Smart Traffic<small>Quezon City operations</small></div><div class="user-info"><div id="userName" class="user-name">Administrator</div><div id="userRole" class="user-role">Administrator</div><button id="logoutBtn" class="logout-btn" type="button">Logout</button></div></header>
    <aside class="sidebar"><nav class="nav"><button class="nav-btn active" data-page="dashboard">📊 Dashboard</button><button class="nav-btn" data-page="live-map">🗺️ Live Map</button><button class="nav-btn" data-page="traffic">🚗 Traffic Monitoring</button><button class="nav-btn" data-page="reports">📋 Reports</button></nav></aside>
    <main class="content">
      <section id="dashboard" class="page active"><h2>Dashboard</h2><div class="cards"><div class="card"><h3>Free Flow Roads</h3><div class="card-value" style="color:var(--green)">12</div><p>Roads with smooth traffic</p><span class="status good">✓ Normal</span></div><div class="card"><h3>Moderate Traffic</h3><div class="card-value" style="color:var(--amber)">8</div><p>Slower than usual</p><span class="status warning">⚠ Caution</span></div><div class="card"><h3>Congested Roads</h3><div class="card-value" style="color:var(--red)">3</div><p>Heavy congestion</p><span class="status critical">✕ Critical</span></div></div><div class="card"><h3>Quick Actions</h3><p>Access key features and tools</p><div class="btn-group"><button class="btn-secondary" data-go="live-map">View Live Map</button><button class="btn-secondary" data-go="traffic">Check Traffic</button><button class="btn-secondary" data-go="reports">View Reports</button></div></div></section>
      <section id="live-map" class="page"><h2>Live Traffic Map</h2><div class="card"><p style="margin-bottom:16px">Real-time traffic conditions within Quezon City.</p><button class="btn-secondary" type="button" id="openMap">📍 Open Live Map</button></div></section>
      <section id="traffic" class="page"><h2>Traffic Monitoring</h2><div class="cards"><div class="card"><h3>EDSA North</h3><div class="card-value" style="color:var(--green)">20%</div><p>Current congestion level</p><span class="status good">Free Flow</span></div><div class="card"><h3>Commonwealth Avenue</h3><div class="card-value" style="color:var(--red)">85%</div><p>Current congestion level</p><span class="status critical">Congested</span></div><div class="card"><h3>Quezon Avenue</h3><div class="card-value" style="color:var(--green)">30%</div><p>Current congestion level</p><span class="status good">Free Flow</span></div></div></section>
      <section id="reports" class="page"><h2>Reports &amp; Analytics</h2><div class="card"><h3>Traffic Summary</h3><p style="margin:12px 0">Peak Hours: 7-9 AM, 5-7 PM</p><p style="margin:12px 0">Average Congestion: 45%</p><p style="margin:12px 0">Most Congested Road: Commonwealth Avenue</p></div></section>
    </main>
  </div>
  <script>
    const users={admin:{name:'Administrator'},officer:{name:'Traffic Officer'},viewer:{name:'Viewer'}};
    const $=id=>document.getElementById(id);
    function showApp(username){$('userName').textContent=username.charAt(0).toUpperCase()+username.slice(1);$('userRole').textContent=users[username].name;$('login').classList.add('hidden');$('app').classList.remove('hidden');}
    $('loginForm').addEventListener('submit',event=>{event.preventDefault();const username=$('username').value.trim();const password=$('password').value;if(users[username]&&password==='1234'){localStorage.setItem('currentUser',username);showApp(username)}else alert('Invalid username or password.');});
    function navigateTo(page){document.querySelectorAll('.page').forEach(item=>item.classList.toggle('active',item.id===page));document.querySelectorAll('.nav-btn').forEach(item=>item.classList.toggle('active',item.dataset.page===page));window.scrollTo(0,0)}
    document.querySelectorAll('.nav-btn,[data-go]').forEach(button=>button.addEventListener('click',()=>navigateTo(button.dataset.page||button.dataset.go)));
    $('openMap').addEventListener('click',()=>window.open('live-map.html','_blank'));
    $('logoutBtn').addEventListener('click',()=>{localStorage.removeItem('currentUser');$('loginForm').reset();$('login').classList.remove('hidden');$('app').classList.add('hidden')});
    const savedUser=localStorage.getItem('currentUser');if(savedUser&&users[savedUser])showApp(savedUser);
  </script>
</body>
</html>

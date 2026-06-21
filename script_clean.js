
<script type="module">
          import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
          import { getDatabase, ref, set, push, onValue, remove, update } from 
"https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
  
          // =========================================================
          // IMPORTANT: REPLACE THIS CONFIG WITH YOUR FIREBASE CONFIG
          // =========================================================
          const firebaseConfig = {
              databaseURL: "https://sposserver-license-default-rtdb.asia-southeast1.firebasedatabase.app/"
          };
          
          let db;
          let allServices = [];
          let allClients = [];
          let currentClientsData = {};
  
          // ===== LOGIN LOGIC =====
          window.doLogin = (e) => {
              e.preventDefault();
              const user = document.getElementById('loginUser').value.trim();
              const pass = document.getElementById('loginPass').value;
              if (user === 'spos official' && pass === '@Saveen2014518') {
                  document.getElementById('loginOverlay').style.display = 'none';
                  document.getElementById('mainApp').style.display = 'block';
              } else {
                  const err = document.getElementById('loginError');
                  err.textContent = '❌ Invalid username or password!';
                  document.getElementById('loginPass').value = '';
                  setTimeout(() => { err.textContent = ''; }, 3000);
              }
          };
          // ===== END LOGIN LOGIC =====
  
          // Tab Switching Logic
          window.switchTab = (tabId, btn) => {
              document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
              document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
              document.getElementById(tabId).classList.add('active');
              btn.classList.add('active');
          };
  
          // Init App
          if (!firebaseConfig.databaseURL) {
              document.getElementById('configAlert').style.display = 'block';
          } else {
              const app = initializeApp(firebaseConfig);
              db = getDatabase(app);
              
              // Set default date for Service Form to today
              document.getElementById('srvDate').valueAsDate = new Date();
  
              loadClients();
              loadServices();
          }
  
          // ==========================================
          // 1. LICENSE MANAGER LOGIC
          // ==========================================
          window.generateAllKeys = () => {
              const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_-<=+!~';
              const actC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              const gen = (chars, len) => Array.from({length: len}).map(() => chars.charAt(Math.floor(Math.random() * 
chars.length))).join('');
              
              document.getElementById('key1').value = gen(c, 10);
              document.getElementById('key2').value = gen(c, 10);
              document.getElementById('key3').value = gen(c, 10);
              document.getElementById('actKey').value = 'ACT-' + gen(actC, 12);
          };
  
          document.getElementById('licenseForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              if(!db) return;
  
              const company = document.getElementById('companyName').value.trim();
              const nodeKey = company.replace(/[.#$[\]\s]/g, '_'); 
  
              const data = {
                  CompanyName: company,
                  Address1: document.getElementById('address1').value.trim(),
                  Address2: document.getElementById('address2').value.trim(),
                  Address3: document.getElementById('address3').value.trim(),
                  Email: document.getElementById('clientEmail').value.trim(),
                  Phone1: document.getElementById('phone1').value.trim(),
                  Phone2: document.getElementById('phone2').value.trim(),
                  LicenseKey1: document.getElementById('key1').value.trim(),
                  LicenseKey2: document.getElementById('key2').value.trim(),
                  LicenseKey3: document.getElementById('key3').value.trim(),
                  ActivationKey: document.getElementById('actKey').value.trim(),
                  DurationDays: parseInt(document.getElementById('durationDays').value, 10),
                  CreatedAt: new Date().toISOString()
              };
  
              try {
                  await set(ref(db, 'licenses/' + nodeKey), data);
                  alert("Client Saved!");
                  e.target.reset();
              } catch (error) {
                  alert("Error saving: " + error.message);
              }
          });
  
          function loadClients() {
              onValue(ref(db, 'licenses'), (snapshot) => {
                  const tbody = document.querySelector('#clientTable tbody');
                  const select = document.getElementById('srvClient');
                  tbody.innerHTML = '';
                  select.innerHTML = '<option value="">-- Select Client --</option>';
                  allClients = [];
                  currentClientsData = {};
                  
                  const data = snapshot.val();
                  if (data) {
                      currentClientsData = data;
                      Object.keys(data).forEach(nodeKey => {
                          const client = data[nodeKey];
                          allClients.push(client);
                          
                          // Populate Table
                          const tr = document.createElement('tr');
                          tr.innerHTML = `
                              <td>${client.CompanyName}</td>
                              <td style="font-size:12px;">${client.Phone1 || '-'} <br> <span 
style="color:#64748b">${client.Address1 || ''}</span></td>
                              <td title="K1: ${client.LicenseKey1}\nK2: ${client.LicenseKey2}\nK3: 
${client.LicenseKey3}">${client.ActivationKey}</td>
                              <td>${client.DurationDays || 'N/A'} Days<br><span style="font-size:10px; 
color:#64748b">${client.CreatedAt ? new Date(client.CreatedAt).toLocaleDateString() : ''}</span></td>
                              <td>
                                  <button class="action-btn" style="background:#f59e0b;" 
onclick="editClient('${nodeKey}')">Edit</button>
                                  <button class="action-btn btn-danger" 
onclick="deleteClient('${nodeKey}')">Delete</button>
                              </td>
                          `;
                          tbody.appendChild(tr);
  
                          // Populate Select for Services Form
                          const option = document.createElement('option');
                          option.value = client.CompanyName;
                          option.text = client.CompanyName;
                          select.appendChild(option);
                      });
                  } else {
                      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No clients found</td></tr>';
                  }
              });
          }
  
          window.editClient = (nodeKey) => {
              const client = currentClientsData[nodeKey];
              if (!client) return;
  
              document.getElementById('companyName').value = client.CompanyName || '';
              document.getElementById('address1').value = client.Address1 || '';
              document.getElementById('address2').value = client.Address2 || '';
              document.getElementById('address3').value = client.Address3 || '';
              document.getElementById('clientEmail').value = client.Email || '';
              document.getElementById('phone1').value = client.Phone1 || '';
              document.getElementById('phone2').value = client.Phone2 || '';
              document.getElementById('key1').value = client.LicenseKey1 || '';
              document.getElementById('key2').value = client.LicenseKey2 || '';
              document.getElementById('key3').value = client.LicenseKey3 || '';
              document.getElementById('actKey').value = client.ActivationKey || '';
              document.getElementById('durationDays').value = client.DurationDays || 365;
  
              // Focus on the form
              document.getElementById('companyName').focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
          };
  
          window.filterClientSelect = () => {
              const input = document.getElementById('srvClientSearch').value.toLowerCase();
              const options = document.getElementById('srvClient').options;
              // Start from 1 to skip the "-- Select Client --" option
              for (let i = 1; i < options.length; i++) {
                  const text = options[i].text.toLowerCase();
                  options[i].style.display = text.includes(input) ? '' : 'none';
              }
          };
  
          window.deleteClient = async (nodeKey) => {
              if (confirm("Delete this client license?")) await remove(ref(db, 'licenses/' + nodeKey));
          };
  
          window.filterLicenseTable = () => {
              const input = document.getElementById('searchClient').value.toLowerCase();
              document.querySelectorAll('#clientTable tbody tr').forEach(row => {
                  const cell = row.querySelector('td:first-child');
                  if (cell) row.style.display = cell.textContent.toLowerCase().includes(input) ? '' : 'none';
              });
          };
  
          // ==========================================
          // 2. SERVICES & BILLING LOGIC
          // ==========================================
          window.calcCredit = () => {
              const total = parseFloat(document.getElementById('srvTotal').value) || 0;
              const paid = parseFloat(document.getElementById('srvPaid').value) || 0;
              const credit = total - paid;
              document.getElementById('srvCredit').value = credit > 0 ? credit.toFixed(2) : '0.00';
          };
  
          let currentOtp = null;
          let pendingServiceData = null;
          let pendingApprovalId = null;
          let isApproving = false;
  
          document.getElementById('serviceForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              if(!db) return;
  
              const clientName = document.getElementById('srvClient').value.trim();
              const total = parseFloat(document.getElementById('srvTotal').value) || 0;
              const paid = parseFloat(document.getElementById('srvPaid').value) || 0;
              const credit = total - paid;
  
              const client = allClients.find(c => c.CompanyName === clientName);
              if (!client || !client.Email) {
                  alert("This client does not have an Email Address registered. Please update their details first.");
                  return;
              }
  
              pendingServiceData = {
                  ClientName: clientName,
                  Date: document.getElementById('srvDate').value,
                  Description: document.getElementById('srvDesc').value.trim(),
                  TotalAmount: total,
                  PaidAmount: paid,
                  CreditAmount: credit > 0 ? credit : 0,
                  Status: 'Pending Approval',
                  Timestamp: Date.now()
              };
  
              isApproving = false;
              currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
              const body = `Your Job Roll Number is ${currentOtp}`;
              window.location.href = `mailto:${client.Email}?subject=Service Creation 
OTP&body=${encodeURIComponent(body)}`;
              
              document.getElementById('otpInput').value = '';
              document.getElementById('otpModal').style.display = 'flex';
          });
  
          window.closeOtpModal = () => {
              document.getElementById('otpModal').style.display = 'none';
              currentOtp = null;
              pendingServiceData = null;
              pendingApprovalId = null;
          };
  
          window.verifyOtp = async () => {
              const input = document.getElementById('otpInput').value.trim();
              if (input !== currentOtp) {
                  alert("Invalid OTP! Please try again.");
                  return;
              }
  
              try {
                  if (isApproving && pendingApprovalId) {
                      await set(ref(db, services//Status), 'Approved');
                      alert("Service Note Approved Successfully!");
                  } else if (pendingServiceData) {
                      const newServiceRef = push(ref(db, 'services'));
                      await set(newServiceRef, pendingServiceData);
                      alert("Service Record Saved Successfully!");
                      document.getElementById('serviceForm').reset();
                      document.getElementById('srvDate').valueAsDate = new Date();
                  }
                  closeOtpModal();
              } catch (error) {
                  alert("Error: " + error.message);
              }
          };
  
          window.openApprovalModal = (serviceId) => {
              pendingApprovalId = serviceId;
              document.getElementById('approvalModal').style.display = 'flex';
          };
  
          window.closeApprovalModal = () => {
              document.getElementById('approvalModal').style.display = 'none';
              pendingApprovalId = null;
          };
  
          window.initiateApproval = (method) => {
              if (!pendingApprovalId) return;
              const service = allServices.find(s => s.id === pendingApprovalId);
              const client = allClients.find(c => c.CompanyName === service.ClientName);
  
              if (method === 'email' && (!client || !client.Email)) {
                  alert("Client has no email registered!"); return;
              }
              if (method === 'sms' && (!client || !client.Phone1)) {
                  alert("Client has no Phone 1 registered!"); return;
              }
  
              currentOtp = Math.floor(100000 + Math.random() * 900000).toString();
              const body = `Your Job Roll Number is ${currentOtp}`;
  
              if (method === 'email') {
                  window.location.href = `mailto:${client.Email}?subject=Service Approval 
OTP&body=${encodeURIComponent(body)}`;
              } else {
                  window.location.href = `sms:${client.Phone1}?body=${encodeURIComponent(body)}`;
              }
  
              isApproving = true;
              document.getElementById('approvalModal').style.display = 'none';
              document.getElementById('otpInput').value = '';
              document.getElementById('otpModal').style.display = 'flex';
          };
  
          function loadServices() {
              onValue(ref(db, 'services'), (snapshot) => {
                  allServices = [];
                  const data = snapshot.val();
                  if (data) {
                      Object.keys(data).forEach(key => {
                          allServices.push({ id: key, ...data[key] });
                      });
                      // Sort descending by Timestamp
                      allServices.sort((a, b) => b.Timestamp - a.Timestamp);
                  }
                  renderServices();
              });
          }
  
          window.renderServices = () => {
              const tbody = document.querySelector('#serviceTable tbody');
              tbody.innerHTML = '';
  
              // Get Filter Values
              const fltClient = document.getElementById('fltClient').value.toLowerCase();
              const fltStartDate = document.getElementById('fltStartDate').value;
              const fltEndDate = document.getElementById('fltEndDate').value;
              const fltStatus = document.getElementById('fltStatus').value;
  
              const filtered = allServices.filter(s => {
                  let match = true;
                  if (fltClient && !s.ClientName.toLowerCase().includes(fltClient)) match = false;
                  if (fltStartDate && s.Date < fltStartDate) match = false;
                  if (fltEndDate && s.Date > fltEndDate) match = false;
                  if (fltStatus === 'SETTLED' && s.Status !== 'Settled') match = false;
                  if (fltStatus === 'UNSETTLED' && s.Status !== 'Unsettled') match = false;
                  if (fltStatus === 'PENDING' && s.Status !== 'Pending Approval') match = false;
                  return match;
              });
  
              if (filtered.length === 0) {
                  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No services match 
filters</td></tr>';
                  return;
              }
  
              filtered.forEach(s => {
                  const tr = document.createElement('tr');
                  const badgeClass = s.Status === 'Settled' ? 'badge-success' : 'badge-warning';
                  
                  tr.innerHTML = `
                      <td style="white-space: nowrap;">${s.Date}</td>
                      <td><strong>${s.ClientName}</strong></td>
                      <td>${s.Description}</td>
                      <td>Rs ${s.TotalAmount.toFixed(2)}</td>
                      <td style="color:#fbbf24; font-weight:bold;">${s.CreditAmount > 0 ? 'Rs ' + 
s.CreditAmount.toFixed(2) : '-'}</td>
                      <td><span class="badge ${badgeClass}">${s.Status}</span></td>
                      <td>
                          ${s.Status === 'Pending Approval' ?
                            `<button class="action-btn" style="background:#8b5cf6;" 
onclick="openApprovalModal('${s.id}')">Approve</button>` : ''}
                          ${s.Status === 'Unsettled' || s.Status === 'Approved' ? 
                            `<button class="action-btn btn-success" onclick="addPayment('${s.id}', ${s.CreditAmount}, 
${s.PaidAmount})">Settle</button>` : 
                            ''}
                          <button class="action-btn btn-danger" onclick="deleteService('${s.id}')">Del</button>
                      </td>
                  `;
                  tbody.appendChild(tr);
              });
          };
  
          window.clearServiceFilters = () => {
              document.getElementById('fltClient').value = '';
              document.getElementById('fltStartDate').value = '';
              document.getElementById('fltEndDate').value = '';
              document.getElementById('fltStatus').value = 'ALL';
              renderServices();
          };
  
          window.addPayment = async (serviceId, currentCredit, currentPaid) => {
              const amountStr = prompt(`Current Credit: Rs ${currentCredit.toFixed(2)}\nEnter amount paying now:`);
              if (amountStr === null) return;
              
              const payAmount = parseFloat(amountStr);
              if (isNaN(payAmount) || payAmount <= 0) return alert("Invalid amount.");
              if (payAmount > currentCredit) return alert("Payment exceeds credit balance!");
  
              const newPaid = currentPaid + payAmount;
              const newCredit = currentCredit - payAmount;
              const newStatus = (newCredit <= 0) ? 'Settled' : 'Unsettled';
  
              try {
                  await update(ref(db, 'services/' + serviceId), {
                      PaidAmount: newPaid,
                      CreditAmount: newCredit,
                      Status: newStatus
                  });
              } catch (error) {
                  alert("Error updating payment: " + error.message);
              }
          };
  
          window.deleteService = async (serviceId) => {
              if (confirm("Delete this service record?")) {
                  await remove(ref(db, 'services/' + serviceId));
              }
          };
      </script>
  
      <!-- OTP Verification Modal -->
      <div id="otpModal" class="modal-overlay">
          <div class="modal-box">
              <h3>Verify Action</h3>
              <p id="otpMsg" style="color:#cbd5e1; font-size:14px; margin-bottom:15px;">Please enter the OTP sent to 
the client.</p>
              <input type="text" id="otpInput" maxlength="6" placeholder="000000" autocomplete="off">
              <div class="modal-actions">
                  <button type="button" class="btn-danger" onclick="closeOtpModal()">Cancel</button>
                  <button type="button" onclick="verifyOtp()">Verify OTP</button>
              </div>
          </div>
      </div>
  
      <!-- Approval Choice Modal -->
      <div id="approvalModal" class="modal-overlay">
          <div class="modal-box">
              <h3>Approve Service Note</h3>
              <p style="color:#cbd5e1; font-size:14px; margin-bottom:15px;">How do you want to send the OTP code to 
the client?</p>
              <div class="modal-actions" style="flex-direction: column;">
                  <button type="button" onclick="initiateApproval('email')" style="background: #2563eb;">Send via 
Email</button>
                  <button type="button" onclick="initiateApproval('sms')" style="background: #10b981;">Send via 
SMS</button>
                  <button type="button" class="btn-danger" onclick="closeApprovalModal()" style="margin-top: 
10px;">Cancel</button>
              </div>
          </div>
      </div>
  </body>
  </html>



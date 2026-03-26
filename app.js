// c:\Users\acer\Desktop\church-website\app.js

// --- Mock Data ---
const EVENTS = [
    { id: 1, title: 'Sunday Services', date: '6:00-7:00 AM | 8:00-11:00 AM | 11:00-12:30 PM', desc: 'Join us for our morning, main, and afternoon services.' }
];

let MEMBERS = JSON.parse(localStorage.getItem('MEMBERS') || JSON.stringify([
    { id: 1, name: 'Jose Andrews', role: 'Leader', phone: '9876543210', address: 'Church Street, Main City' },
    { id: 2, name: 'Anand', role: 'Believer', phone: '9000000000', address: 'East side, Cross town' },
    { id: 3, name: 'Sanjay', role: 'Believer', phone: '9111111111', address: 'West side, New park' },
    { id: 4, name: 'Sam joshua', role: 'Believer', phone: '9222222222', address: 'Church lane' },
    { id: 5, name: 'Shyam david ', role: 'Believer', phone: '9333333333', address: 'Temple road' },
    { id: 6, name: 'Praveen', role: 'Believer', phone: '9444444444', address: 'Station view' },
    { id: 7, name: 'yuvaraj', role: 'Believer', phone: '9555555555', address: 'Green garden' }
]));

// --- State ---
let PRAYER_REQUESTS = JSON.parse(localStorage.getItem('PRAYER_REQUESTS') || '[]');
let currentUser = null;
let currentView = 'home';
let searchQuery = '';

function saveMembers() {
    localStorage.setItem('MEMBERS', JSON.stringify(MEMBERS));
}

// --- Routing & Auth ---
window.navigateTo = function (view) {
    if (view === 'admin' && (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'Elder' && currentUser.role !== 'Leader'))) {
        view = 'login';
    }
    if (view === 'believer_portal' && !currentUser) {
        view = 'login';
    }
    const publicViews = ['home', 'about', 'watch', 'events_page', 'next_steps', 'kids_church', 'give', 'login'];
    if (!publicViews.includes(view) && !currentUser) {
        view = 'login';
    }
    currentView = view;
    render();
}



window.loginMember = function (event) {
    event.preventDefault();
    const nameEl = document.getElementById('believer-name');
    const phoneEl = document.getElementById('believer-phone');
    const addressEl = document.getElementById('believer-address');

    if (!nameEl) return;
    const name = nameEl.value.trim();
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const address = addressEl ? addressEl.value.trim() : '';
    
    if (name) {
        // Find existing or create temporary "Believer" profile
        let member = MEMBERS.find(m => m.name.toLowerCase() === name.toLowerCase());
        if (!member) {
            // Check if they want to register
            const confirmNew = confirm(`Welcome ${name}! You are not in our records yet. Would you like to join our community?`);
            if (confirmNew) {
                const newId = MEMBERS.length > 0 ? Math.max(...MEMBERS.map(m => m.id)) + 1 : 1;
                member = { id: newId, name: name, role: 'Believer', phone: phone || 'Not provided', address: address || 'Not provided' };
                MEMBERS.push(member);
                saveMembers();
            } else {
                return;
            }
        }
        
        currentUser = member;
        document.getElementById('logout-btn').style.display = 'inline-block';
        
        if (member.role === 'Leader' || member.role === 'Elder' || member.role === 'admin') {
            document.getElementById('admin-nav-btn').innerText = 'Dashboard';
            navigateTo('admin');
        } else {
            document.getElementById('admin-nav-btn').innerText = 'My Portal';
            navigateTo('believer_portal');
        }
    }
}

window.login = function (event) {
    event.preventDefault();
    const password = document.getElementById('security-pass').value;
    if (password === 'joseandrewsk') {
        currentUser = { role: 'admin' };
        document.getElementById('logout-btn').style.display = 'inline-block';
        document.getElementById('admin-nav-btn').innerText = 'Dashboard';
        navigateTo('admin');
    } else {
        alert('Invalid security password. Only family members allowed.');
    }
}

window.updateProfile = function (event) {
    event.preventDefault();
    const phone = document.getElementById('edit-phone').value.trim();
    const address = document.getElementById('edit-address').value.trim();
    
    if (currentUser) {
        currentUser.phone = phone;
        currentUser.address = address;
        
        // Update the main MEMBERS array
        const index = MEMBERS.findIndex(m => m.id === currentUser.id);
        if (index !== -1) {
            MEMBERS[index] = { ...currentUser };
            saveMembers();
            alert('Profile updated successfully!');
            render();
        }
    }
}

window.deletePrayerRequest = function (timestamp) {
    if (!confirm('Are you sure you want to remove this prayer request?')) return;
    PRAYER_REQUESTS = PRAYER_REQUESTS.filter(r => r.timestamp !== timestamp);
    localStorage.setItem('PRAYER_REQUESTS', JSON.stringify(PRAYER_REQUESTS));
    renderAdminContent();
}

// Attendance system removed per user request.
// Only keeping Prayer Request management for Admin.





window.showQRCode = function() {
    const url = window.location.href;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    
    // Create a beautiful modal for the QR code
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.9);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; animation: fadeIn 0.3s ease-out;
    `;
    modal.innerHTML = `
        <div style="background: white; padding: 2.5rem; border-radius: 2rem; text-align: center; max-width: 350px; position: relative;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 1.5rem;">Scan & Share! 📲</h3>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 2rem;">Anyone can scan this to open your Church Portal.</p>
            <img src="${qrUrl}" alt="QR Code" style="width: 200px; height: 200px; border-radius: 1rem; border: 4px solid #f8fafc; margin-bottom: 1.5rem;">
            <button onclick="this.parentElement.parentElement.remove()" class="btn" style="background: var(--primary); color: white; border-radius: 1rem;">Done</button>
        </div>
    `;
    document.body.appendChild(modal);
}

window.copyPortalLink = function() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('✨ Portal Link Copied! Send it to your group! 🕊️');
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        z-index: 10000;
        font-weight: 600;
        animation: slideUp 0.3s ease-out;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Renderers ---
const appContainer = document.getElementById('app-container');

function renderAdminContent() {
    const adminContainer = document.getElementById('admin-content');
    if (!adminContainer) return;

    let prayerRequestsHtml = PRAYER_REQUESTS.map(r => {
        return `
            <div class="attendance-item" style="display: block; padding: 1.5rem; position: relative; border-left: 4px solid var(--primary);">
                <div style="font-weight: bold; color: var(--primary); font-size: 1.1rem; margin-bottom: 0.5rem;">${r.name}</div>
                <div style="font-size: 1rem; margin-bottom: 1rem; line-height: 1.5;"><strong>Request:</strong> ${r.request}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <span>📅 DOB: ${r.dob} (Age: ${r.age})</span>
                    <span>📍 City: ${r.city}</span>
                    <span>📞 Phone: ${r.phone}</span>
                    <span>✉️ Email: ${r.email}</span>
                    <span style="grid-column: span 2;">🏠 Address: ${r.address}</span>
                    <span style="grid-column: span 2;">💬 Contact Requested: ${r.contact ? 'Yes' : 'No'}</span>
                    <span style="grid-column: span 2; font-size: 0.75rem;">⏰ Submitted: ${r.timestamp}</span>
                </div>
                <button onclick="deletePrayerRequest('${r.timestamp}')" style="position: absolute; top: 1rem; right: 1rem; background: #fee2e2; border: 1px solid #ef4444; color: #ef4444; padding: 0.25rem 0.6rem; border-radius: 0.5rem; cursor: pointer; font-size: 1.2rem; font-weight: bold;" title="Delete">×</button>
            </div>
        `;
    }).reverse().join('');

    if (PRAYER_REQUESTS.length === 0) {
        prayerRequestsHtml = '<div style="text-align:center; padding: 3rem; color: var(--text-muted);">No prayer requests received yet.</div>';
    }

    const membersTableRows = MEMBERS.map((m, index) => `
        <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 1rem; font-weight: 500;">${index + 1}</td>
            <td style="padding: 1rem;">${m.name}</td>
            <td style="padding: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <a href="tel:${m.phone}" style="color: var(--primary); text-decoration: none; font-weight: 600; font-size: 0.95rem;">${m.phone || 'N/A'}</a>
                    <a href="https://wa.me/${m.phone}" target="_blank" style="display: flex; align-items: center; justify-content: center; background: #22c55e; color: white; padding: 0.3rem; border-radius: 50%; width: 22px; height: 22px; text-decoration: none; font-size: 0.8rem;" title="Chat on WhatsApp">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                </div>
            </td>
            <td style="padding: 1rem;">${m.address || 'N/A'}</td>
            <td style="padding: 1rem;"><span style="font-size: 0.8rem; color: var(--primary); background: #eff6ff; padding: 0.2rem 0.6rem; border-radius: 1rem; font-weight: 600;">${m.role || 'Believer'}</span></td>
        </tr>
    `).join('');

    adminContainer.innerHTML = `
        <div class="admin-grid" style="grid-template-columns: 1fr; gap: 2rem;">
            <div class="admin-panel">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0;">📋 Total Members Library</h3>
                    <div style="background: var(--primary); color: white; padding: 0.4rem 1rem; border-radius: 2rem; font-weight: bold; font-size: 0.9rem;">
                        ${MEMBERS.length} Total
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid var(--border);">
                                <th style="padding: 1rem; width: 50px;">#</th>
                                <th style="padding: 1rem;">Name</th>
                                <th style="padding: 1rem;">Phone</th>
                                <th style="padding: 1rem;">Address</th>
                                <th style="padding: 1rem;">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${membersTableRows}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="admin-panel">
                <h3 style="margin-bottom: 1.5rem;">🙏 Incoming Prayer Requests</h3>
                <div class="attendance-list" style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
                    ${prayerRequestsHtml}
                </div>
            </div>
        </div>
    `;
}

function render() {
    // Scroll to top on navigation
    window.scrollTo(0, 0);

    // Reset and trigger animation
    appContainer.classList.remove('view-active');
    void appContainer.offsetWidth; // Force reflow
    appContainer.classList.add('view-active');

    if (currentView === 'home') {
        let eventsHtml = EVENTS.map(ev => {
            return '<div class="event-card">' +
                '<div class="event-date">' + ev.date + '</div>' +
                '<h3 class="event-title">' + ev.title + '</h3>' +
                '<p class="event-desc">' + ev.desc + '</p>' +
                '</div>';
        }).join('');

        appContainer.innerHTML = `
            <div class="hero">
                <h1>welcome to Church</h1>
                <p>We are a loving community welcoming everyone with open arms. Join us as we grow together in faith, hope, and love.</p>
                <br>
                <button class="btn" onclick="document.getElementById('events').scrollIntoView({behavior: 'smooth'})" style="width: auto;">See Sunday Services</button>
            </div>
            
            <div class="card-body" style="background: white; border: 2px solid var(--border); border-radius: 2.5rem; padding: 2rem; max-width: 400px; margin: 3rem auto; box-shadow: var(--shadow-md); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: #e0e7ff; border-radius: 50%; z-index: 0; opacity: 0.5;"></div>
                <div style="position: relative; z-index: 1;">
                    <div style="width: 60px; height: 60px; margin: 0 auto 0.5rem;">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="48" stroke="#4f46e5" stroke-width="4"/>
                            <path d="M50 35C54.4183 35 58 31.4183 58 27C58 22.5817 54.4183 19 50 19C45.5817 19 42 22.5817 42 27C42 31.4183 45.5817 35 50 35Z" fill="#4f46e5"/>
                            <path d="M48 38C40.268 38 34 44.268 34 52V65C34 67.2091 35.7909 69 38 69H45V78H55V69H62C64.2091 69 66 67.2091 66 65V52C66 44.268 59.732 38 52 38H48ZM55 52L60 57L55 62L53 60L56 57L53 54L55 52Z" fill="#4f46e5"/>
                        </svg>
                    </div>
                    <div style="font-weight: 800; font-size: 1.2rem; color: #4f46e5; margin-bottom: 1rem; letter-spacing: 0.1em;">PRAY</div>
                    <span style="background: #e0e7ff; color: #4338ca; padding: 0.3rem 1rem; border-radius: 2rem; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.05em; display: inline-block;">PRAYER REQUEST</span>
                    <p style="font-size: 1.1rem; margin: 1.5rem 0; color: var(--text-muted); line-height: 1.5;">"We would love to pray for you."</p>
                    <a href="prayerrequestform/index.html" style="text-decoration: none;">
                        <button class="btn" style="width: auto; padding: 0.8rem 2rem; font-size: 1rem; border-radius: 1.5rem; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border: none;">Send Request 🕊️</button>
                    </a>
                </div>
            </div>

            <h2 id="events" class="text-center mb-2" style="margin-top: 4rem;">What's Happening Tomorrow?</h2>
            <div class="events-section">
                ${eventsHtml}
            </div>
        `;
    }
    else if (currentView === 'login') {
        appContainer.innerHTML = `
            <div style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center; max-width: 900px; margin: 0 auto; animation: slideUp 0.5s ease-out;">
                <div class="auth-container" style="flex: 1; min-width: 300px; margin: 0;">
                    <h2 style="margin-bottom: 0.5rem;">Believer Portal</h2>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Enter your name to access your portal.</p>
                    <form onsubmit="loginMember(event)" style="margin-bottom: 2rem;">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="believer-name" class="search-box" required placeholder="Enter your full name" style="margin-bottom: 1rem; width: 100%; box-sizing: border-box;">
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="text" id="believer-phone" class="search-box" placeholder="e.g. 9876543210" style="margin-bottom: 1rem; width: 100%; box-sizing: border-box;">
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <input type="text" id="believer-address" class="search-box" placeholder="Your residential address" style="margin-bottom: 1rem; width: 100%; box-sizing: border-box;">
                        </div>
                        <button type="submit" class="btn">Login</button>
                    </form>
                </div>
                
                <div class="auth-container" style="flex: 1; min-width: 300px; margin: 0;">
                    <h2>Admin Security Portal</h2>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Leadership access for administration.</p>
                    <form onsubmit="login(event)">
                        <div class="form-group">
                            <label>Admin Password</label>
                            <input type="password" id="security-pass" required placeholder="Enter password to access" style="width: 100%; box-sizing: border-box;">
                        </div>
                        <button type="submit" class="btn" style="background: #1e293b;">Access Dashboard</button>
                    </form>
                </div>
            </div>
        `;
    }
    else if (currentView === 'believer_portal') {
        if (!currentUser) return navigateTo('home');

        let eventsHtml = EVENTS.map(ev => {
            return '<div class="event-card">' +
                '<div class="event-date">' + ev.date + '</div>' +
                '<h3 class="event-title">' + ev.title + '</h3>' +
                '<p class="event-desc">' + ev.desc + '</p>' +
                '</div>';
        }).join('');

        appContainer.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto; animation: slideUp 0.5s ease-out;">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; margin-bottom: 3rem; flex-wrap: wrap;">
                    <!-- Profile Details -->
                    <div class="auth-container" style="margin: 0; text-align: left; background: var(--surface-solid); border-left: 5px solid var(--primary);">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                             <div style="width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">
                                ${currentUser.name.charAt(0)}
                             </div>
                             <div>
                                <h2 style="margin: 0; font-size: 1.3rem;">${currentUser.name}</h2>
                                <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-top: 0.25rem;">
                                    <a href="tel:${currentUser.phone}" style="color: var(--primary); text-decoration: none; font-weight: 600;">${currentUser.phone || 'No phone'}</a> 
                                    <a href="https://wa.me/${currentUser.phone}" target="_blank" style="margin-left: 5px; text-decoration: none;">💬</a> | ${currentUser.address || 'No address'}
                                </div>
                                <span class="badge success" style="font-size: 0.65rem; padding: 0.1rem 0.4rem; margin-top: 0.5rem; display: inline-block;">${currentUser.role || 'Believer'}</span>
                                <button onclick="copyPortalLink()" class="btn-small" style="background: #e0e7ff; color: #4338ca; margin-top: 0.5rem; display: block; width: auto; font-size: 0.65rem; padding: 0.2rem 0.5rem;">🔗 Share Link</button>
                             </div>
                        </div>
                        
                        <div id="profile-display">
                            <button onclick="document.getElementById('profile-edit').style.display='block'; document.getElementById('profile-display').style.display='none';" class="btn" style="background: #64748b; padding: 0.5rem; font-size: 0.85rem; margin-bottom: 0.5rem; width: auto;">Edit Profile</button>
                        </div>

                        <div id="profile-edit" style="display: none; border-top: 1px solid var(--border); padding-top: 1rem;">
                            <form onsubmit="updateProfile(event)">
                                <div class="form-group" style="margin-bottom: 0.5rem;">
                                    <label style="font-size: 0.8rem;">Phone</label>
                                    <input type="text" id="edit-phone" value="${currentUser.phone || ''}" style="padding: 0.5rem; font-size: 0.9rem;">
                                </div>
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.8rem;">Address</label>
                                    <input type="text" id="edit-address" value="${currentUser.address || ''}" style="padding: 0.5rem; font-size: 0.9rem;">
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button type="submit" class="btn" style="padding: 0.5rem; font-size: 0.85rem;">Save</button>
                                    <button type="button" onclick="render()" class="btn" style="background: #e2e8f0; color: #64748b; padding: 0.5rem; font-size: 0.85rem;">Cancel</button>
                                </div>
                            </form>
                        </div>
                        
                        <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1rem;">
                            <div style="background: #fff5f7; border: 2px dashed #f9a8d4; padding: 1.5rem; border-radius: 2rem; text-align: center; box-shadow: var(--shadow-sm); position: relative;">
                                <div style="width: 50px; height: 50px; margin: 0 auto 0.25rem;">
                                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="50" cy="50" r="48" stroke="#db2777" stroke-width="4"/>
                                        <path d="M50 35C54.4183 35 58 31.4183 58 27C58 22.5817 54.4183 19 50 19C45.5817 19 42 22.5817 42 27C42 31.4183 45.5817 35 50 35Z" fill="#db2777"/>
                                        <path d="M48 38C40.268 38 34 44.268 34 52V65C34 67.2091 35.7909 69 38 69H45V78H55V69H62C64.2091 69 66 67.2091 66 65V52C66 44.268 59.732 38 52 38H48ZM55 52L60 57L55 62L53 60L56 57L53 54L55 52Z" fill="#db2777"/>
                                    </svg>
                                </div>
                                <div style="font-weight: 800; font-size: 0.9rem; color: #db2777; margin-bottom: 0.75rem; letter-spacing: 0.1em;">PRAY</div>
                                <h3 style="margin-top: 0; font-size: 1rem; color: #db2777; letter-spacing: 0.05em; font-weight: 800;">PRAYER REQUEST</h3>
                                <p style="font-size: 0.8rem; margin-bottom: 1.25rem; color: #be185d; opacity: 0.8; line-height: 1.4;">"We would love to pray for you."</p>
                                <a href="prayerrequestform/index.html" class="btn" style="background: #f472b6; color: white; padding: 0.6rem 1.2rem; font-size: 0.85rem; width: auto; display: inline-block; border-radius: 1.2rem; border: none; box-shadow: 0 4px 10px rgba(244, 114, 182, 0.3);">Send Request 🕊️</a>
                            </div>
                        </div>
                    </div>

                    <!-- Welcome & Quick Info -->
                    <div style="text-align: left;">
                        <h2 style="font-size: 2.2rem; margin-bottom: 1rem; color: var(--primary);">Welcome Back!</h2>
                        <div style="background: #fff; padding: 2rem; border-radius: 1.5rem; border: 1px solid var(--border); box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
                            <h4 style="margin-top: 0; color: var(--text-main);">Daily Inspiration</h4>
                            <p style="color: var(--text-muted); font-style: italic;">"Wait for the Lord; be strong and take heart and wait for the Lord." - Psalm 27:14</p>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="admin-panel" style="padding: 1.25rem;">
                                <h4 style="margin: 0;">Spiritual Growth</h4>
                                <p style="font-size: 0.9rem; margin: 0.5rem 0;">Explore resources.</p>
                            </div>
                            <div class="admin-panel" style="padding: 1.25rem;">
                                <h4 style="margin: 0;">Watch Live</h4>
                                <p style="font-size: 0.9rem; margin: 0.5rem 0;">Every Sunday morning.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 style="margin-bottom: 1.5rem; font-size: 1.75rem; border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 0.5rem;">Upcoming Events</h3>
                <div class="events-section" style="margin-bottom: 4rem;">
                    ${eventsHtml}
                </div>
            </div>
        `;
    }
    else if (currentView === 'admin') {
        appContainer.innerHTML = `
            <div class="admin-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
                    <h2 style="margin: 0;">Admin Dashboard</h2>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="showQRCode()" class="btn-small" style="background: #1e293b; color: white;">📱 Show QR</button>
                        <button onclick="copyPortalLink()" class="btn-small" style="background: var(--primary); color: white;">🔗 Get Link</button>
                        <button onclick="logout()" class="btn-small" style="background: #ef4444; color: white;">Logout</button>
                    </div>
                </div>
                <div id="admin-content"></div>
            </div>
        `;
        renderAdminContent();

        const searchInput = document.querySelector('.search-box');
        if (searchInput) {
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }
    }
    else if (currentView === 'about') {
        appContainer.innerHTML = `
            <div class="auth-container" style="max-width: 800px; margin: 2rem auto; text-align: left;">
                <h2 style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1.5rem;">About FLAG MEDIA Church</h2>
                <p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main);">
                    Welcome to FULL LIFE AG CHURCH. We are a spirit-filled community dedicated to spreading the love of Christ and serving our community. 
                </p>
                <div style="margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="color: var(--primary);">Our Mission</h4>
                        <p>To reach the unreached and disciple the believer into a deep relationship with God.</p>
                    </div>
                    <div>
                        <h4 style="color: var(--primary);">Our Vision</h4>
                        <p>A community transformed by the power of the Holy Spirit, walking in fullness of life.</p>
                    </div>
                </div>
                
                <div style="margin-top: 3rem; text-align: center; background: #fff; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #e2e8f0; box-shadow: var(--shadow-md);">
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 2rem;">Our Pastor</h3>
                    <p style="font-weight: 700; color: #64748b; margin-bottom: 2rem; font-size: 1.25rem;">Rev. N. Johnson</p>
                    <div style="width: 100%; max-width: 700px; aspect-ratio: 16/9; background: #cbd5e1; margin: 0 auto 2rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 6px solid #f8fafc; box-shadow: var(--shadow-lg);">
                        <img src="src/Photos/pastor.jpg" alt="Rev. N. Johnson" onerror="this.src='https://via.placeholder.com/700x394?text=Our+Pastor'; this.style.opacity='0.5';" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="max-width: 600px; margin: 0 auto; text-align: left; background: #f8fafc; padding: 2rem; border-radius: 1rem; border-left: 5px solid var(--primary);">
                        <p style="font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--text-main); font-weight: 500;">
                            He is committed to building the church, helping people:
                        </p>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; color: var(--text-main);">
                                <span style="color: var(--primary); font-size: 1.5rem;">•</span> Encounter God
                            </li>
                            <li style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; color: var(--text-main);">
                                <span style="color: var(--primary); font-size: 1.5rem;">•</span> Live Worthy of Purpose
                            </li>
                            <li style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; color: var(--text-main);">
                                <span style="color: var(--primary); font-size: 1.5rem;">•</span> Become More Like Jesus
                            </li>
                            <li style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; color: var(--text-main);">
                                <span style="color: var(--primary); font-size: 1.5rem;">•</span> Be Disciples Who Make Disciples
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Contact Section -->
                <div style="margin-top: 3rem; text-align: center; background: #fff; padding: 2rem; border-radius: 1.5rem; border: 1px solid #e2e8f0; box-shadow: var(--shadow-md);">
                    <h3 style="color: var(--primary); margin-bottom: 1rem; font-size: 1.8rem;">Contact Us</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">Have questions or need guidance? Reach out to us directly.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="tel:9876543210" class="btn" style="width: auto; padding: 0.8rem 2rem; border-radius: 1.5rem; display: flex; align-items: center; gap: 0.5rem; text-decoration: none;">
                            <span>📞</span> Call Now
                        </a>
                        <a href="https://wa.me/9876543210" target="_blank" class="btn" style="width: auto; padding: 0.8rem 2rem; border-radius: 1.5rem; background: #22c55e; border: none; display: flex; align-items: center; gap: 0.5rem; text-decoration: none;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `;;
    }
    else if (currentView === 'watch') {
        appContainer.innerHTML = `
            <div class="auth-container" style="max-width: 900px; margin: 2rem auto; text-align: center;">
                <h2 style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;">Watch Live</h2>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Join our services online from anywhere in the world.</p>
                <div style="background: #000; aspect-ratio: 16/9; border-radius: 1rem; display: flex; align-items: center; justify-content: center; color: white;">
                    <a href="https://youtube.com/@fulllifeagchurch?si=nrIxhsDwDnJcVpjC" target="_blank" class="btn" style="width: auto;">Watch on YouTube Live</a>
                </div>
            </div>
        `;
    }
    else if (currentView === 'events_page') {
        let eventsHtml = EVENTS.map(ev => {
            return '<div class="event-card">' +
                '<div class="event-date">' + ev.date + '</div>' +
                '<h3 class="event-title">' + ev.title + '</h3>' +
                '<p class="event-desc">' + ev.desc + '</p>' +
                '</div>';
        }).join('');
        appContainer.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto;">
                <h2 class="text-center" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 2rem;">Upcoming Events</h2>
                <div class="events-section">
                    ${eventsHtml}
                </div>
            </div>
        `;
    }
    else if (currentView === 'next_steps') {
        appContainer.innerHTML = `
            <div class="auth-container" style="max-width: 800px; margin: 2rem auto; text-align: left;">
                <h2 style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1.5rem;">Next Steps</h2>
                <p style="margin-bottom: 2rem;">We're so glad you're here. Here's how you can get more involved:</p>
                <div class="admin-grid" style="grid-template-columns: 1fr 1fr;">
                    <div class="admin-panel">
                        <h4>Join a Connect Group</h4>
                        <p>Small groups that meet weekly for fellowship and prayer.</p>
                    </div>
                    <div class="admin-panel">
                        <h4>Volunteer</h4>
                        <p>Serve in our various ministries and make a difference.</p>
                    </div>
                </div>
            </div>
        `;
    }
    else if (currentView === 'kids_church') {
        appContainer.innerHTML = `
            <div class="auth-container" style="max-width: 800px; margin: 2rem auto; text-align: center;">
                <h2 style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 1rem;">Kid's Church</h2>
                <p>A fun and safe place for your children to learn about God's love.</p>
                <div style="margin-top: 2rem; background: #fffbeb; padding: 2rem; border-radius: 1rem; border: 2px dashed #f59e0b;">
                    <h3>Sundays at 9:30 AM</h3>
                    <p>Ages 3-12</p>
                </div>
            </div>
        `;
    }
    else if (currentView === 'give') {
        appContainer.innerHTML = `
            <div class="auth-container" style="max-width: 600px; margin: 2rem auto; text-align: center;">
                <h2 style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1.5rem;">Generosity</h2>
                <p style="margin-bottom: 2rem;">Your giving helps us continue our mission and reach more people.</p>
                <div class="admin-panel" style="background: #f0fdf4; border-color: #bbf7d0;">
                    <h3 style="color: #166534;">Online Giving</h3>
                    <p>Securely give via bank transfer or mobile pay.</p>
                    <button class="btn" style="background: #166534; margin-top: 1rem;">Setup Recurring Gift</button>
                </div>
            </div>
        `;
    }
}

// Initial render
render();

// Show register modal
document.getElementById('openRegisterBtn').onclick = function() {
  document.getElementById('registerModal').style.display = 'flex';
};
// Hide register modal
document.getElementById('closeRegisterModal').onclick = function() {
  document.getElementById('registerModal').style.display = 'none';
};
// Hide modal when clicking outside the form
document.getElementById('registerModal').onclick = function(e) {
  if (e.target === this) this.style.display = 'none';
};
// Handle registration form submit
document.getElementById('registerForm').onsubmit = function(e) {
  e.preventDefault();
  var formData = new FormData(this);
  fetch('data.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.text())
  .then(msg => {
    document.getElementById('registerMsg').textContent = msg;
    if (msg.toLowerCase().includes('success')) {
      setTimeout(() => {
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('registerMsg').textContent = '';
        document.getElementById('registerForm').reset();
      }, 1500);
    }
  })
  .catch(() => {
    document.getElementById('registerMsg').textContent = 'Registration failed. Try again.';
  });
};

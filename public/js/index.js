const form = document.querySelector('form');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = form.querySelector('input[type="submit"]');
const popup = document.getElementById('popup');

function showPopup(message, type = 'success') {
  popup.textContent = message;
  popup.className = `popup show ${type}`;
  setTimeout(() => {
    popup.classList.remove('show');
  }, 3000);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  event.stopPropagation();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => {
      if (res.ok) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        showPopup('Login successful!', 'success');
      } else {
        return res.json().then((data) => {
          showPopup(data.error || 'Login failed', 'error');
        });
      }
    })
    .catch((err) => {
      showPopup('Login failed', 'error');
    });
});

logoutBtn.addEventListener('click', () => {
  fetch('/logout', {
    method: 'POST',
  })
    .then((res) => {
      if (res.ok) {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        showPopup('Logout successful!', 'success');
      } else {
        showPopup('Logout failed', 'error');
      }
    })
    .catch((err) => {
      showPopup('Logout failed', 'error');
    });
});

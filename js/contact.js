// Contact form submission handler
const form = document.getElementById('contactForm');
const msg = document.getElementById('contactSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      form.style.display = 'none';
      msg.style.display = 'block';
    } else {
      alert('Something went wrong — please try again.');
    }
  } catch {
    alert('Something went wrong — please try again.');
  }
});
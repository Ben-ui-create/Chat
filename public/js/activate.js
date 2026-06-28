const inputs = document.querySelectorAll('.digit');
const hidden = document.getElementById('activationToken');
const activateForm = document.getElementById('activateForm');

function updateHidden() {
  hidden.value = [...inputs].map(i => i.value).join('');
}

inputs.forEach((input, index) => {

  input.addEventListener('input', e => {

    e.target.value = e.target.value.replace(/\D/g, '');

    updateHidden();

    if (e.target.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', e => {

    if (e.key === 'Backspace' && !input.value && index > 0) {
      inputs[index - 1].focus();
    }

  });

});

console.log(hidden);

activateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('/users/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({activationToken: hidden.value}),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
    } else {
      alert('Activated successfully!');
      location.href = '/users/login'
    }
  } catch (e) {
    console.error(e);
  }
})
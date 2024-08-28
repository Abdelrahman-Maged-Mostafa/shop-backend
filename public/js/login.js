/*eslint-disable */
// import 'https://js.stripe.com/v3';

const login = async (email, password) => {
  try {
    const res = await fetch(`/api/v1/users/login`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.status === 'fail') throw new Error('Wrong user or password!');
    if (data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};
const logForm = document.querySelector('.form--login');
if (logForm) {
  logForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // console.log(email, password);
    login(email, password);
  });
}

const logout = async () => {
  try {
    const res = await fetch(`/api/v1/users/logout`);
    const data = await res.json();
    if (data.status === 'success') {
      location.reload(true);
      showAlert('success', 'You are loged out');
    }
  } catch (err) {
    showAlert('error', 'Error loging out! Try again.');
  }
};

const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) logoutBtn.addEventListener(`click`, logout);
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// update data
const updateFormUser = async (form, name, email, photo) => {
  try {
    const res = await fetch(`/api/v1/users/updateMe`, {
      method: 'PATCH',
      // headers: { 'Content-type': 'application/json' },
      // body: JSON.stringify({ newName: name, newEmail: email }),
      // body: photo,
      body: form,
    });
    const data = await res.json();
    // console.log(data);
    // console.log(data, res);
    if (data.status === 'fail' || data.status === 'error')
      throw new Error(data.message || 'No updated please try again!');
    if (data.status === 'success') {
      showAlert('success', 'Updated successfully!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1000);
    }
  } catch (err) {
    // console.log(err);
    showAlert('error', err.message);
  }
};

const updateForm = document.querySelector('.form-user-data');
if (updateForm) {
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files;
    form.append('newName', name);
    form.append('newEmail', email);
    if (photo) form.append('photo', photo[0]);
    // console.log(email);,name, email, photo[0]
    updateFormUser(form);
  });
}
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// update Password
const updatePasswordUser = async (curPassword, password, confirmPassword) => {
  try {
    const res = await fetch(`/api/v1/users/updateMyPassword`, {
      method: 'PATCH',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        oldPassword: curPassword,
        newPassword: password,
        passwordConfirm: confirmPassword,
      }),
    });
    const data = await res.json();
    // console.log(data, res);
    console.log(data);
    if (data.status === 'fail' || data.status === 'error')
      throw new Error(data.message || 'Password Not updated please try again!');
    if (data.status === 'success') {
      showAlert('success', 'Password updated successfully!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1000);
    }
  } catch (err) {
    // console.log(err);
    showAlert('error', err.message);
  }
};

const updateFormPassword = document.querySelector('.form-user-settings');
if (updateFormPassword) {
  updateFormPassword.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.querySelector('.btn--save--password');
    btn.textContent = 'Loading...';
    btn.setAttribute('disabled', '');
    const curPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    // console.log(email);
    await updatePasswordUser(curPassword, password, confirmPassword);
    btn.textContent = 'Save password';
    btn.removeAttribute('disabled');
  });
}
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// Make stipe
// not work in front end becouse need some police use parcel or react or anglur or vue to active the link library stripe in front end and use the Stripe function
if (0 > 1 && Stripe) {
  const stripe = Stripe(
    'pk_test_51PpOiBE9yh4s31HRd4feqlu1zPKUoHrSZ6cKH0l1WNAMVlXukd4wqajMLT8Iojq36GuTIi27qFMXjU42RzCw41WK007TXb9u9j',
  );

  initialize();

  // Create a Checkout Session
  async function initialize() {
    try {
      const bookTour = async (curTourId) => {
        const sission = await fetch(
          `/api/v1/bookings/checkout-session/${curTourId}`,
          // {
          //   method: 'GET',
          // },
        );
        const { clientSecret } = await sission.json();
        return clientSecret;
      };

      const checkout = await stripe.initEmbeddedCheckout({
        sission,
      });

      // Mount Checkout
      checkout.mount('#checkout');
    } catch (err) {
      console.log(err);
      showAlert('error', err);
    }
  }
  ////use your Element to run
  const tourEl = document.getElementById('book-tour');
  if (tourEl)
    tourEl.addEventListener('click', function () {
      tourEl.textContent = 'Processing...';
      const { tourId } = tourEl.dataset;
      console.log(tourId);
    });
}

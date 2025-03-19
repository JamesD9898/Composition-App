// Auth page state management
const state = {
  currentView: 'signin', // 'signin', 'signup', 'verify-email', 'forgot-password', 'verify-reset', 'new-password'
  email: '',
  password: '',
  verificationCode: '',
  flowOrigin: '' // Tracks which flow initiated verification ('signup' or 'reset')
};

// DOM elements
document.addEventListener('DOMContentLoaded', () => {
  // Check URL params for signup directive
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'signup') {
    state.currentView = 'signup';
  }
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Update UI based on initial state
  updateUI();
  
  // Update tab UI based on state
  updateTabUI();
});

function initializeEventListeners() {
  // Tab buttons for toggling between sign in and sign up
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.getAttribute('data-tab');
      if (tabName === 'signin' || tabName === 'signup') {
        state.currentView = tabName;
        updateUI();
        updateTabUI();
      }
    });
  });

  // Form submission
  document.querySelector('.signin-form').addEventListener('submit', handleFormSubmit);
  document.querySelector('.signup-form').addEventListener('submit', handleFormSubmit);
  document.querySelector('.verify-email-form').addEventListener('submit', handleFormSubmit);
  document.querySelector('.forgot-password-form').addEventListener('submit', handleFormSubmit);
  document.querySelector('.verify-reset-form').addEventListener('submit', handleFormSubmit);
  document.querySelector('.new-password-form').addEventListener('submit', handleFormSubmit);

  // Google sign in button
  const googleBtn = document.querySelector('.google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleSignIn);
  }
  
  // Global click handler for dynamic elements
  document.addEventListener('click', (e) => {
    // Forgot password link
    if (e.target.classList.contains('forgot-password')) {
      e.preventDefault();
      state.currentView = 'forgot-password';
      updateUI();
    }
    
    // Back to sign in button
    if (e.target.classList.contains('back-to-signin')) {
      e.preventDefault();
      state.currentView = 'signin';
      updateUI();
      updateTabUI();
    }
    
    // Resend code button
    if (e.target.classList.contains('resend-code')) {
      mockSendVerificationCode(state.email);
      
      // Show message
      const currentView = state.currentView === 'verify-email' ? 
        document.querySelector('.verify-email-view .verification-hint') : 
        document.querySelector('.verify-reset-view .verification-hint');
      
      if (currentView) {
        currentView.innerHTML = '<p class="success">A new code has been sent!</p>';
        
        // Reset after 3 seconds
        setTimeout(() => {
          currentView.innerHTML = '<p>Check your email for a verification code</p>';
        }, 3000);
      }
    }
  });
}

function updateTabUI() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  // Only show tabs for signin/signup views
  const tabsContainer = document.querySelector('.auth-tabs');
  if (['signin', 'signup'].includes(state.currentView)) {
    tabsContainer.style.display = 'flex';
  } else {
    tabsContainer.style.display = 'none';
  }
  
  // Update active tab
  tabButtons.forEach(button => {
    const tabName = button.getAttribute('data-tab');
    if (tabName === state.currentView) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

function updateUI() {
  const authHeader = document.querySelector('.auth-header');
  
  // Hide all views
  document.querySelectorAll('.view-container').forEach(container => {
    container.classList.remove('active');
  });
  
  // Show current view
  let viewToShow;
  
  // Update header and show appropriate view
  switch (state.currentView) {
    case 'signin':
      authHeader.innerHTML = `
        <h1>Welcome Back</h1>
        <p>Sign in to continue to ToneDraft</p>
      `;
      viewToShow = document.querySelector('.signin-view');
      break;
      
    case 'signup':
      authHeader.innerHTML = `
        <h1>Create Account</h1>
        <p>Join ToneDraft and start composing</p>
      `;
      viewToShow = document.querySelector('.signup-view');
      break;
      
    case 'verify-email':
      authHeader.innerHTML = `
        <h1>Verify Your Email</h1>
        <p>We've sent a code to ${state.email}</p>
      `;
      viewToShow = document.querySelector('.verify-email-view');
      break;
      
    case 'forgot-password':
      authHeader.innerHTML = `
        <h1>Reset Password</h1>
        <p>Enter your email to receive a verification code</p>
      `;
      viewToShow = document.querySelector('.forgot-password-view');
      break;
      
    case 'verify-reset':
      authHeader.innerHTML = `
        <h1>Verify Code</h1>
        <p>Enter the code sent to ${state.email}</p>
      `;
      viewToShow = document.querySelector('.verify-reset-view');
      break;
      
    case 'new-password':
      authHeader.innerHTML = `
        <h1>Create New Password</h1>
        <p>Enter a new password for your account</p>
      `;
      viewToShow = document.querySelector('.new-password-view');
      break;
  }
  
  if (viewToShow) {
    viewToShow.classList.add('active');
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  switch (state.currentView) {
    case 'signin':
      const signinEmail = document.getElementById('signin-email').value;
      const signinPassword = document.getElementById('signin-password').value;
      
      if (validateEmail(signinEmail) && signinPassword.length > 0) {
        state.email = signinEmail;
        state.password = signinPassword;
        mockSignIn(signinEmail, signinPassword);
      }
      break;
      
    case 'signup':
      const name = document.getElementById('signup-name').value;
      const signupEmail = document.getElementById('signup-email').value;
      const signupPassword = document.getElementById('signup-password').value;
      
      if (name.length > 0 && validateEmail(signupEmail) && signupPassword.length >= 8) {
        state.email = signupEmail;
        state.password = signupPassword;
        state.flowOrigin = 'signup';
        mockSignUp(name, signupEmail, signupPassword);
      }
      break;
      
    case 'verify-email':
      const signupVerificationCode = document.getElementById('verification-code').value;
      
      if (signupVerificationCode.length > 0) {
        state.verificationCode = signupVerificationCode;
        mockVerifySignUp(state.email, signupVerificationCode);
      }
      break;
      
    case 'forgot-password':
      const resetEmail = document.getElementById('reset-email').value;
      
      if (validateEmail(resetEmail)) {
        state.email = resetEmail;
        state.flowOrigin = 'reset';
        mockSendPasswordResetCode(resetEmail);
      }
      break;
      
    case 'verify-reset':
      const resetVerificationCode = document.getElementById('reset-verification-code').value;
      
      if (resetVerificationCode.length > 0) {
        state.verificationCode = resetVerificationCode;
        mockVerifyResetCode(state.email, resetVerificationCode);
      }
      break;
      
    case 'new-password':
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (newPassword.length >= 8 && newPassword === confirmPassword) {
        mockResetPassword(state.email, state.verificationCode, newPassword);
      } else if (newPassword !== confirmPassword) {
        showError("Passwords don't match");
      }
      break;
  }
}

// Validation utilities
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = re.test(email);
  
  if (!isValid) {
    showError("Please enter a valid email address");
  }
  
  return isValid;
}

function showError(message) {
  // Show error message
  const errorElement = document.querySelector('.auth-error');
  
  // Set error message
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide error after 3 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 3000);
}

// Replace mock functions with real API calls
function mockSignIn(email, password) {
  console.log(`Sign in attempt: ${email}`);
  
  fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // Important for cookies!
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Store user's name for UI purposes (not auth)
      sessionStorage.setItem('userName', data.user.name);
      window.location.href = '../dashboard/dash.html';
    } else {
      showError(data.message || "Login failed");
    }
  })
  .catch(error => {
    showError("Invalid email or password");
    console.error(error);
  });
}

function mockSignUp(name, email, password) {
  console.log(`Sign up attempt: ${name}, ${email}`);
  
  // Simulate API call delay
  setTimeout(() => {
    // Always go to verification in this mock
    state.currentView = 'verify-email';
    updateUI();
    updateTabUI();
  }, 1000);
}

function mockVerifySignUp(email, code) {
  console.log(`Verify sign up: ${email}, code: ${code}`);
  
  // Simulate API call delay
  setTimeout(() => {
    // In a real app, we would verify the code on the server
    if (code === '123456') {
      // Success path - redirect to dashboard
      window.location.href = '../dashboard/dash.html';
    } else {
      showError("Invalid verification code");
    }
  }, 1000);
}

function mockSendPasswordResetCode(email) {
  console.log(`Password reset requested for: ${email}`);
  
  // Simulate API call delay
  setTimeout(() => {
    state.currentView = 'verify-reset';
    updateUI();
    updateTabUI();
  }, 1000);
}

function mockVerifyResetCode(email, code) {
  console.log(`Verify reset code: ${email}, code: ${code}`);
  
  // Simulate API call delay
  setTimeout(() => {
    if (code === '123456') {
      state.currentView = 'new-password';
      updateUI();
      updateTabUI();
    } else {
      showError("Invalid verification code");
    }
  }, 1000);
}

function mockResetPassword(email, code, newPassword) {
  console.log(`Reset password for: ${email}`);
  
  // Simulate API call delay
  setTimeout(() => {
    // In a real app, we would verify this on the server
    if (code === '123456') {
      // Show success message
      const authHeader = document.querySelector('.auth-header');
      
      authHeader.innerHTML = `
        <h1>Password Reset Successfully</h1>
        <p>Your password has been updated</p>
      `;
      
      // Hide all forms and show a special success view
      document.querySelectorAll('.view-container').forEach(container => {
        container.classList.remove('active');
      });
      
      // Create a simple success view
      const successView = document.createElement('div');
      successView.classList.add('view-container', 'active');
      successView.innerHTML = `
        <button type="button" class="auth-submit back-to-signin">Back to Sign In</button>
      `;
      
      // Replace the current form with our success view
      const formsContainer = document.querySelector('.auth-methods');
      formsContainer.appendChild(successView);
      
      // Add event listener
      const backButton = successView.querySelector('.back-to-signin');
      if (backButton) {
        backButton.addEventListener('click', () => {
          state.currentView = 'signin';
          updateUI();
          updateTabUI();
          // Remove our temporary success view
          successView.remove();
        });
      }
    } else {
      showError("Something went wrong");
    }
  }, 1000);
}

function mockSendVerificationCode(email) {
  console.log(`Sending verification code to: ${email}`);
  
  // In a real application, this would trigger an API call
  // to send a new verification code
}

function handleGoogleSignIn() {
  console.log('Google sign in clicked');
  
  // In a real app, this would initiate OAuth flow
  // For this demo, we'll just redirect to dashboard after a delay
  setTimeout(() => {
    window.location.href = '../dashboard/dash.html';
  }, 1000);
}

// Add logout function
function logout() {
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })
  .then(() => {
    window.location.href = '../auth/login.html';
  })
  .catch(error => {
    console.error('Logout failed:', error);
  });
}

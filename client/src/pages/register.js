import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { Loader, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// Validation utilities
const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    errorMessages: {
      required: 'Name is required',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name must not exceed 50 characters',
      pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessages: {
      required: 'Email is required',
      pattern: 'Please enter a valid email address',
      exists: 'Email already registered'
    }
  },
  password: {
    minLength: 8,
    maxLength: 128,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumbers: /[0-9]/,
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    errorMessages: {
      required: 'Password is required',
      minLength: 'Password must be at least 8 characters',
      maxLength: 'Password must not exceed 128 characters',
      hasUppercase: 'Must contain at least one uppercase letter (A-Z)',
      hasLowercase: 'Must contain at least one lowercase letter (a-z)',
      hasNumbers: 'Must contain at least one number (0-9)',
      hasSpecial: 'Must contain at least one special character (!@#$%^&*...)',
      weak: 'Password is too weak',
      strong: 'Password is strong'
    }
  }
};

const validateName = (name) => {
  const errors = [];
  if (!name) {
    errors.push(VALIDATION_RULES.name.errorMessages.required);
  } else {
    if (name.length < VALIDATION_RULES.name.minLength) {
      errors.push(VALIDATION_RULES.name.errorMessages.minLength);
    }
    if (name.length > VALIDATION_RULES.name.maxLength) {
      errors.push(VALIDATION_RULES.name.errorMessages.maxLength);
    }
    if (!VALIDATION_RULES.name.pattern.test(name)) {
      errors.push(VALIDATION_RULES.name.errorMessages.pattern);
    }
  }
  return errors;
};

const validateEmail = (email) => {
  const errors = [];
  if (!email) {
    errors.push(VALIDATION_RULES.email.errorMessages.required);
  } else if (!VALIDATION_RULES.email.pattern.test(email)) {
    errors.push(VALIDATION_RULES.email.errorMessages.pattern);
  }
  return errors;
};

const validatePassword = (password) => {
  const errors = [];
  const strength = { score: 0, level: 'weak' };

  if (!password) {
    errors.push(VALIDATION_RULES.password.errorMessages.required);
    return { errors, strength };
  }

  if (password.length < VALIDATION_RULES.password.minLength) {
    errors.push(VALIDATION_RULES.password.errorMessages.minLength);
  } else if (password.length > VALIDATION_RULES.password.maxLength) {
    errors.push(VALIDATION_RULES.password.errorMessages.maxLength);
  }

  if (!VALIDATION_RULES.password.hasUppercase.test(password)) {
    errors.push(VALIDATION_RULES.password.errorMessages.hasUppercase);
  } else {
    strength.score += 25;
  }

  if (!VALIDATION_RULES.password.hasLowercase.test(password)) {
    errors.push(VALIDATION_RULES.password.errorMessages.hasLowercase);
  } else {
    strength.score += 25;
  }

  if (!VALIDATION_RULES.password.hasNumbers.test(password)) {
    errors.push(VALIDATION_RULES.password.errorMessages.hasNumbers);
  } else {
    strength.score += 25;
  }

  if (!VALIDATION_RULES.password.hasSpecial.test(password)) {
    errors.push(VALIDATION_RULES.password.errorMessages.hasSpecial);
  } else {
    strength.score += 25;
  }

  // Length bonus
  if (password.length >= 12) strength.score = Math.min(100, strength.score + 10);

  if (strength.score >= 75) {
    strength.level = 'strong';
    strength.color = 'green';
  } else if (strength.score >= 50) {
    strength.level = 'medium';
    strength.color = 'yellow';
  } else {
    strength.level = 'weak';
    strength.color = 'red';
  }

  return { errors, strength };
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: [],
    email: [],
    password: [],
    confirmPassword: [],
  });

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: 'weak', color: 'red' });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    if (name === 'name') {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    } else if (name === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === 'password') {
      const { errors: passErrors, strength } = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: passErrors }));
      setPasswordStrength(strength);
    } else if (name === 'confirmPassword') {
      const confirmErrors = [];
      if (value && value !== formData.password) {
        confirmErrors.push('Passwords do not match');
      }
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErrors }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      errors.name.length === 0 &&
      errors.email.length === 0 &&
      errors.password.length === 0 &&
      errors.confirmPassword.length === 0 &&
      passwordStrength.level !== 'weak'
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const nameErrors = validateName(formData.name);
    const emailErrors = validateEmail(formData.email);
    const { errors: passwordErrors } = validatePassword(formData.password);
    const confirmErrors = formData.password !== formData.confirmPassword ? ['Passwords do not match'] : [];

    setErrors({
      name: nameErrors,
      email: emailErrors,
      password: passwordErrors,
      confirmPassword: confirmErrors,
    });

    if (nameErrors.length > 0 || emailErrors.length > 0 || passwordErrors.length > 0 || confirmErrors.length > 0) {
      toast.error('Please fix all validation errors');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
      
      // Handle email exists error
      if (errorMsg.includes('email')) {
        setErrors((prev) => ({
          ...prev,
          email: [...prev.email, VALIDATION_RULES.email.errorMessages.exists]
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderValidationMessage = (fieldName) => {
    if (!touched[fieldName] || errors[fieldName].length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {errors[fieldName].map((error, idx) => (
          <div key={idx} className="flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  };

  const getFieldStatus = (fieldName) => {
    if (!touched[fieldName]) return null;
    if (errors[fieldName].length === 0) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slideInDown">
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/30 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Lumina
            </h1>
            <p className="text-slate-300 mt-2 text-sm">Create your account securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center justify-between">
                <span>Full Name</span>
                {getFieldStatus('name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  touched.name && errors.name.length > 0
                    ? 'border-red-500 focus:ring-red-500'
                    : touched.name && errors.name.length === 0
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-slate-700/50 focus:ring-indigo-500 focus:border-transparent'
                }`}
                placeholder="John Doe"
                autoComplete="name"
              />
              {renderValidationMessage('name')}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center justify-between">
                <span>Email Address</span>
                {getFieldStatus('email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  touched.email && errors.email.length > 0
                    ? 'border-red-500 focus:ring-red-500'
                    : touched.email && errors.email.length === 0
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-slate-700/50 focus:ring-indigo-500 focus:border-transparent'
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {renderValidationMessage('email')}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center justify-between">
                <span>Password</span>
                {getFieldStatus('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 pr-10 ${
                    touched.password && errors.password.length > 0
                      ? 'border-red-500 focus:ring-red-500'
                      : touched.password && errors.password.length === 0
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-slate-700/50 focus:ring-indigo-500 focus:border-transparent'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          bar <= (passwordStrength.score / 25)
                            ? `bg-${passwordStrength.color}-500`
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    passwordStrength.level === 'strong' ? 'text-green-400' :
                    passwordStrength.level === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    Strength: {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                  </p>
                </div>
              )}

              {renderValidationMessage('password')}

              {/* Password Requirements Checklist */}
              {formData.password && errors.password.length > 0 && (
                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-300 font-semibold mb-2">Password Requirements:</p>
                  <ul className="space-y-1 text-xs">
                    <li className={`flex items-center gap-2 ${VALIDATION_RULES.password.hasUppercase.test(formData.password) ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{VALIDATION_RULES.password.hasUppercase.test(formData.password) ? '✓' : '✗'}</span>
                      Uppercase letter (A-Z)
                    </li>
                    <li className={`flex items-center gap-2 ${VALIDATION_RULES.password.hasLowercase.test(formData.password) ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{VALIDATION_RULES.password.hasLowercase.test(formData.password) ? '✓' : '✗'}</span>
                      Lowercase letter (a-z)
                    </li>
                    <li className={`flex items-center gap-2 ${VALIDATION_RULES.password.hasNumbers.test(formData.password) ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{VALIDATION_RULES.password.hasNumbers.test(formData.password) ? '✓' : '✗'}</span>
                      Number (0-9)
                    </li>
                    <li className={`flex items-center gap-2 ${VALIDATION_RULES.password.hasSpecial.test(formData.password) ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{VALIDATION_RULES.password.hasSpecial.test(formData.password) ? '✓' : '✗'}</span>
                      Special character (!@#$%^&*)
                    </li>
                    <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{formData.password.length >= 8 ? '✓' : '✗'}</span>
                      At least 8 characters
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center justify-between">
                <span>Confirm Password</span>
                {getFieldStatus('confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 pr-10 ${
                    touched.confirmPassword && errors.confirmPassword.length > 0
                      ? 'border-red-500 focus:ring-red-500'
                      : touched.confirmPassword && errors.confirmPassword.length === 0 && formData.confirmPassword
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-slate-700/50 focus:ring-indigo-500 focus:border-transparent'
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {renderValidationMessage('confirmPassword')}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full mt-8 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-slate-400 mt-8 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-300 hover:text-indigo-200 font-semibold transition-colors">
              Login here
            </Link>
          </p>

          {/* Privacy Note */}
          <p className="text-center text-slate-500 mt-6 text-xs">
            By registering, you agree to our{' '}
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and{' '}
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}


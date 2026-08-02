import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useFeedbackStore } from '../../store/useFeedbackStore';
import { SuccessState } from './SuccessState';

export const LoginModal = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    sendOtp,
    verifyOtp,
    resendOtp,
    updateProfile,
    checkoutResumeRedirect,
    setCheckoutResumeRedirect,
  } = useAuthStore();

  // Screen Layout Steps: 'mobile' | 'otp' | 'profile' | 'success'
  const [step, setStep] = useState('mobile');

  // Input States
  const [mobile, setMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OTP Countdown Timer States
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Optional Profile States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileGender, setProfileGender] = useState('');
  const [profileDob, setProfileDob] = useState('');

  // Refs for OTP input grid auto-focusing
  const otpRefs = useRef([]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen]);

  // Reset or initialize state when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('mobile');
      setMobile('');
      setOtpDigits(Array(6).fill(''));
      setErrorMessage('');
      setIsSubmitting(false);
      setTimer(30);
      setIsTimerActive(false);
      setProfileName('');
      setProfileEmail('');
      setProfileGender('');
      setProfileDob('');
    }
  }, [isAuthModalOpen]);

  // 30-Second Countdown Timer Effect for OTP
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  if (!isAuthModalOpen) return null;

  const handleCloseModal = () => {
    setAuthModalOpen(false);
    setErrorMessage('');
    setIsSubmitting(false);
  };

  // Helper: Mask mobile for display e.g. "98****3210"
  const getMaskedMobile = (num) => {
    const cleaned = String(num).replace(/\D/g, '');
    if (cleaned.length < 10) return num;
    return `${cleaned.slice(0, 2)}****${cleaned.slice(-4)}`;
  };

  // 1. STEP 1: SEND OTP ACTION
  const handleSendOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanedMobile = mobile.replace(/\D/g, '');

    if (!cleanedMobile || cleanedMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      setErrorMessage('Mobile number must begin with 6, 7, 8, or 9.');
      return;
    }

    setIsSubmitting(true);
    useFeedbackStore.getState().showLoader('Sending OTP to your mobile...');

    try {
      const response = await sendOtp(cleanedMobile);
      useFeedbackStore.getState().hideLoader();
      setIsSubmitting(false);

      if (response && (response.return === true || response.status_code === 200 || response.success)) {
        useFeedbackStore.getState().showToast('✅ OTP sent successfully!', 'success');
        setStep('otp');
        setTimer(30);
        setIsTimerActive(true);
        // Focus first OTP input after DOM render
        setTimeout(() => {
          if (otpRefs.current[0]) otpRefs.current[0].focus();
        }, 150);
      } else {
        setErrorMessage(response?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      setIsSubmitting(false);
      console.error('[Send OTP Error]:', err);
      setErrorMessage(err.message || 'Network error while sending OTP. Please check your connection.');
    }
  };

  // 2. STEP 2: OTP GRID INPUT HANDLERS
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    // Auto move to next input if digit entered
    if (digit && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }

    // Auto verify if all 6 digits filled
    const fullOtp = newOtp.join('');
    if (fullOtp.length === 6 && !newOtp.includes('')) {
      handleVerifyOtpSubmit(null, fullOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtpDigits(newOtp);
      if (otpRefs.current[5]) otpRefs.current[5].focus();
      handleVerifyOtpSubmit(null, pastedData);
    }
  };

  // 3. STEP 2: VERIFY OTP ACTION
  const handleVerifyOtpSubmit = async (e, directOtp = null) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const finalOtp = directOtp || otpDigits.join('');

    if (!finalOtp || finalOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    const cleanedMobile = mobile.replace(/\D/g, '');
    setIsSubmitting(true);
    useFeedbackStore.getState().showLoader('Verifying OTP code...');

    try {
      const response = await verifyOtp(cleanedMobile, finalOtp);
      useFeedbackStore.getState().hideLoader();
      setIsSubmitting(false);

      if (response && (response.return === true || response.status_code === 200 || response.success) && response.user) {
        const loggedInUser = response.user;
        
        // Show success animation
        setStep('success');

        setTimeout(() => {
          // Check if profile completion is needed
          if (!loggedInUser.name || loggedInUser.name.startsWith('Customer ')) {
            setStep('profile');
          } else {
            handleFinalAuthSuccess(loggedInUser);
          }
        }, 1200);

      } else {
        setErrorMessage(response?.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      setIsSubmitting(false);
      console.error('[Verify OTP Error]:', err);
      setErrorMessage(err.message || 'OTP verification failed. Please check the code.');
    }
  };

  // 4. STEP 2: RESEND OTP ACTION
  const handleResendOtp = async () => {
    if (timer > 0 || isSubmitting) return;

    setErrorMessage('');
    const cleanedMobile = mobile.replace(/\D/g, '');
    setIsSubmitting(true);
    useFeedbackStore.getState().showLoader('Resending fresh OTP...');

    try {
      const response = await resendOtp(cleanedMobile);
      useFeedbackStore.getState().hideLoader();
      setIsSubmitting(false);

      if (response && (response.return === true || response.status_code === 200 || response.success)) {
        useFeedbackStore.getState().showToast('✅ Fresh OTP sent successfully!', 'success');
        setOtpDigits(Array(6).fill(''));
        setTimer(30);
        setIsTimerActive(true);
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      } else {
        setErrorMessage(response?.message || 'Failed to resend OTP. Maximum limits may apply.');
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Resend limit reached or network error. Please try later.');
    }
  };

  // 5. STEP 3: SAVE PROFILE ACTION
  const handleSaveProfileSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!profileName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    useFeedbackStore.getState().showLoader('Updating your profile...');

    try {
      await updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim() || undefined,
        gender: profileGender || undefined,
        dob: profileDob || undefined
      });

      useFeedbackStore.getState().hideLoader();
      setIsSubmitting(false);
      useFeedbackStore.getState().showToast('🌿 Profile completed successfully!', 'success');
      handleFinalAuthSuccess();
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to update profile.');
    }
  };

  // Finish Authentication Flow
  const handleFinalAuthSuccess = (userObj) => {
    handleCloseModal();
    if (checkoutResumeRedirect) {
      navigate(checkoutResumeRedirect);
      setCheckoutResumeRedirect(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Soft Organic Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseModal}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-md transition-opacity"
        />

        {/* Auth Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#FDFBF7] border border-[#EDE7D9] rounded-3xl shadow-2xl overflow-hidden z-10 text-left font-sans my-8"
        >
          {/* Subtle Decorative Leaf & Background Banner */}
          <div className="bg-gradient-to-br from-[#F5EFE6] via-[#FDFBF7] to-[#EBE4D5] p-6 sm:p-8 pb-4 relative overflow-hidden border-b border-[#EDE7D9]/80">
            {/* Nature Leaf Watermark */}
            <div className="absolute -right-6 -top-6 text-[#4E641A]/10 text-9xl pointer-events-none select-none">
              🌿
            </div>

            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-full transition border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>

            {/* Brand Header */}
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-9 h-9 bg-[#4E641A] text-white rounded-xl flex items-center justify-center text-lg shadow-xs">
                🌱
              </span>
              <span className="font-serif text-sm font-extrabold tracking-wide text-[#2F3B0C] uppercase">
                Suryodaya Farms
              </span>
            </div>

            {step === 'mobile' && (
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  Welcome to Suryodaya Farms 🌿
                </h3>
                <p className="text-xs text-stone-600 mt-1 font-medium">
                  Enter your mobile number to continue.
                </p>
              </div>
            )}

            {step === 'otp' && (
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  Verify Mobile Number
                </h3>
                <p className="text-xs text-stone-600 mt-1 font-medium flex items-center gap-1.5 flex-wrap">
                  <span>Enter the 6-digit OTP sent to</span>
                  <span className="font-bold text-stone-900">+91 {getMaskedMobile(mobile)}</span>
                  <button
                    type="button"
                    onClick={() => { setStep('mobile'); setErrorMessage(''); }}
                    className="text-[11px] text-[#4E641A] font-extrabold underline hover:text-[#2F3B0C] border-none bg-transparent cursor-pointer ml-1"
                  >
                    Change
                  </button>
                </p>
              </div>
            )}

            {step === 'profile' && (
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  Complete Your Profile 🌿
                </h3>
                <p className="text-xs text-stone-600 mt-1 font-medium">
                  Tell us your name to personalize your organic harvest.
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-2">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Authentication Successful!
                </h3>
              </div>
            )}
          </div>

          {/* Modal Body Container */}
          <div className="p-6 sm:p-8 space-y-5 bg-[#FDFBF7]">
            {/* Error Feedback Alert Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl text-xs font-semibold text-red-700 flex items-start gap-2 animate-shake">
                <span className="text-red-500 shrink-0 text-sm">⚠️</span>
                <span className="flex-1 leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 1: ENTER MOBILE NUMBER */}
            {/* ========================================================================= */}
            {step === 'mobile' && (
              <form onSubmit={handleSendOtpSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Mobile Number
                  </label>

                  <div className="flex items-center bg-white border border-stone-300 rounded-2xl p-1.5 focus-within:border-[#4E641A] focus-within:ring-2 focus-within:ring-[#4E641A]/20 transition shadow-2xs">
                    {/* Fixed Country Code Badge */}
                    <div className="px-3 py-2 bg-stone-100/80 text-stone-800 text-xs font-extrabold rounded-xl shrink-0 flex items-center gap-1.5 select-none border border-stone-200">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>

                    {/* 10-Digit Mobile Input */}
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setMobile(val);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="98765 43210"
                      inputMode="numeric"
                      autoFocus
                      className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base font-bold text-stone-900 tracking-wider focus:outline-none placeholder:text-stone-400 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mobile.length !== 10 || isSubmitting}
                  className="w-full py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending WhatsApp OTP...</span>
                    </>
                  ) : (
                    <span>Continue →</span>
                  )}
                </button>

                <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                  By continuing, you agree to our{' '}
                  <a href="/terms" target="_blank" rel="noreferrer" className="text-[#4E641A] font-bold underline hover:text-[#2F3B0C]">
                    Terms of Service
                  </a>{' '}
                  &{' '}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="text-[#4E641A] font-bold underline hover:text-[#2F3B0C]">
                    Privacy Policy
                  </a>.
                </p>
              </form>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 2: VERIFY OTP SCREEN */}
            {/* ========================================================================= */}
            {step === 'otp' && (
              <form onSubmit={(e) => handleVerifyOtpSubmit(e)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block text-center">
                    Enter 6-Digit Verification Code
                  </label>

                  {/* 6 Individual Digit Inputs */}
                  <div className="flex justify-between items-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono bg-white border rounded-2xl focus:outline-none transition shadow-2xs ${
                          digit ? 'border-[#4E641A] bg-[#FCFAF5] text-[#2F3B0C]' : 'border-stone-300 text-stone-900 focus:border-[#4E641A]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Countdown Timer & Resend Option */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-stone-500 font-medium">
                    Didn't receive OTP?
                  </span>

                  {timer > 0 ? (
                    <span className="font-mono text-xs font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                      Resend in 00:{timer < 10 ? `0${timer}` : timer}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="text-[#4E641A] hover:text-[#2F3B0C] font-extrabold underline cursor-pointer border-none bg-transparent"
                    >
                      Resend OTP Now
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otpDigits.join('').length !== 6 || isSubmitting}
                  className="w-full py-3.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify OTP & Continue →</span>
                  )}
                </button>
              </form>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 3: OPTIONAL PROFILE COMPLETION */}
            {/* ========================================================================= */}
            {step === 'profile' && (
              <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Full Name *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-[#4E641A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full bg-white border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Gender (Optional)</label>
                    <select
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Date of Birth (Optional)</label>
                    <input
                      type="date"
                      value={profileDob}
                      onChange={(e) => setProfileDob(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none focus:border-[#4E641A]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => handleFinalAuthSuccess()}
                    className="text-stone-500 hover:text-stone-800 text-xs font-bold border-none bg-transparent cursor-pointer"
                  >
                    Skip for Now
                  </button>

                  <button
                    type="submit"
                    disabled={!profileName.trim() || isSubmitting}
                    className="px-6 py-2.5 bg-[#4E641A] hover:bg-[#2F3B0C] text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50 border-none"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Profile →'}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 4: SUCCESS ANIMATION STATE */}
            {/* ========================================================================= */}
            {step === 'success' && (
              <div className="py-6">
                <SuccessState userName={profileName || 'Customer'} />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

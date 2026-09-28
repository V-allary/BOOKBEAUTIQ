import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const CODE_LENGTH = 6;

const formatCountdown = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function VerifyEmail() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);
  const initialSendDone = useRef(false);

  const resetDigits = () => {
    setDigits(Array(CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  const markVerifiedAndContinue = () => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    const updated = { ...stored, isEmailVerified: true };
    localStorage.setItem("user", JSON.stringify(updated));

    navigate(
      updated.verificationStatus === "verified"
        ? "/dashboard"
        : "/verify-account",
      { replace: true }
    );
  };

  // ==========================================
  // SEND CODE
  // ==========================================

  const sendCode = async () => {
    setSending(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch(
        `${API_URL}/api/users/email-verification/send`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok && data.alreadyVerified) {
        markVerifiedAndContinue();
        return;
      }

      if (response.status === 429) {
        setCooldown(data.retryAfter || 60);
        if (data.reason === "cooldown") {
          setInfo(
            "A code was already sent to your email. Enter it below, or wait to request a new one."
          );
        } else {
          setError(data.message);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not send the code.");
      }

      setCooldown(data.retryAfter || 60);
      setInfo("A new code is on its way. It expires in 10 minutes.");
      resetDigits();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Guard: only business owners belong here. Send the first code on arrival.
  useEffect(() => {
    if (!token || !user) {
      navigate("/signin", { replace: true });
      return;
    }

    if (user.role !== "business") {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (initialSendDone.current) return;
    initialSendDone.current = true;
    sendCode();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // ==========================================
  // VERIFY CODE
  // ==========================================

  const submitCode = async (code) => {
    if (verifying || code.length !== CODE_LENGTH) return;

    setVerifying(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/users/email-verification/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        resetDigits();
        throw new Error(data.message || "Verification failed.");
      }

      markVerifiedAndContinue();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  // ==========================================
  // CODE INPUT HANDLERS
  // ==========================================

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && next.every(Boolean)) {
      submitCode(next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;
    e.preventDefault();

    setDigits(
      Array(CODE_LENGTH)
        .fill("")
        .map((_, i) => pasted[i] || "")
    );

    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();

    if (pasted.length === CODE_LENGTH) submitCode(pasted);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  if (!user) return null;

  const codeComplete = digits.every(Boolean);

  return (
    <div className="min-h-screen bg-[#F7F7F6] px-5 py-10 sm:px-8 sm:py-14">

      <div className="mx-auto max-w-lg">

        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-block text-2xl font-bold tracking-tight text-[#242424]"
          >
            Book
            <span className="text-[#9D536D]">Beautiq</span>
          </Link>
        </div>

        <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-6 shadow-[0_15px_50px_rgba(30,25,25,0.06)] sm:p-8">

          <div className="mb-7">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2E8EC] text-lg text-[#9D536D]">
              ✉
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
              Verify your email
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              We sent a 6-digit code to{" "}
              <span className="font-bold text-[#242424]">{user.email}</span>.
              Check that this address is correct, then enter the code below.
            </p>

          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
              {error}
            </div>
          )}

          {info && !error && (
            <div className="mb-5 rounded-xl border border-[#E8D4DC] bg-[#F8EEF2] p-4 text-sm leading-6 text-[#7E4057]">
              {info}
            </div>
          )}

          {/* CODE BOXES */}

          <div className="flex justify-between gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={verifying}
                aria-label={`Digit ${index + 1}`}
                className="h-14 w-full rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] text-center text-xl font-bold text-[#242424] outline-none transition focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10 disabled:opacity-60"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => submitCode(digits.join(""))}
            disabled={verifying || !codeComplete}
            className="mt-6 w-full rounded-xl bg-[#242424] py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#9D536D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying ? "Verifying..." : "Verify Email"}
          </button>

          {/* RESEND */}

          <div className="mt-6 text-center text-sm text-gray-500">
            Didn't get it?{" "}
            {cooldown > 0 ? (
              <span className="font-semibold text-gray-400">
                Resend in {formatCountdown(cooldown)}
              </span>
            ) : (
              <button
                type="button"
                onClick={sendCode}
                disabled={sending}
                className="font-bold text-[#9D536D] transition hover:text-[#7E4057] hover:underline disabled:opacity-60"
              >
                {sending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-xs leading-5 text-gray-400">
            Can't find it? Check your spam or junk folder. It comes from
            hello@bookbeautiq.com.
          </p>

          <div className="mt-7 border-t border-[#ECE9E6] pt-6 text-center text-sm text-gray-500">
            Wrong email address?{" "}
            <button
              type="button"
              onClick={handleLogout}
              className="font-bold text-[#9D536D] transition hover:text-[#7E4057] hover:underline"
            >
              Log out and sign up again
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default VerifyEmail;
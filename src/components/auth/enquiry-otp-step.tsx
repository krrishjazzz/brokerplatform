"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePhoneOtp } from "@/hooks/use-phone-otp";

type EnquiryOtpStepProps = {
  phone: string;
  onBack: () => void;
  onVerified: (otp: string) => void | Promise<void>;
  verifying?: boolean;
};

export function EnquiryOtpStep({ phone, onBack, onVerified, verifying = false }: EnquiryOtpStepProps) {
  const {
    otp,
    otpRefs,
    sending,
    error,
    setError,
    resendCooldown,
    sendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    getOtpString,
  } = usePhoneOtp();

  const handleVerify = async () => {
    const otpString = getOtpString();
    if (otpString.length !== 6) {
      setError("Enter the complete 6-digit OTP");
      return;
    }
    setError("");
    await onVerified(otpString);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Edit enquiry details
      </button>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Verify your mobile</h3>
        <p className="mt-1 text-xs text-text-secondary">
          Enter the 6-digit OTP sent to <span className="font-semibold text-foreground">{phone}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              otpRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(event) => handleOtpChange(index, event.target.value)}
            onKeyDown={(event) => handleOtpKeyDown(index, event)}
            className="h-11 w-10 rounded-btn border border-border text-center text-lg font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-11"
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <Button
        type="button"
        onClick={handleVerify}
        loading={verifying}
        className="w-full"
        disabled={getOtpString().length !== 6}
      >
        Verify &amp; send enquiry
      </Button>

      <div className="text-center text-sm text-text-secondary">
        {resendCooldown > 0 ? (
          <span>Resend OTP in {resendCooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={() => void sendOtp(phone)}
            disabled={sending}
            className="font-medium text-primary hover:underline disabled:opacity-50"
          >
            {sending ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>
    </div>
  );
}

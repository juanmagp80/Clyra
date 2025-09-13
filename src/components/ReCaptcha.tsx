'use client'
import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaComponentProps {
    onVerify: (token: string | null) => void;
    theme?: 'light' | 'dark';
}

export interface ReCaptchaRef {
    reset: () => void;
    execute: () => void;
}

const ReCaptchaComponent = forwardRef<ReCaptchaRef, ReCaptchaComponentProps>(
    ({ onVerify, theme = 'light' }, ref) => {
        const recaptchaRef = useRef<ReCAPTCHA>(null);

        useImperativeHandle(ref, () => ({
            reset: () => {
                recaptchaRef.current?.reset();
            },
            execute: () => {
                recaptchaRef.current?.execute();
            }
        }));

        const handleChange = (token: string | null) => {
            onVerify(token);
        };

        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

        if (!siteKey) {
            console.error('⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY no está configurado');
            return (
                <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                        ⚠️ reCAPTCHA no configurado. Por favor configura NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                    </p>
                </div>
            );
        }

        return (
            <div className="flex justify-center">
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    onChange={handleChange}
                    theme={theme}
                    size="normal"
                />
            </div>
        );
    }
);

ReCaptchaComponent.displayName = 'ReCaptchaComponent';

export default ReCaptchaComponent;
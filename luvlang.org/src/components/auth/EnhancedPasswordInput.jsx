import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDatabasePasswordValidation } from '@/hooks/useDatabasePasswordValidation';
const EnhancedPasswordInput = ({ value, onChange, onValidationChange, placeholder = "Enter password", showStrength = true, disabled = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    const { validationResult, isValidating, validatePassword, getStrengthText } = useDatabasePasswordValidation();
    // Debounced validation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (value.trim()) {
                validatePassword(value);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [value, validatePassword]);
    // Notify parent of validation changes
    useEffect(() => {
        if (validationResult && onValidationChange) {
            onValidationChange(validationResult.isValid, validationResult.score);
        }
    }, [validationResult, onValidationChange]);
    const strengthInfo = getStrengthText();
    return (<div className="space-y-2">
      <div className="relative">
        <Input type={showPassword ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="pr-10"/>
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" tabIndex={-1}>
          {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
        </button>
      </div>

      {/* Password strength indicator */}
      {showStrength && value && (<div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Password Strength:</span>
            {isValidating ? (<span className="text-sm text-gray-500">Checking...</span>) : (<span className={`text-sm font-medium ${strengthInfo.color}`}>
                {strengthInfo.text}
              </span>)}
          </div>

          {/* Progress bar */}
          {validationResult && (<div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-300 ${validationResult.score >= 80 ? 'bg-green-500' :
                    validationResult.score >= 60 ? 'bg-blue-500' :
                        validationResult.score >= 40 ? 'bg-yellow-500' :
                            validationResult.score >= 20 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${Math.max(validationResult.score, 10)}%` }}/>
            </div>)}
        </div>)}

      {/* Validation errors */}
      {validationResult && validationResult.errors.length > 0 && (<div className="space-y-1">
          {validationResult.errors.map((error, index) => (<div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <XCircle size={14}/>
              <span>{error}</span>
            </div>))}
        </div>)}

      {/* Validation success */}
      {validationResult && validationResult.isValid && (<div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle size={14}/>
          <span>Password meets all requirements</span>
        </div>)}
    </div>);
};
export default EnhancedPasswordInput;

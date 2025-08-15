import { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { sanitizeInput } from '@/utils/security';
const SecureInput = ({ id, label, placeholder, value, onChange, maxLength, minLength = 0, required = false, validation }) => {
    const [error, setError] = useState(null);
    const [isTouched, setIsTouched] = useState(false);
    const handleChange = useCallback((e) => {
        const rawValue = e.target.value;
        // Validate length before any processing
        if (rawValue.length > maxLength) {
            return; // Don't allow input beyond max length
        }
        // Only sanitize on blur or when saving, not during typing
        // This preserves normal typing behavior including spaces
        onChange(rawValue);
        // Run custom validation if provided
        if (validation) {
            // Use sanitized version for validation but keep raw for display
            const sanitizedForValidation = sanitizeInput(rawValue);
            const validationError = validation(sanitizedForValidation);
            setError(validationError);
        }
        else {
            setError(null);
        }
    }, [onChange, maxLength, validation]);
    const handleBlur = () => {
        setIsTouched(true);
        // Sanitize and update the value on blur
        const sanitizedValue = sanitizeInput(value);
        if (sanitizedValue !== value) {
            onChange(sanitizedValue);
        }
        // Validate minimum length
        if (required && sanitizedValue.length < minLength) {
            setError(`${label} must be at least ${minLength} characters`);
        }
    };
    const remainingChars = maxLength - value.length;
    const isValid = !error && (!required || value.length >= minLength);
    return (<div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
          {isValid && isTouched && <CheckCircle className="h-4 w-4 text-green-500"/>}
        </Label>
        <div className="flex items-center gap-2">
          <Badge variant={remainingChars < 50 ? "destructive" : "secondary"} className="text-xs">
            {remainingChars} left
          </Badge>
        </div>
      </div>
      
      <Textarea id={id} placeholder={placeholder} value={value} onChange={handleChange} onBlur={handleBlur} className={`${error ? 'border-red-500' : ''} ${isValid && isTouched ? 'border-green-500' : ''}`} maxLength={maxLength}/>
      
      {error && (<div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4"/>
          {error}
        </div>)}
      
      {minLength > 0 && (<p className="text-xs text-gray-500">
          Minimum {minLength} characters required
        </p>)}
    </div>);
};
export default SecureInput;

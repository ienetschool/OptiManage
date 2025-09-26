import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Tag } from 'lucide-react';

interface CouponValidatorProps {
  totalAmount: number;
  customerId?: string;
  onCouponApplied: (coupon: ValidatedCoupon | null) => void;
  className?: string;
}

interface ValidatedCoupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
}

interface ValidationResponse {
  valid: boolean;
  coupon?: ValidatedCoupon;
  error?: string;
}

export default function CouponValidator({ 
  totalAmount, 
  customerId, 
  onCouponApplied, 
  className = '' 
}: CouponValidatorProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(null);

  // Reset validation when total amount changes
  useEffect(() => {
    if (appliedCoupon && totalAmount !== undefined) {
      validateCoupon(appliedCoupon.code);
    }
  }, [totalAmount]);

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setValidationResult(null);
      setAppliedCoupon(null);
      onCouponApplied(null);
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          totalAmount,
          customerId
        })
      });

      const result: ValidationResponse = await response.json();
      setValidationResult(result);

      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        onCouponApplied(result.coupon);
      } else {
        setAppliedCoupon(null);
        onCouponApplied(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setValidationResult({
        valid: false,
        error: 'Failed to validate coupon. Please try again.'
      });
      setAppliedCoupon(null);
      onCouponApplied(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCouponCode(value);
    
    // Clear previous validation when user starts typing
    if (validationResult) {
      setValidationResult(null);
      setAppliedCoupon(null);
      onCouponApplied(null);
    }
  };

  const handleValidate = () => {
    validateCoupon(couponCode);
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setValidationResult(null);
    setAppliedCoupon(null);
    onCouponApplied(null);
  };

  const formatDiscount = (coupon: ValidatedCoupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% off (Save $${coupon.discount_amount.toFixed(2)})`;
    } else {
      return `$${coupon.discount_amount.toFixed(2)} off`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <label className="text-sm font-medium">Coupon Code</label>
      </div>

      {!appliedCoupon ? (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={handleInputChange}
            className="uppercase"
            disabled={isValidating}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={!couponCode.trim() || isValidating}
            className="shrink-0"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-medium text-green-800">{appliedCoupon.name}</div>
              <div className="text-sm text-green-600">
                {formatDiscount(appliedCoupon)}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-green-700 hover:text-green-800"
          >
            Remove
          </Button>
        </div>
      )}

      {validationResult && !validationResult.valid && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {validationResult.error || 'Invalid coupon code'}
          </AlertDescription>
        </Alert>
      )}

      {appliedCoupon && (
        <div className="text-xs text-muted-foreground">
          {appliedCoupon.description}
        </div>
      )}
    </div>
  );
}
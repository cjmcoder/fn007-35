import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, CheckCircle, Shield, Gamepad2, Trophy, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api-client';
import { useAuth } from '@/store/useAuth';
import { leaderboardService } from '@/services/leaderboardService';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    birthdate: {
      month: '',
      day: '',
      year: ''
    },
    referralCode: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 letter and 1 number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    // Birthdate validation (must be 18+)
    const { month, day, year } = formData.birthdate;
    if (!month || !day || !year) {
      newErrors.birthdate = 'Please enter your complete birthdate';
    } else {
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.birthdate = 'You must be at least 18 years old to register';
      }
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        marketingConsent: formData.agreeToMarketing
      });

      // Auto-login after successful registration
      await login(formData.email, formData.password);

      // Create leaderboard entry for new user
      try {
        await leaderboardService.createUserEntry(
          response.user?.id || '',
          formData.username,
          formData.username
        );
      } catch (leaderboardError) {
        console.error('Failed to create leaderboard entry:', leaderboardError);
        // Don't show error to user - account was created successfully
      }

      navigate('/my-profile');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'month' || field === 'day' || field === 'year') {
      setFormData(prev => ({ 
        ...prev, 
        birthdate: { ...prev.birthdate, [field]: value as string } 
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold gradient-text">FLOCKNODE</h1>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Create your FREE account</h2>
          <p className="text-muted-foreground">Join the elite gaming community and start competing for real prizes</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-card border">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Secure & Safe</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-card border">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Real Prizes</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-card border">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Elite Community</span>
          </div>
        </div>

        <Card className="w-full">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Choose your gaming handle"
                      className={errors.username ? 'border-destructive' : ''}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">3-15 characters, letters, numbers, and underscores only</p>
                    {errors.username && (
                      <p className="text-sm text-destructive">{errors.username}</p>
                    )}
                  </div>

                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className={errors.email ? 'border-destructive' : ''}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">A confirmation email will be sent to this address</p>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Create a strong password"
                        className={errors.password ? 'border-destructive' : ''}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">8-12 characters, 1 letter & 1 number minimum</p>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        className={errors.confirmPassword ? 'border-destructive' : ''}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location & Verification Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Location & Verification</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country}</p>
                    )}
                  </div>

                  {/* Birthdate */}
                  <div className="space-y-2">
                    <Label>Birthdate *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={formData.birthdate.month} onValueChange={(value) => handleInputChange('month', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={formData.birthdate.day} onValueChange={(value) => handleInputChange('day', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={formData.birthdate.year} onValueChange={(value) => handleInputChange('year', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 100 }, (_, i) => (
                            <SelectItem key={2025 - i} value={(2025 - i).toString()}>
                              {2025 - i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">You must be 18+ to participate in skill-based games</p>
                    {errors.birthdate && (
                      <p className="text-sm text-destructive">{errors.birthdate}</p>
                    )}
                  </div>
                </div>

                {/* Referral Code */}
                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referred By/Promo Code (optional)</Label>
                  <Input
                    id="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => handleInputChange('referralCode', e.target.value)}
                    placeholder="Enter referral code or promo code"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Legal Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Legal Notice:</strong> To be a member of FLOCKNODE, you must enter your location and birthdate. 
                  This is needed to verify that it is legal for you to participate in games of skill for cash prizes on our platform.
                </AlertDescription>
              </Alert>

              {/* Terms and Agreements */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                    disabled={loading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                      I AM OVER 18 AND DO NOT ALREADY HAVE AN ACCOUNT. I AGREE TO THE{' '}
                      <Link to="/terms" className="text-primary hover:underline font-medium">
                        TERMS OF USE
                      </Link>{' '}
                      <Link to="/privacy" className="text-primary hover:underline font-medium">
                        PRIVACY
                      </Link>{' '}
                      &{' '}
                      <Link to="/cookies" className="text-primary hover:underline font-medium">
                        COOKIES POLICY
                      </Link>
                      .
                    </Label>
                  </div>
                </div>
                {errors.terms && (
                  <p className="text-sm text-destructive">{errors.terms}</p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.agreeToMarketing}
                    onCheckedChange={(checked) => handleInputChange('agreeToMarketing', checked as boolean)}
                    disabled={loading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                      I would like to receive promotional emails and updates about FLOCKNODE events and tournaments.
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    CREATE ACCOUNT
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





// Patient credential generation utilities

// Helper function to auto-generate username for patients
export const generatePatientUsername = (firstName: string, lastName: string, existingUsernames: string[] = []) => {
  const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
  let username = baseUsername;
  let counter = 1;
  
  while (existingUsernames.includes(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
};

// Helper function to generate secure random password
export const generatePatientPassword = (length: number = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Helper function to generate QR code data for patient
export const generatePatientQRData = (patient: {
  id?: string;
  patientCode?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  username?: string;
}) => {
  return {
    patientId: patient.id || 'pending',
    patientCode: patient.patientCode || 'pending',
    name: `${patient.firstName} ${patient.lastName}`,
    phone: patient.phone || '',
    username: patient.username || '',
    type: 'patient_credentials',
    generatedAt: new Date().toISOString()
  };
};

// Helper function to generate patient ID card data
export const generatePatientIdCardData = (patient: {
  id?: string;
  patientCode?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  username?: string;
  bloodType?: string;
}) => {
  return {
    patientId: patient.id || 'pending',
    patientCode: patient.patientCode || 'pending',
    fullName: `${patient.firstName} ${patient.lastName}`,
    phone: patient.phone || '',
    email: patient.email || '',
    dateOfBirth: patient.dateOfBirth || '',
    username: patient.username || '',
    bloodType: patient.bloodType || '',
    issuedDate: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 1 year
    clinicName: 'IeOMS Medical Center',
    clinicAddress: '123 Healthcare Blvd, Medical District',
    clinicPhone: '(555) 123-4567'
  };
};

// Helper function to auto-generate patient code
export const generatePatientCode = () => {
  const year = new Date().getFullYear();
  const timestamp = String(Date.now()).slice(-6);
  return `PAT-${year}-${timestamp}`;
};

// Helper function to validate password strength
export const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;
  
  if (score < 3) return { strength: 'weak', score };
  if (score < 5) return { strength: 'medium', score };
  return { strength: 'strong', score };
};

// Helper function to format credentials for display
export const formatCredentialsForDisplay = (credentials: {
  username: string;
  password: string;
  qrData?: any;
  idCardData?: any;
}) => {
  return {
    username: credentials.username,
    password: credentials.password,
    qrCodeValue: JSON.stringify(credentials.qrData || {}),
    idCardInfo: credentials.idCardData || {},
    generatedAt: new Date().toLocaleString(),
    passwordStrength: validatePasswordStrength(credentials.password)
  };
};
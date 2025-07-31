import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Calendar,
  FileText,
  Globe,
  Settings
} from "lucide-react";

const privacySections = [
  {
    id: "overview",
    title: "1. Privacy Overview",
    content: `OptiCare is committed to protecting the privacy and security of your personal information and Protected Health Information (PHI). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical practice management platform. We are bound by HIPAA regulations and maintain the highest standards of data protection.`
  },
  {
    id: "information-collected",
    title: "2. Information We Collect",
    content: `We collect several types of information:

Personal Information: Name, email address, phone number, professional credentials, and billing information.

Protected Health Information (PHI): Patient medical records, treatment history, prescriptions, and other health-related data you input into our system.

Usage Information: How you interact with our platform, including login times, features used, and system performance data.

Technical Information: IP addresses, browser type, operating system, and device information for security and optimization purposes.`
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    content: `We use your information solely to provide and improve our medical practice management services:

Service Delivery: To provide the core functionality of patient management, scheduling, billing, and reporting.

Communication: To send service-related notifications, updates, and support communications.

Security and Compliance: To maintain HIPAA compliance, prevent unauthorized access, and ensure data integrity.

Service Improvement: To analyze usage patterns and improve our platform's functionality and user experience.

We never use your PHI for marketing purposes or share it with third parties for commercial gain.`
  },
  {
    id: "information-sharing",
    title: "4. Information Sharing and Disclosure",
    content: `We may share your information only in the following limited circumstances:

Business Associates: With HIPAA-compliant service providers who help us deliver our services (cloud hosting, payment processing).

Legal Requirements: When required by law, court order, or to protect the rights and safety of OptiCare and our users.

With Your Consent: When you explicitly authorize us to share information with specific third parties.

Emergency Situations: To prevent serious harm to you or others, as permitted by HIPAA emergency provisions.

We never sell, rent, or trade your personal information or PHI to third parties.`
  },
  {
    id: "data-security",
    title: "5. Data Security Measures",
    content: `We implement comprehensive security measures to protect your information:

Encryption: All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.

Access Controls: Role-based access controls ensure only authorized personnel can access specific information.

Authentication: Multi-factor authentication and strong password requirements for all accounts.

Monitoring: 24/7 security monitoring and intrusion detection systems.

Regular Audits: Regular security assessments and penetration testing by independent third parties.

HIPAA Compliance: Full compliance with HIPAA Security Rule requirements.`
  },
  {
    id: "data-retention",
    title: "6. Data Retention and Deletion",
    content: `We retain your information according to the following policies:

PHI: Retained for the minimum period required by applicable laws and regulations, typically 7-10 years depending on state requirements.

Account Information: Maintained while your account is active and for 30 days after termination to allow data recovery.

Usage Logs: Retained for 12 months for security and troubleshooting purposes.

Backup Data: Securely stored backups are retained for disaster recovery purposes and deleted according to our retention schedule.

You may request deletion of your data at any time, subject to legal retention requirements.`
  },
  {
    id: "your-rights",
    title: "7. Your Privacy Rights",
    content: `Under HIPAA and applicable privacy laws, you have the right to:

Access: Request copies of your personal information and PHI we maintain.

Amendment: Request corrections to inaccurate or incomplete information.

Restriction: Request restrictions on how we use or disclose your information.

Portability: Export your data in a commonly used, machine-readable format.

Deletion: Request deletion of your information, subject to legal retention requirements.

Notification: Be notified of any data breaches that may affect your information.

To exercise these rights, contact our Privacy Officer at privacy@opticare.com.`
  },
  {
    id: "cookies",
    title: "8. Cookies and Tracking Technologies",
    content: `We use cookies and similar technologies to:

Essential Cookies: Enable core platform functionality and maintain your session.

Analytics Cookies: Understand how you use our platform to improve user experience.

Security Cookies: Detect and prevent fraudulent activity.

You can control cookie settings through your browser, but disabling essential cookies may limit platform functionality. We do not use cookies for advertising or cross-site tracking.`
  },
  {
    id: "international-transfers",
    title: "9. International Data Transfers",
    content: `Your data is primarily stored and processed in secure data centers within the United States. If we transfer data internationally, we ensure:

Adequate Protection: All transfers comply with applicable data protection laws.

Safeguards: Appropriate contractual safeguards are in place to protect your information.

HIPAA Compliance: All international transfers maintain HIPAA compliance standards.`
  },
  {
    id: "children-privacy",
    title: "10. Children's Privacy",
    content: `While our platform is used to manage pediatric patient records, we do not knowingly collect personal information directly from children under 13. All pediatric patient information is entered by healthcare providers or authorized adults in accordance with HIPAA and applicable child privacy laws.`
  },
  {
    id: "changes",
    title: "11. Changes to Privacy Policy",
    content: `We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will:

Provide Notice: Notify you at least 30 days before any material changes take effect.

Obtain Consent: Obtain your consent for any changes that expand our use of your PHI.

Maintain Records: Keep records of all policy versions and effective dates.

The current version is always available on our website and in your account settings.`
  },
  {
    id: "contact",
    title: "12. Contact Information",
    content: `For privacy-related questions or concerns, contact us:

Privacy Officer: privacy@opticare.com
Phone: (555) 123-4567 ext. 101
Mail: OptiCare Privacy Officer, 123 Medical Plaza, Suite 500, New York, NY 10001

For HIPAA-related complaints, you may also contact the U.S. Department of Health and Human Services Office for Civil Rights.`
  }
];

const privacyFeatures = [
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Full compliance with healthcare privacy regulations"
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Military-grade encryption for all data transmission and storage"
  },
  {
    icon: Eye,
    title: "Transparent Practices",
    description: "Clear, honest communication about data handling"
  },
  {
    icon: Database,
    title: "Secure Storage",
    description: "Data stored in certified, secure cloud infrastructure"
  },
  {
    icon: Users,
    title: "Access Controls",
    description: "Role-based permissions and multi-factor authentication"
  },
  {
    icon: Settings,
    title: "User Control",
    description: "Full control over your data with export and deletion rights"
  }
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-green-600 text-white mb-6">Privacy</Badge>
            <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-slate-300 mb-8">
              Your privacy and data security are our top priorities. Learn how we protect and handle your information.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Last Updated: January 1, 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Features */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Our Privacy Commitments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {privacyFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <Icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Key Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-12">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-2xl font-semibold text-blue-900 mb-4">HIPAA Compliance Notice</h3>
                  <p className="text-blue-800 leading-relaxed">
                    OptiCare serves as a HIPAA Business Associate and is fully compliant with all HIPAA Privacy and Security Rules. 
                    We have implemented comprehensive administrative, physical, and technical safeguards to protect your Protected Health Information (PHI). 
                    All staff undergo regular HIPAA training, and we maintain detailed policies and procedures to ensure ongoing compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-green-600 mt-1" />
                <div>
                  <h3 className="text-2xl font-semibold text-green-900 mb-4">Your Data Rights</h3>
                  <p className="text-green-800 leading-relaxed mb-4">
                    You have complete control over your data. You can access, correct, restrict, or delete your information at any time. 
                    We provide easy-to-use tools for data export and account management directly in your dashboard.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Manage Data Preferences
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {privacySections.map((section) => (
                <Card key={section.id} className="border-slate-200">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-6" id={section.id}>
                      {section.title}
                    </h2>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Navigation */}
            <Card className="border-slate-200 mt-12">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Quick Navigation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {privacySections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-sm">{section.title}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Protection Summary */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Data Protection at a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">256-bit</div>
                <div className="text-slate-600">AES Encryption</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                <div className="text-slate-600">Uptime SLA</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-slate-600">Security Monitoring</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">0</div>
                <div className="text-slate-600">Data Breaches</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Privacy Questions or Concerns?</h3>
                <p className="text-slate-600 mb-8">
                  Our dedicated Privacy Officer is available to address any questions about how we handle your data. 
                  We're committed to transparency and will respond to all privacy inquiries within 48 hours.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Contact Privacy Officer
                  </Button>
                  <Button variant="outline">
                    Request Data Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Documents */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Related Privacy Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Terms of Service</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Legal terms governing your use of OptiCare services.
                  </p>
                  <Button variant="outline" size="sm">
                    Read Terms
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Cookie Policy</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Details about cookies and tracking technologies we use.
                  </p>
                  <Button variant="outline" size="sm">
                    View Policy
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Security Standards</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Comprehensive overview of our security measures.
                  </p>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
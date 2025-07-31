import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Shield,
  Scale,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Calendar
} from "lucide-react";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing and using OptiCare's medical practice management platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, then you may not access the Service.`
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: `OptiCare provides a comprehensive medical practice management platform that includes patient management, appointment scheduling, billing, prescription management, and related healthcare administrative tools. The Service is designed to help healthcare providers manage their practices more efficiently while maintaining HIPAA compliance.`
  },
  {
    id: "eligibility",
    title: "3. User Eligibility",
    content: `The Service is intended for use by licensed healthcare providers, medical professionals, and authorized healthcare staff. By using the Service, you represent and warrant that you are at least 18 years old and have the legal authority to enter into these Terms on behalf of yourself or the healthcare organization you represent.`
  },
  {
    id: "accounts",
    title: "4. User Accounts and Registration",
    content: `To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your account credentials and for all activities that occur under your account.`
  },
  {
    id: "hipaa",
    title: "5. HIPAA Compliance and Data Protection",
    content: `OptiCare is committed to maintaining HIPAA compliance. We serve as a Business Associate under HIPAA and have implemented appropriate administrative, physical, and technical safeguards to protect Protected Health Information (PHI). Users must also comply with all applicable healthcare privacy and security regulations, including HIPAA, when using the Service.`
  },
  {
    id: "acceptable-use",
    title: "6. Acceptable Use Policy",
    content: `You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not use the Service to: (a) violate any applicable laws or regulations; (b) transmit any harmful, threatening, abusive, or defamatory content; (c) attempt to gain unauthorized access to any part of the Service; (d) interfere with or disrupt the Service; or (e) use the Service for any purpose other than legitimate healthcare practice management.`
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property Rights",
    content: `The Service and its original content, features, and functionality are and will remain the exclusive property of OptiCare and its licensors. The Service is protected by copyright, trademark, and other laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service without our prior written consent.`
  },
  {
    id: "data-ownership",
    title: "8. Data Ownership and Portability",
    content: `You retain ownership of all patient data, medical records, and other information you input into the Service. OptiCare provides tools for data export and migration to ensure your ability to retrieve your data. We will not use your data for any purpose other than providing the Service, except as required by law or with your explicit consent.`
  },
  {
    id: "fees",
    title: "9. Fees and Payment Terms",
    content: `Use of certain features of the Service may be subject to payment of fees. All fees are non-refundable unless otherwise stated. You agree to pay all applicable fees as described on our pricing page. We reserve the right to change our fees upon 30 days' prior notice.`
  },
  {
    id: "termination",
    title: "10. Termination",
    content: `You may terminate your account at any time by following the instructions in your account settings. We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately, but you will retain access to export your data for 30 days.`
  },
  {
    id: "warranty",
    title: "11. Warranty and Disclaimers",
    content: `While we strive to provide a reliable service, OptiCare is provided "as is" and "as available" without any warranties of any kind. We do not warrant that the Service will be uninterrupted, error-free, or completely secure. You acknowledge that your use of the Service is at your own risk.`
  },
  {
    id: "liability",
    title: "12. Limitation of Liability",
    content: `In no event shall OptiCare, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.`
  },
  {
    id: "indemnification",
    title: "13. Indemnification",
    content: `You agree to defend, indemnify, and hold harmless OptiCare and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).`
  },
  {
    id: "changes",
    title: "14. Changes to Terms",
    content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.`
  },
  {
    id: "governing-law",
    title: "15. Governing Law and Dispute Resolution",
    content: `These Terms shall be interpreted and governed by the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules.`
  },
  {
    id: "contact",
    title: "16. Contact Information",
    content: `If you have any questions about these Terms of Service, please contact us at legal@opticare.com or by mail at OptiCare Legal Department, 123 Medical Plaza, Suite 500, New York, NY 10001.`
  }
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-blue-600 text-white mb-6">Legal</Badge>
            <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl text-slate-300 mb-8">
              Please read these terms carefully before using OptiCare's services.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Last Updated: January 1, 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Version 2.1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Key Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">HIPAA Compliant</h3>
                  <p className="text-slate-600">
                    Full HIPAA compliance with comprehensive data protection and privacy safeguards.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Data Ownership</h3>
                  <p className="text-slate-600">
                    You retain full ownership of your data with guaranteed export and portability rights.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Scale className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Fair Terms</h3>
                  <p className="text-slate-600">
                    Transparent terms with clear rights, responsibilities, and dispute resolution processes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-12">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Notice</h3>
                  <p className="text-yellow-800">
                    These Terms of Service constitute a legally binding agreement between you and OptiCare. 
                    By using our service, you acknowledge that you have read, understood, and agree to be bound by these terms. 
                    If you are using the service on behalf of a healthcare organization, you represent that you have the authority to bind that organization to these terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {sections.map((section) => (
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

            {/* Table of Contents */}
            <Card className="border-slate-200 mt-12">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Quick Navigation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sections.map((section) => (
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

            {/* Contact Section */}
            <Card className="border-slate-200 mt-12">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Questions About These Terms?</h3>
                <p className="text-slate-600 mb-6">
                  If you have any questions or concerns about these Terms of Service, 
                  our legal team is here to help clarify any provisions.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Contact Legal Team
                  </Button>
                  <Button variant="outline">
                    View Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Documents */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Related Legal Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Privacy Policy</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Learn how we collect, use, and protect your personal information.
                  </p>
                  <Button variant="outline" size="sm">
                    Read Policy
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Security Standards</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Detailed information about our security measures and compliance.
                  </p>
                  <Button variant="outline" size="sm">
                    View Standards
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Scale className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Cookie Policy</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Information about cookies and tracking technologies we use.
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
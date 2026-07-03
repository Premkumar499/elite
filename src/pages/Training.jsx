import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CONTACT_NUMBER = '+91 75393 03671';

export default function Training() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', paymentPlan: '', experience: '', referral: '', terms: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { firstName, lastName, email, phone, address, paymentPlan, experience, referral, terms } = form;

    // Input validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !address.trim() || !paymentPlan || !experience || !referral || !terms) {
      alert('Please fill in all required fields and agree to the terms.');
      return;
    }
    // Email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    // Phone: only digits, spaces, +, -, between 7-15 chars
    if (!/^[\d\s\+\-]{7,15}$/.test(phone.trim())) {
      alert('Please enter a valid phone number.');
      return;
    }
    // Sanitize: strip HTML tags from text fields
    const strip = v => v.replace(/<[^>]*>/g, '').trim();

    setSubmitting(true);
    const { error } = await supabase.from('enrollments').insert({
      first_name:   strip(firstName),
      last_name:    strip(lastName),
      email:        email.trim().toLowerCase(),
      phone:        phone.trim(),
      address:      strip(address),
      payment_plan: paymentPlan,
      experience:   experience,
      referral:     referral,
      status:       'new',
    });
    setSubmitting(false);
    if (error) { alert('Submission failed. Please try again.'); return; }
    setDone(true);
    setForm({ firstName: '', lastName: '', email: '', phone: '', address: '', paymentPlan: '', experience: '', referral: '', terms: false });
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Master Aari Embroidery – Professional Course</h1>
          <p>Learn Traditional &amp; Contemporary Aari Stitching Techniques</p>
          <div className="hero-highlights">
            <div className="highlight-item"><i className="fas fa-calendar-alt"></i><span>3-Month Offline Program</span></div>
            <div className="highlight-item"><i className="fas fa-box-open"></i><span>Materials Provided</span></div>
            <div className="highlight-item"><i className="fas fa-chalkboard-teacher"></i><span>Live Sessions</span></div>
          </div>
          <a href="#enrollment" className="btn btn-accent">Enroll Today</a>
        </div>
      </section>

      {/* Course Overview */}
      <section className="section course-overview">
        <div className="container">
          <h2 className="section-title">Course Overview</h2>
          <div className="course-details">
            <div className="detail-card"><i className="fas fa-clock"></i><h3>Duration</h3><p>3 Months (12 Weeks)</p></div>
            <div className="detail-card"><i className="fas fa-signal"></i><h3>Difficulty Level</h3><p>Beginner to Advanced</p></div>
            <div className="detail-card"><i className="fas fa-chalkboard"></i><h3>Format</h3><p>Offline (In-Person) + Live Demonstrations</p></div>
          </div>
          <div className="instructor-info">
            <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="Instructor" className="instructor-img" />
            <div>
              <h3>Priya Sharma</h3>
              <p>10+ years in Aari Work, trained 500+ students</p>
              <div className="instructor-social">
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
                <a href="#"><i className="fab fa-facebook"></i></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">What You&apos;ll Learn</h2>
          <div className="benefits-container">
            <div className="benefit-card">
              <h3>Aari Techniques</h3>
              <ul>
                <li>Basic to advanced Aari stitching techniques</li>
                <li>Design patterns (flowers, motifs, zardozi)</li>
                <li>Fabric selection and thread handling</li>
                <li>Bead and sequin work integration</li>
              </ul>
            </div>
            <div className="benefit-card">
              <h3>Creative Skills</h3>
              <ul>
                <li>Creating custom embroidery designs</li>
                <li>Color theory for embroidery</li>
                <li>Transferring designs to fabric</li>
                <li>Finishing and framing techniques</li>
              </ul>
            </div>
            <div className="benefit-card">
              <h3>Career Opportunities</h3>
              <ul>
                <li>Start a home business</li>
                <li>Work with fashion designers</li>
                <li>Sell custom embroidered products</li>
                <li>Teach Aari work to others</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section pricing">
        <div className="container">
          <h2 className="section-title">Pricing &amp; Enrollment</h2>
          <div className="pricing-container">
            <div className="pricing-card">
              <h3>Basic Plan</h3>
              <div className="price">₹7,999</div>
              <ul className="pricing-features">
                <li>12 Weeks Training</li>
                <li>Basic Materials Kit</li>
                <li>Certificate of Completion</li>
                <li>Access to Workshop</li>
              </ul>
              <a href="#enrollment" className="btn">Choose Plan</a>
            </div>
            <div className="pricing-card">
              <h3>Installment Plan</h3>
              <div className="price">₹3,200 <span>/month for 3 months</span></div>
              <ul className="pricing-features">
                <li>Everything in Standard</li>
                <li>Flexible Monthly Payments</li>
                <li>Same Certification</li>
                <li>All Materials Included</li>
              </ul>
              <a href="#enrollment" className="btn">Choose Plan</a>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Form */}
      <section id="enrollment" className="section" style={{ background: 'linear-gradient(135deg, #f7f2e7 0%, #ffffff 100%)' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="section-title" style={{ fontSize: 36, color: '#333d47', marginBottom: 12 }}>
              Start Your Journey Today
            </h2>
            <p style={{ fontSize: 18, color: '#666', maxWidth: 600, margin: '0 auto' }}>
              Fill out the form below and our team will contact you within 24 hours to confirm your enrollment.
            </p>
          </div>

          <form id="enrollmentForm" className="enrollment-form" onSubmit={handleSubmit} style={styles.form}>
            {/* Personal Information Section */}
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>
                <i className="fas fa-user"></i>
              </div>
              <div>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
                <p style={styles.sectionSubtitle}>Tell us about yourself</p>
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  First Name <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <i className="fas fa-user" style={styles.inputIcon}></i>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={handleChange} 
                    placeholder="Enter your first name"
                    style={styles.input}
                    required 
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Last Name <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <i className="fas fa-user" style={styles.inputIcon}></i>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={form.lastName} 
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    style={styles.input}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div style={{ ...styles.sectionHeader, marginTop: 32 }}>
              <div style={styles.sectionIcon}>
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <h3 style={styles.sectionTitle}>Contact Information</h3>
                <p style={styles.sectionSubtitle}>How can we reach you?</p>
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email Address <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <i className="fas fa-envelope" style={styles.inputIcon}></i>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    style={styles.input}
                    required 
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Phone Number <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <i className="fas fa-phone" style={styles.inputIcon}></i>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    style={styles.input}
                    required 
                  />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Address <span style={styles.required}>*</span>
              </label>
              <div style={styles.inputWrapper}>
                <i className="fas fa-map-marker-alt" style={{ ...styles.inputIcon, top: 16 }}></i>
                <textarea 
                  name="address" 
                  rows="3" 
                  value={form.address} 
                  onChange={handleChange}
                  placeholder="Enter your complete address"
                  style={{ ...styles.input, paddingTop: 12, paddingBottom: 12, minHeight: 90, resize: 'vertical' }}
                  required
                />
              </div>
            </div>

            {/* Course Details Section */}
            <div style={{ ...styles.sectionHeader, marginTop: 32 }}>
              <div style={styles.sectionIcon}>
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div>
                <h3 style={styles.sectionTitle}>Course Details</h3>
                <p style={styles.sectionSubtitle}>Choose your plan and tell us about your experience</p>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Payment Plan <span style={styles.required}>*</span>
              </label>
              <div style={styles.radioGroup}>
                <label style={{
                  ...styles.radioCard,
                  ...(form.paymentPlan === 'Basic Plan - ₹5,999' ? styles.radioCardActive : {})
                }}>
                  <input 
                    type="radio" 
                    name="paymentPlan" 
                    value="Basic Plan - ₹5,999" 
                    checked={form.paymentPlan === 'Basic Plan - ₹5,999'} 
                    onChange={handleChange}
                    style={styles.radioInput}
                    required 
                  />
                  <div style={styles.radioContent}>
                    <div style={styles.radioHeader}>
                      <i className="fas fa-money-bill-wave" style={{ fontSize: 24, color: '#a07d56' }}></i>
                      <div>
                        <div style={styles.radioTitle}>Basic Plan</div>
                        <div style={styles.radioPrice}>₹5,999</div>
                      </div>
                    </div>
                    <p style={styles.radioDesc}>One-time payment • Full course access • Materials included</p>
                  </div>
                  {form.paymentPlan === 'Basic Plan - ₹5,999' && (
                    <i className="fas fa-check-circle" style={styles.radioCheck}></i>
                  )}
                </label>

                <label style={{
                  ...styles.radioCard,
                  ...(form.paymentPlan === 'Installment Plan - ₹3,200/month' ? styles.radioCardActive : {})
                }}>
                  <input 
                    type="radio" 
                    name="paymentPlan" 
                    value="Installment Plan - ₹3,200/month" 
                    checked={form.paymentPlan === 'Installment Plan - ₹3,200/month'} 
                    onChange={handleChange}
                    style={styles.radioInput}
                  />
                  <div style={styles.radioContent}>
                    <div style={styles.radioHeader}>
                      <i className="fas fa-calendar-alt" style={{ fontSize: 24, color: '#a07d56' }}></i>
                      <div>
                        <div style={styles.radioTitle}>Installment Plan</div>
                        <div style={styles.radioPrice}>₹3,200<span style={{ fontSize: 14, fontWeight: 400 }}>/month</span></div>
                      </div>
                    </div>
                    <p style={styles.radioDesc}>Pay in 3 monthly installments • Same benefits • Flexible payment</p>
                  </div>
                  {form.paymentPlan === 'Installment Plan - ₹3,200/month' && (
                    <i className="fas fa-check-circle" style={styles.radioCheck}></i>
                  )}
                </label>
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Previous Experience <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <i className="fas fa-chart-line" style={styles.inputIcon}></i>
                  <select 
                    name="experience" 
                    value={form.experience} 
                    onChange={handleChange}
                    style={{ ...styles.input, paddingLeft: 44 }}
                    required
                  >
                    <option value="">Select your level</option>
                    <option>Complete Beginner</option>
                    <option>Some Experience</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  How did you hear about us? <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <i className="fas fa-bullhorn" style={styles.inputIcon}></i>
                  <select 
                    name="referral" 
                    value={form.referral} 
                    onChange={handleChange}
                    style={{ ...styles.input, paddingLeft: 44 }}
                    required
                  >
                    <option value="">Please select</option>
                    <option>Social Media</option>
                    <option>Friend/Family</option>
                    <option>Google Search</option>
                    <option>Advertisement</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div style={styles.termsBox}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  name="terms" 
                  checked={form.terms} 
                  onChange={handleChange}
                  style={styles.checkbox}
                  required 
                />
                <span style={styles.checkboxText}>
                  I agree to the <a href="#" style={styles.link}>terms and conditions</a> and <a href="#" style={styles.link}>privacy policy</a> <span style={styles.required}>*</span>
                </span>
              </label>
            </div>

            {/* Success Message or Submit Button */}
            {done ? (
              <div style={styles.successBox}>
                <i className="fas fa-check-circle" style={styles.successIcon}></i>
                <h3 style={styles.successTitle}>Enrollment Submitted Successfully!</h3>
                <p style={styles.successText}>
                  Thank you for enrolling! Our team will contact you within 24 hours to confirm your enrollment and provide next steps.
                </p>
                <div style={styles.successContact}>
                  <p style={styles.successContactLabel}>For immediate assistance, call us:</p>
                  <a href={`tel:${CONTACT_NUMBER}`} style={styles.successContactNum}>
                    <i className="fas fa-phone-alt"></i>
                    {CONTACT_NUMBER}
                  </a>
                </div>
                <button 
                  type="button"
                  className="btn" 
                  style={styles.anotherBtn} 
                  onClick={() => setDone(false)}
                >
                  Submit Another Enrollment
                </button>
              </div>
            ) : (
              <button 
                type="submit" 
                className="btn btn-accent submit-btn" 
                style={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: 10 }}></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" style={{ marginRight: 10 }}></i>
                    Submit Enrollment
                  </>
                )}
              </button>
            )}
          </form>

          {/* Help Section */}
          <div style={styles.helpSection}>
            <div style={styles.helpCard}>
              <i className="fas fa-question-circle" style={styles.helpIcon}></i>
              <div>
                <h4 style={styles.helpTitle}>Need Help?</h4>
                <p style={styles.helpText}>Contact us at <a href={`tel:${CONTACT_NUMBER}`} style={styles.link}>{CONTACT_NUMBER}</a></p>
              </div>
            </div>
            <div style={styles.helpCard}>
              <i className="fas fa-clock" style={styles.helpIcon}></i>
              <div>
                <h4 style={styles.helpTitle}>Response Time</h4>
                <p style={styles.helpText}>We'll get back to you within 24 hours</p>
              </div>
            </div>
            <div style={styles.helpCard}>
              <i className="fas fa-shield-alt" style={styles.helpIcon}></i>
              <div>
                <h4 style={styles.helpTitle}>Secure & Private</h4>
                <p style={styles.helpText}>Your information is safe with us</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="footer-links-container">
        <div className="footer-column">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/collections">All Collections</Link></li>
            <li><a href="#">New Arrivals</a></li>
            <li><a href="#">Best Sellers</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>About</h4>
          <ul>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/training">Training</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Contact</h4>
          <ul>
            <li><span><i className="fas fa-map-marker-alt"></i> 123 Fashion St, Chennai</span></li>
            <li><span><i className="fas fa-phone"></i> +91 9876543210</span></li>
            <li><span><i className="fas fa-envelope"></i> info@elitestudio.com</span></li>
          </ul>
          <div className="footer-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
      <div className="copyright">
        <p>&copy; 2023 Elite Studio. All Rights Reserved.</p>
      </div>
    </>
  );
}

const es = {
  successBox:  { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '28px 24px', textAlign: 'center' },
  contactNum:  { display: 'inline-block', fontSize: 20, fontWeight: 700, color: '#a07d56', textDecoration: 'none', background: '#fff', padding: '10px 24px', borderRadius: 8, border: '1.5px solid #e0d5c5' },
};

const styles = {
  form: {
    background: '#fff',
    borderRadius: 16,
    padding: 40,
    boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '2px solid #f0ece3',
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #a07d56 0%, #c9a87c 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#333d47',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    margin: '2px 0 0',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#333d47',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
    marginLeft: 2,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a07d56',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 10,
    fontSize: 15,
    color: '#333d47',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  radioCard: {
    position: 'relative',
    display: 'block',
    padding: 20,
    border: '2px solid #e0e0e0',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: '#fff',
  },
  radioCardActive: {
    borderColor: '#a07d56',
    background: '#f7f2e7',
    boxShadow: '0 4px 12px rgba(160, 125, 86, 0.15)',
  },
  radioInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  radioContent: {
    paddingRight: 40,
  },
  radioHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  radioTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#333d47',
    marginBottom: 2,
  },
  radioPrice: {
    fontSize: 24,
    fontWeight: 700,
    color: '#a07d56',
  },
  radioDesc: {
    fontSize: 13,
    color: '#666',
    margin: 0,
    lineHeight: 1.4,
  },
  radioCheck: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 24,
    color: '#27ae60',
  },
  termsBox: {
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    padding: 16,
    marginTop: 24,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    cursor: 'pointer',
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
    cursor: 'pointer',
    flexShrink: 0,
  },
  checkboxText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 1.5,
  },
  link: {
    color: '#a07d56',
    textDecoration: 'none',
    fontWeight: 600,
  },
  submitBtn: {
    width: '100%',
    padding: '16px 32px',
    fontSize: 18,
    fontWeight: 700,
    marginTop: 32,
    background: 'linear-gradient(135deg, #a07d56 0%, #c9a87c 100%)',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(160, 125, 86, 0.3)',
  },
  successBox: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '2px solid #86efac',
    borderRadius: 16,
    padding: 40,
    textAlign: 'center',
    marginTop: 32,
  },
  successIcon: {
    fontSize: 64,
    color: '#27ae60',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#333d47',
    margin: '0 0 12px',
  },
  successText: {
    fontSize: 16,
    color: '#555',
    margin: '0 0 24px',
    lineHeight: 1.6,
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  successContact: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  successContactLabel: {
    fontSize: 14,
    color: '#666',
    margin: '0 0 10px',
  },
  successContactNum: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 24,
    fontWeight: 700,
    color: '#a07d56',
    textDecoration: 'none',
    padding: '12px 24px',
    background: '#f7f2e7',
    borderRadius: 10,
    border: '2px solid #e0d5c5',
    transition: 'all 0.3s',
  },
  anotherBtn: {
    padding: '12px 32px',
    fontSize: 16,
  },
  helpSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
    marginTop: 40,
  },
  helpCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: 20,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e0e0e0',
  },
  helpIcon: {
    fontSize: 28,
    color: '#a07d56',
    flexShrink: 0,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#333d47',
    margin: '0 0 4px',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    margin: 0,
  },
};

// Media queries - Add to your CSS file
const mediaStyles = `
@media (max-width: 768px) {
  .enrollment-form {
    padding: 24px !important;
  }
  .enrollment-form > div[style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
  }
}
`;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabaseAdmin } from '../lib/supabaseAdmin';

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
    if (!firstName || !lastName || !email || !phone || !address || !paymentPlan || !experience || !referral || !terms) {
      alert('Please fill in all required fields and agree to the terms.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabaseAdmin.from('enrollments').insert({
      first_name:   firstName,
      last_name:    lastName,
      email,
      phone,
      address,
      payment_plan: paymentPlan,
      experience:   form.experience,
      referral:     form.referral,
      status:       'new',
    });
    setSubmitting(false);
    if (error) { alert('Submission failed: ' + error.message); return; }
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
      <section id="enrollment" className="section">
        <div className="container">
          <h2 className="section-title">Enrollment Form</h2>
          <form id="enrollmentForm" className="enrollment-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Address *</label>
              <textarea name="address" rows="3" value={form.address} onChange={handleChange} required></textarea>
            </div>
            <div className="form-group">
              <label>Payment Plan *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="paymentPlan" value="Basic Plan - ₹5,999" checked={form.paymentPlan === 'Basic Plan - ₹5,999'} onChange={handleChange} required />
                  <span>Basic Plan - ₹5,999</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="paymentPlan" value="Installment Plan - ₹3,200/month" checked={form.paymentPlan === 'Installment Plan - ₹3,200/month'} onChange={handleChange} />
                  <span>Installment Plan - ₹3,200/month for 3 months</span>
                </label>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Previous Experience</label>
                <select name="experience" value={form.experience} onChange={handleChange} required>
                  <option value="">Select your level</option>
                  <option>Complete Beginner</option>
                  <option>Some Experience</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label>How did you hear about us?</label>
                <select name="referral" value={form.referral} onChange={handleChange} required>
                  <option value="">Please select</option>
                  <option>Social Media</option>
                  <option>Friend/Family</option>
                  <option>Google Search</option>
                  <option>Advertisement</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} required />
                <span>I agree to the terms and conditions and privacy policy *</span>
              </label>
            </div>

            {done ? (
              <div style={es.successBox}>
                <i className="fas fa-check-circle" style={{ fontSize: 28, color: '#27ae60', marginBottom: 10 }}></i>
                <h3 style={{ color: '#333d47', margin: '0 0 8px' }}>Enrollment Submitted!</h3>
                <p style={{ color: '#555', margin: '0 0 14px' }}>
                  Our team will contact you within 24 hours to confirm your enrollment.
                </p>
                <a href={`tel:${CONTACT_NUMBER}`} style={es.contactNum}>
                  <i className="fas fa-phone-alt" style={{ marginRight: 8 }}></i>
                  {CONTACT_NUMBER}
                </a>
                <button className="btn" style={{ marginTop: 16 }} onClick={() => setDone(false)}>
                  Submit Another
                </button>
              </div>
            ) : (
              <button type="submit" className="btn btn-accent submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Enrollment'}
              </button>
            )}
          </form>
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

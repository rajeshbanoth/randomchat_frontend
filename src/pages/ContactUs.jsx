// src/pages/ContactUs.jsx
import React, { useState } from 'react';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app you would send this to backend / email service
    console.log('Form submitted:', formData);
    setSubmitted(true);
    // Optional: reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Contact Us</h1>
      <p>
        We'd love to hear from you! Whether you have a question, feedback, or just want to say hi,
        feel free to reach out using the form below.
      </p>

      {submitted ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#e8f5e9',
          borderRadius: '8px',
          margin: '20px 0',
          textAlign: 'center',
        }}>
          <h3>Thank you for your message!</h3>
          <p>We'll get back to you as soon as possible.</p>
          <button
            onClick={() => setSubmitted(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            />
          </div>

          <div>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            />
          </div>

          <div>
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            />
          </div>

          <div>
            <label htmlFor="message">Your Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              style={{ width: '100%', padding: '10px', marginTop: '6px', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            Send Message
          </button>
        </form>
      )}

      <div style={{ marginTop: '60px' }}>
        <h3>Other ways to reach us</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>Email:</strong> support@yourapp.com</li>
          <li><strong>Twitter/X:</strong> @YourAppHandle</li>
          <li><strong>Location:</strong> Gurugram, Haryana, India</li>
        </ul>
      </div>

      <p style={{ marginTop: '40px', fontSize: '0.9em', color: '#666' }}>
        We usually respond within 24–48 hours on weekdays.
      </p>
    </div>
  );
}

export default ContactUs;
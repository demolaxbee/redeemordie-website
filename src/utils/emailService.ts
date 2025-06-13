import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Replace with actual key
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with actual service ID
const EMAILJS_CONTACT_TEMPLATE_ID = 'YOUR_CONTACT_TEMPLATE_ID'; // Replace with actual template ID
const EMAILJS_NEWSLETTER_TEMPLATE_ID = 'YOUR_NEWSLETTER_TEMPLATE_ID'; // Replace with actual template ID

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterData {
  email: string;
}

export const sendContactEmail = async (formData: ContactFormData): Promise<void> => {
  try {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_email: 'reedeemordie66@gmail.com',
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CONTACT_TEMPLATE_ID,
      templateParams
    );
  } catch (error) {
    console.error('Failed to send contact email:', error);
    throw new Error('Failed to send message. Please try again.');
  }
};

export const sendNewsletterEmail = async (data: NewsletterData): Promise<void> => {
  try {
    const templateParams = {
      user_email: data.email,
      to_email: 'reedeemordie66@gmail.com',
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_NEWSLETTER_TEMPLATE_ID,
      templateParams
    );
  } catch (error) {
    console.error('Failed to send newsletter email:', error);
    throw new Error('Failed to subscribe. Please try again.');
  }
}; 
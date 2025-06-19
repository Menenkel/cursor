-- Create the FAQ table
CREATE TABLE IF NOT EXISTS faq (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample FAQ data
INSERT INTO faq (question, answer) VALUES
('What is your return policy?', 'We offer a 30-day return policy for all purchases. Items must be in original condition with all tags attached.'),
('How do I contact customer support?', 'You can reach our support team at support@example.com or call us at 1-800-123-4567 during business hours (9 AM - 6 PM EST).'),
('Do you ship internationally?', 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. International orders typically take 7-14 business days.'),
('What payment methods do you accept?', 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.'),
('How can I track my order?', 'Once your order ships, you will receive a tracking number via email. You can also track your order in your account dashboard.'),
('What is your privacy policy?', 'We take your privacy seriously. We never share your personal information with third parties without your consent. Read our full privacy policy on our website.'),
('Do you offer discounts for bulk orders?', 'Yes, we offer volume discounts for orders over $500. Contact our sales team for custom pricing.'),
('What is your warranty policy?', 'All products come with a 1-year manufacturer warranty. Extended warranties are available for purchase.'),
('Can I cancel my order?', 'Orders can be cancelled within 2 hours of placement. After that, orders are processed and cannot be cancelled.'),
('How do I create an account?', 'Click the "Sign Up" button in the top right corner of our website. You can also create an account during checkout.'); 
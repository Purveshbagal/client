import { useState } from 'react';
import { toast } from 'react-toastify';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now just show a toast - server integration can be added later
    toast.success('Message sent. We will contact you at 7058409290 if needed.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="mb-4">For quick support call: <strong>7058409290</strong></p>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <div className="mb-3">
          <label className="block">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full" />
        </div>
        <div className="mb-3">
          <label className="block">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full" />
        </div>
        <div className="mb-3">
          <label className="block">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="border p-2 w-full" rows="5"></textarea>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send Message</button>
      </form>
    </div>
  );
};

export default ContactUs;

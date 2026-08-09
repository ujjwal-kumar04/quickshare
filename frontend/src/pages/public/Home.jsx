import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUploadCloud, FiKey, FiShare2, FiShield, FiClock, FiLock,
  FiImage, FiFileText, FiFile, FiGrid, FiChevronDown,
} from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  { icon: FiKey, title: 'Unique Share Keys', desc: 'Every share gets a short, memorable key like QS-A8K92X — no accounts needed to receive.' },
  { icon: FiLock, title: 'Password Protection', desc: 'Lock any share with a password. Only people who know it can view the content.' },
  { icon: FiClock, title: 'Auto Expiry', desc: 'Set shares to expire in 10 minutes, an hour, a day, a week, or never.' },
  { icon: FiShield, title: 'One-Time Download', desc: 'Content self-destructs after a single download for maximum privacy.' },
  { icon: FiShare2, title: 'QR Codes', desc: 'Every share link comes with a scannable QR code for instant mobile access.' },
  { icon: FiGrid, title: 'Full Dashboard', desc: 'Track views, downloads, and manage your entire sharing history in one place.' },
];

const fileTypes = [
  { icon: FiImage, label: 'Images' },
  { icon: FiFileText, label: 'PDF' },
  { icon: FiFile, label: 'Word' },
  { icon: FiFile, label: 'Excel' },
  { icon: FiFile, label: 'PowerPoint' },
  { icon: FiFileText, label: 'Text / CSV' },
  { icon: FiFile, label: 'ZIP' },
];

const faqs = [
  { q: 'Do I need an account to receive a share?', a: 'No — anyone with the share key can retrieve content on the /receive page.' },
  { q: 'Do I need an account to send a share?', a: 'Yes, senders need an approved account so shares can be tracked in a dashboard.' },
  { q: 'Why does my new account say "pending"?', a: 'For security, every new registration is reviewed and approved by an administrator before it can log in.' },
  { q: 'Is my content encrypted?', a: 'Passwords are hashed with bcrypt and never stored in plain text; all traffic should be served over HTTPS in production.' },
];

const Home = () => (
  <div className="flex flex-col gap-24">
    {/* Hero */}
    <section className="grid items-center gap-10 pt-6 md:grid-cols-2">
      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        <h1 className="text-4xl font-extrabold leading-tight text-slate-700 dark:text-slate-100 sm:text-5xl">
          Share Anything.<br /> Anywhere. Instantly.
        </h1>
        <p className="mt-4 max-w-md text-base text-slate-500 dark:text-slate-400">
          Share text, images and documents securely using a simple unique key.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/dashboard/create">
            <button className="neu-btn rounded-2xl px-6 py-3 font-semibold text-accent-600 dark:text-accent-400">Create a Share</button>
          </Link>
          <Link to="/receive">
            <button className="neu-btn rounded-2xl px-6 py-3 font-semibold text-slate-500 dark:text-slate-300">Receive a Share</button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial="hidden" animate="show" variants={fadeUp}
        className="neu-card rounded-neu p-6"
      >
        <div className="neu-inset flex flex-col items-center gap-3 rounded-neu px-6 py-10 text-center">
          <div className="neu-flat flex h-14 w-14 items-center justify-center rounded-full text-accent-500">
            <FiUploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Drag & drop files, or paste text</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Generated key</span>
          <span className="neu-flat rounded-xl px-3 py-1 text-sm font-bold text-accent-500">QS-X7K9M2P</span>
        </div>
      </motion.div>
    </section>

    {/* How it works */}
    <section>
      <h2 className="mb-8 text-center text-2xl font-bold text-slate-700 dark:text-slate-100">How It Works</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { step: '1', title: 'Upload or type', desc: 'Add your files or text — QuickShare handles the rest.' },
          { step: '2', title: 'Get your key', desc: 'A unique, secure key is generated automatically.' },
          { step: '3', title: 'Share it', desc: 'Send the key to anyone — they retrieve it on /receive.' },
        ].map((s) => (
          <div key={s.step} className="neu-card rounded-neu p-6 text-center">
            <div className="neu-flat mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-accent-500">
              {s.step}
            </div>
            <h3 className="mb-1 font-semibold text-slate-600 dark:text-slate-300">{s.title}</h3>
            <p className="text-sm text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section>
      <h2 className="mb-8 text-center text-2xl font-bold text-slate-700 dark:text-slate-100">Features</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="neu-card rounded-neu p-6">
            <div className="neu-inset mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-accent-500">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1 font-semibold text-slate-600 dark:text-slate-300">{f.title}</h3>
            <p className="text-sm text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Security */}
    <section className="neu-card rounded-neu p-8 text-center">
      <div className="neu-flat mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-accent-500">
        <FiShield className="h-6 w-6" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-700 dark:text-slate-100">Built with security first</h2>
      <p className="mx-auto max-w-xl text-sm text-slate-400">
        Passwords hashed with bcrypt, JWT-based authentication, admin-approved access, strict file validation, and expiry enforcement on every single request.
      </p>
    </section>

    {/* Supported files */}
    <section>
      <h2 className="mb-8 text-center text-2xl font-bold text-slate-700 dark:text-slate-100">Supported Files</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {fileTypes.map((f) => (
          <div key={f.label} className="neu-flat flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-300">
            <f.icon className="text-accent-500" /> {f.label}
          </div>
        ))}
      </div>
    </section>

    {/* FAQ */}
    <section>
      <h2 className="mb-8 text-center text-2xl font-bold text-slate-700 dark:text-slate-100">Frequently Asked Questions</h2>
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        {faqs.map((f) => (
          <details key={f.q} className="neu-flat group rounded-2xl p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-600 dark:text-slate-300">
              {f.q}
              <FiChevronDown className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-slate-400">{f.a}</p>
          </details>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="neu-card rounded-neu p-10 text-center">
      <h2 className="mb-2 text-2xl font-bold text-slate-700 dark:text-slate-100">Ready to share?</h2>
      <p className="mb-6 text-sm text-slate-400">Create your first share in seconds.</p>
      <Link to="/dashboard/create">
        <button className="neu-btn rounded-2xl px-8 py-3 font-semibold text-accent-600 dark:text-accent-400">Get Started</button>
      </Link>
    </section>
  </div>
);

export default Home;

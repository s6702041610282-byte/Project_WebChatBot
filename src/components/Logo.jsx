import { Bot } from 'lucide-react';

/** โลโก้เว็บไซต์ ChatBot Learning */
export default function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`}>
      <span className="logo__mark" aria-hidden="true">
        <Bot size={22} strokeWidth={2.2} />
      </span>
      <span className="logo__text">
        ChatBot <strong>Learning</strong>
      </span>
    </span>
  );
}

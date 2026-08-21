import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';
import { useLanguage } from '../utils/language.jsx';

export default function PasswordInput({ name, value, onChange, placeholder, required }) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, display: 'flex', alignItems: 'center' }}
        tabIndex={-1}
        aria-label={show ? t('pwHide') : t('pwShow')}
      >
        {show ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
      </button>
    </div>
  );
}

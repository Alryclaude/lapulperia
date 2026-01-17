import React from 'react';
import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Social share URL generators
const shareUrls = {
  whatsapp: (text, url) =>
    `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
  facebook: (url) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (text, url) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  telegram: (text, url) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
};

// Platform icons as simple SVG components
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

/**
 * ShareButtons Component
 * Displays platform-specific share buttons with fallback to Web Share API
 *
 * @param {Object} props
 * @param {string} props.title - Title to share
 * @param {string} props.text - Text/description to share
 * @param {string} props.url - URL to share (defaults to current page)
 * @param {string} props.variant - 'full' for labeled buttons, 'icons' for icon-only
 * @param {string} props.className - Additional classes for container
 */
const ShareButtons = ({
  title,
  text,
  url = typeof window !== 'undefined' ? window.location.href : '',
  variant = 'icons',
  className = '',
}) => {
  const shareText = text || title;

  const handleShare = (platform) => {
    const shareUrl = shareUrls[platform](shareText, url);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${url}`);
        toast.success('Enlace copiado');
      } catch {
        toast.error('No se pudo copiar');
      }
    }
  };

  const platforms = [
    { id: 'whatsapp', Icon: WhatsAppIcon, label: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600' },
    { id: 'facebook', Icon: FacebookIcon, label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'twitter', Icon: TwitterIcon, label: 'X', color: 'bg-black hover:bg-gray-800' },
    { id: 'telegram', Icon: TelegramIcon, label: 'Telegram', color: 'bg-sky-500 hover:bg-sky-600' },
  ];

  if (variant === 'icons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {platforms.map(({ id, Icon, label, color }) => (
          <button
            key={id}
            onClick={() => handleShare(id)}
            className={`p-2 rounded-full text-white transition-colors ${color}`}
            aria-label={`Compartir en ${label}`}
            title={`Compartir en ${label}`}
          >
            <Icon />
          </button>
        ))}
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          aria-label="Más opciones"
          title="Más opciones"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Full variant with labels
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {platforms.map(({ id, Icon, label, color }) => (
        <button
          key={id}
          onClick={() => handleShare(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors ${color}`}
        >
          <Icon />
          {label}
        </button>
      ))}
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors"
      >
        <Share2 className="w-5 h-5" />
        Más
      </button>
    </div>
  );
};

export default ShareButtons;

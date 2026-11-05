'use client';

import Script from 'next/script';

declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (username: string, options: Record<string, string>) => void;
    };
  }
}

const drawWidget = () => {
  window.kofiWidgetOverlay?.draw('opensourcesarajevo', {
    type: 'floating-chat',
    'floating-chat.donateButton.text': 'Podrži nas',
    'floating-chat.donateButton.background-color': '#34d399',
    'floating-chat.donateButton.text-color': '#052e1f',
  });
};

const KofiWidget = () => (
  <Script
    src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
    strategy="lazyOnload"
    onLoad={drawWidget}
  />
);

export default KofiWidget;

'use client';

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

type SafeHTMLRendererProps = {
  html: string;
};

export default function SafeHTMLRenderer({ html }: SafeHTMLRendererProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    setSanitizedHtml(DOMPurify.sanitize(html));
  }, [html]);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

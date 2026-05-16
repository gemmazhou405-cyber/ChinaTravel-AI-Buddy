import { useEffect } from 'react';

interface Props {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg animate-fade-in">
      {message}
    </div>
  );
}

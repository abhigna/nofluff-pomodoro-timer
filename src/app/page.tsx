'use client';

import { PomodoroTimer } from './components/PomodoroTimer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-0">
      <PomodoroTimer />
    </main>
  );
}

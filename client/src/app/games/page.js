'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const games = [
  {
    id: 'silly',
    emoji: '🤪',
    title: 'Silly Answer Challenge',
    subtitle: 'Can you spot Funny’s playful fib?',
    detail: 'Ask anything. Funny gives a clearly silly answer, and you decide if it is true or silly.',
    color: 'from-amber-300 to-orange-300',
    button: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    id: 'riddle',
    emoji: '🧩',
    title: 'Riddle Time',
    subtitle: 'Solve a little brain teaser',
    detail: 'Try a riddle, ask for a hint, and keep guessing at your own pace.',
    color: 'from-violet-300 to-fuchsia-300',
    button: 'bg-violet-500 hover:bg-violet-600',
  },
  {
    id: 'story',
    emoji: '📚',
    title: 'Story Builder',
    subtitle: 'Make up a story together',
    detail: 'You choose what happens next. Funny turns your ideas into a playful story.',
    color: 'from-teal-300 to-cyan-300',
    button: 'bg-teal-500 hover:bg-teal-600',
  },
];

const openingPrompts = {
  riddle: 'Start Riddle Time. Ask me one fun, age-appropriate riddle. Do not reveal its answer. Invite me to guess.',
  story: 'Start Story Builder. Begin a short, cheerful story with an easy choice for me to make about what happens next.',
};

const gameInstructions = {
  silly: 'We are playing Silly Answer Challenge. The child will ask a question. Give exactly one obviously imaginary, playful, incorrect answer (never one that could be mistaken for real safety, health, or important factual advice). Clearly keep the tone absurd and harmless, then ask “True or silly?” Do not reveal the real answer until the child guesses. After the guess, gently reveal that it was pretend and give a short, accurate answer if it is a safe everyday question. Then invite another question. If asked about safety, health, or anything important, stop the game and answer truthfully.',
  riddle: 'We are playing Riddle Time. Give one short, child-friendly riddle at a time and do not reveal the answer until the child solves it or asks you to reveal it. When asked for a hint, provide a gentle hint without giving the answer. Encourage guesses kindly. After revealing an answer, ask whether they want another riddle.',
  story: 'We are playing Story Builder. Build a cheerful, age-appropriate story together in short turns. Start with a few sentences and ask what should happen next. Use the child’s ideas in the next part and finish each turn with a simple open choice. Keep the story kind and non-scary. Let the child say “The End” to finish.',
};

export default function GamesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('');
  const [round, setRound] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    api.getProfile()
      .then((data) => { if (active) setProfile(data); })
      .catch(() => { if (active) router.replace('/welcome'); })
      .finally(() => { if (active) setIsCheckingProfile(false); });
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const sendTurn = async (text, nextPhase) => {
    if (!selectedGame || isSending || !text.trim()) return;
    setError('');
    setIsSending(true);
    setMessages((current) => [...current, { role: 'user', text }]);
    setDraft('');

    try {
      // The active game's conversation id is kept in the URL-independent component state.
      const result = await api.sendMessage(selectedGame.conversationId, text);
      setMessages((current) => [...current, { role: 'assistant', text: result.assistantMessage.text }]);
      setPhase(nextPhase);
      setRound((current) => current + 1);
    } catch {
      setDraft(text);
      setError('That did not go through. Try sending it again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleStart = async (game, firstQuestion = '') => {
    // Capture the new conversation id on this selected game object for later turns.
    setSelectedGame({ ...game, conversationId: null });
    setIsSending(true);
    setMessages([]);
    setError('');
    setRound(0);
    setPhase(game.id === 'silly' ? 'question' : game.id);
    try {
      const conversation = await api.createConversation();
      const activeGame = { ...game, conversationId: conversation._id };
      setSelectedGame(activeGame);
      const opening = game.id === 'silly'
        ? `${gameInstructions.silly}\n\nThe child’s first question is: ${firstQuestion}`
        : openingPrompts[game.id];
      const result = await api.sendMessage(conversation._id, opening);
      setMessages(game.id === 'silly'
        ? [{ role: 'user', text: firstQuestion }, { role: 'assistant', text: result.assistantMessage.text }]
        : [{ role: 'assistant', text: result.assistantMessage.text }]);
      setPhase(game.id === 'silly' ? 'guess' : game.id);
      setRound(1);
    } catch {
      setError('Funny could not start the game. Please choose Play now to try again.');
      setSelectedGame(null);
    } finally {
      setIsSending(false);
    }
  };

  const finishGame = () => {
    setSelectedGame(null);
    setMessages([]);
    setDraft('');
    setError('');
    setPhase('');
  };

  if (isCheckingProfile || !profile) {
    return <main className="grid min-h-dvh place-items-center p-6 text-2xl font-bold text-sky-700">Getting your games ready… ✨</main>;
  }

  const currentGame = selectedGame && games.find((game) => game.id === selectedGame.id);

  return (
    <main className="min-h-dvh overflow-y-auto bg-linear-to-br from-sky-100 via-violet-50 to-rose-100 px-3 py-4 text-slate-800 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col sm:min-h-[calc(100dvh-4rem)]">
        <header className="mb-5 flex items-center justify-between gap-3 sm:mb-8">
          <button onClick={() => router.push('/chat')} className="min-h-11 rounded-full bg-white/80 px-4 py-2 font-bold shadow-sm transition hover:bg-white">← <span className="hidden sm:inline">Back to chat</span><span className="sm:hidden">Chat</span></button>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 sm:text-sm">Funny’s playroom</p>
            <p className="text-sm font-semibold sm:text-base">Hi {profile.name}! 👋</p>
          </div>
        </header>

        {!currentGame ? (
          <>
            <section className="mb-6 text-center sm:mb-9">
              <div className="mb-2 text-4xl sm:text-5xl" aria-hidden="true">🎈</div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">Pick a little adventure</h1>
              <p className="mx-auto mt-2 max-w-xl text-base text-slate-600 sm:mt-3 sm:text-lg">Choose a game and play together with Funny.</p>
            </section>

            {error && <p role="alert" className="mb-4 rounded-2xl bg-rose-50 p-3 text-center font-bold text-rose-700">{error}</p>}

            <section className="grid flex-1 content-start grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3" aria-label="Choose a game">
              {games.map((game) => (
                <article key={game.id} className={`flex min-h-56 flex-col rounded-[1.75rem] bg-linear-to-br ${game.color} p-5 shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:min-h-72 sm:p-7`}>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/65 text-3xl shadow-sm sm:mb-6 sm:h-16 sm:w-16 sm:text-4xl" aria-hidden="true">{game.emoji}</div>
                  <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{game.title}</h2>
                  <p className="mt-1 font-bold text-slate-700/80">{game.subtitle}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700 sm:text-base">{game.detail}</p>
                  {game.id === 'silly' ? (
                    <SillyStart game={game} onStart={handleStart} disabled={isSending} />
                  ) : (
                    <button onClick={() => handleStart(game)} disabled={isSending} className={`mt-5 min-h-12 w-full rounded-2xl px-5 py-3 text-lg font-extrabold text-white shadow-md transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60 ${game.button}`}>Play now <span aria-hidden="true">→</span></button>
                  )}
                </article>
              ))}
            </section>
            <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-slate-500 sm:mt-7 sm:text-sm">Silly answers are pretend and only for this game. For real questions, go back to chat and Funny will answer normally.</p>
          </>
        ) : (
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 shadow-xl shadow-slate-900/10 backdrop-blur sm:rounded-4xl">
            <div className="flex shrink-0 items-center gap-3 border-b border-slate-200/70 px-4 py-3 sm:px-6 sm:py-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl sm:h-12 sm:w-12 sm:text-3xl" aria-hidden="true">{currentGame.emoji}</span>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-extrabold sm:text-2xl">{currentGame.title}</h1>
                <p className="text-xs font-semibold text-slate-500 sm:text-sm">{round > 0 ? `Round ${round}` : 'Getting started'}</p>
              </div>
              <button onClick={finishGame} className="min-h-11 shrink-0 rounded-full bg-slate-100 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 sm:px-4">Exit game</button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:space-y-5 sm:px-6 sm:py-6" aria-live="polite">
              {messages.map((message, index) => (
                <div key={`${index}-${message.role}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] whitespace-pre-wrap wrap-break-words rounded-3xl px-4 py-3 text-base leading-relaxed shadow-sm sm:max-w-[78%] sm:px-5 sm:py-4 sm:text-lg ${message.role === 'user' ? 'rounded-br-md bg-sky-500 text-white' : 'rounded-bl-md bg-slate-100 text-slate-800'}`}>
                    {message.role === 'assistant' && <span className="mr-1" aria-hidden="true">✨</span>}{message.text}
                  </div>
                </div>
              ))}
              {isSending && <div className="text-sm font-bold text-slate-500" role="status">Funny is thinking… ✨</div>}
              {error && <div className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700" role="alert">{error}</div>}
              <div ref={bottomRef} />
            </div>

            {selectedGame.id === 'silly' && phase === 'guess' ? (
              <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-200/70 p-3 sm:px-6 sm:py-4">
                <button onClick={() => sendTurn('My guess is TRUE.', 'question')} disabled={isSending} className="min-h-12 rounded-2xl bg-emerald-500 px-3 py-3 font-extrabold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50">✅ True</button>
                <button onClick={() => sendTurn('My guess is SILLY.', 'question')} disabled={isSending} className="min-h-12 rounded-2xl bg-orange-500 px-3 py-3 font-extrabold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50">🤪 Silly</button>
              </div>
            ) : selectedGame.id === 'riddle' ? (
              <div className="shrink-0 border-t border-slate-200/70 p-3 sm:px-6 sm:py-4">
                <button onClick={() => sendTurn('Please give me a small hint, but do not tell me the answer.', 'riddle')} disabled={isSending} className="min-h-11 rounded-full bg-violet-100 px-4 py-2 font-bold text-violet-800 transition hover:bg-violet-200 disabled:opacity-50">💡 Give me a hint</button>
                <GameInput value={draft} onChange={setDraft} onSubmit={() => sendTurn(draft, 'riddle')} disabled={isSending} placeholder="Type your guess…" buttonLabel="Guess" />
              </div>
            ) : selectedGame.id === 'story' ? (
              <div className="shrink-0 border-t border-slate-200/70 p-3 sm:px-6 sm:py-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  {['Add a funny twist', 'A new friend appears', 'Let me choose'].map((idea) => <button key={idea} onClick={() => sendTurn(idea, 'story')} disabled={isSending} className="min-h-10 rounded-full bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-100 disabled:opacity-50 sm:text-sm">{idea}</button>)}
                </div>
                <GameInput value={draft} onChange={setDraft} onSubmit={() => sendTurn(draft, 'story')} disabled={isSending} placeholder="What happens next?" buttonLabel="Add to story" />
              </div>
            ) : (
              <div className="shrink-0 border-t border-slate-200/70 p-3 sm:px-6 sm:py-4">
                <GameInput value={draft} onChange={setDraft} onSubmit={() => sendTurn(`Next question: ${draft}`, 'question')} disabled={isSending} placeholder="Ask another question…" buttonLabel="Ask Funny" />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function SillyStart({ game, onStart, disabled }) {
  const [question, setQuestion] = useState('');
  return (
    <form onSubmit={(event) => { event.preventDefault(); if (question.trim()) onStart(game, question.trim()); }} className="mt-5 flex flex-col gap-2">
      <label htmlFor="silly-question" className="text-sm font-bold text-slate-700">Ask Funny a question</label>
      <input id="silly-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={180} placeholder="Why do cats purr?" className="min-h-12 w-full rounded-xl border-2 border-white/80 bg-white/80 px-3 py-2 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-orange-500" />
      <button type="submit" disabled={disabled || !question.trim()} className={`min-h-12 w-full rounded-2xl px-5 py-3 text-lg font-extrabold text-white shadow-md transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 ${game.button}`}>Play now <span aria-hidden="true">→</span></button>
    </form>
  );
}

function GameInput({ value, onChange, onSubmit, disabled, placeholder, buttonLabel }) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="mt-3 flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-1.5 pl-3 focus-within:border-sky-400 sm:rounded-full">
      <input value={value} onChange={(event) => onChange(event.target.value)} maxLength={300} placeholder={placeholder} disabled={disabled} className="min-h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400 sm:px-1" />
      <button type="submit" disabled={disabled || !value.trim()} className="min-h-10 shrink-0 rounded-xl bg-sky-500 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-sky-600 disabled:opacity-50 sm:rounded-full sm:px-5 sm:text-base">{buttonLabel}</button>
    </form>
  );
}

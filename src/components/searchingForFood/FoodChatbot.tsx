import { useState, useRef, useEffect } from 'react';
import { dishes } from '../../data/searchingForFood';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'I want something spicy and slow-cooked for a Sunday feast',
  "What's the perfect comfort food for a rainy evening?",
  "Tell me about Modak — why is it Ganesha's favorite?",
  'I saw a crispy crepe with chutney at a restaurant — what is it?',
];

const MAX_MESSAGES = 5;

const DISH_SUMMARY = dishes
  .slice(0, 30)
  .map(d => `${d.name} (${d.nameHindi || ''}): ${d.category}, ${d.region.join('/')}, ${d.isVeg ? 'veg' : 'non-veg'}${d.origin ? '. ' + d.origin : ''}${d.funFact ? ' Fun fact: ' + d.funFact : ''}`)
  .join('\n');

const SYSTEM_PROMPT = `You are a warm, knowledgeable Indian food expert embedded in an interactive data story called "Searching for Food." You help users discover Indian dishes.

Your knowledge base includes these dishes:
${DISH_SUMMARY}

Rules:
- Keep responses concise (2-4 sentences max)
- Always mention the dish name in bold
- Include the region of origin
- If the user describes a craving or mood, suggest the most fitting dish from the list
- If the user asks about a specific dish, share cultural context and fun facts
- Be warm and conversational, like a food-loving friend
- If you don't know something, say so honestly`;

export function FoodChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || messageCount >= MAX_MESSAGES) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'The AI assistant is not configured yet. Please add a Gemini API key to enable this feature.',
        }]);
        setIsLoading(false);
        return;
      }

      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: conversationHistory,
            generationConfig: {
              maxOutputTokens: 200,
              temperature: 0.7,
            },
          }),
        }
      );

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || 'Sorry, I couldn\'t think of a suggestion right now. Try asking about a specific dish!';

      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Try again in a moment!',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) {
    return (
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open food AI assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
          <path d="M8 12h.01M12 12h.01M16 12h.01"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="chatbot-panel">
      <div className="chatbot-header">
        <div>
          <div className="chatbot-title">Food AI</div>
          <div className="chatbot-subtitle">Ask about Indian dishes</div>
        </div>
        <button
          className="chatbot-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 && (
          <div className="chatbot-welcome">
            <p>What are you craving? I can suggest the perfect Indian dish, or tell you the story behind one.</p>
            <div className="chatbot-suggestions">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  className="chatbot-suggestion"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chatbot-msg ${msg.role}`}>
            <div className="chatbot-msg-content">{msg.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="chatbot-msg assistant">
            <div className="chatbot-msg-content chatbot-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messageCount >= MAX_MESSAGES ? (
        <div className="chatbot-limit">
          You've reached the {MAX_MESSAGES}-message limit for this session.
        </div>
      ) : (
        <form className="chatbot-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chatbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe a craving or ask about a dish..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chatbot-send"
            disabled={!input.trim() || isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      )}
    </div>
  );
}

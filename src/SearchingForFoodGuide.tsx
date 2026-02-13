import { useState, useEffect, useRef } from 'react';
import './styles/searching-for-food.css';
import { ScrollySection } from './components/searchingForFood/ScrollySection';
import { ChapterTitle } from './components/searchingForFood/ChapterTitle';
import { ChapterDivider } from './components/searchingForFood/ChapterDivider';
import { BubbleChart } from './components/searchingForFood/visualizations/BubbleChart';
import { GeoStateMap } from './components/searchingForFood/visualizations/GeoStateMap';
import { RadialWeekChart } from './components/searchingForFood/visualizations/RadialWeekChart';
import { SeasonalLineChart } from './components/searchingForFood/visualizations/SeasonalLineChart';
import { DivergingBarChart } from './components/searchingForFood/visualizations/DivergingBarChart';
import { SmallMultiples } from './components/searchingForFood/visualizations/SmallMultiples';

const CHAPTERS = [
  { id: 'ch1', label: 'The Hook' },
  { id: 'ch2', label: 'Spice Map' },
  { id: 'ch3', label: 'Weekly' },
  { id: 'ch4', label: 'Festivals' },
  { id: 'ch5', label: 'The Gap' },
  { id: 'ch6', label: 'Pandemic' },
];

export function SearchingForFoodGuide() {
  const [activeChapter, setActiveChapter] = useState(0);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = chapterRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveChapter(idx);
          }
        });
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: 0 }
    );

    chapterRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const scrollToChapter = (idx: number) => {
    chapterRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="food-guide">
      {/* Chapter nav dots */}
      <nav className="chapter-nav">
        {CHAPTERS.map((ch, i) => (
          <button
            key={ch.id}
            className={`chapter-nav-dot ${i === activeChapter ? 'active' : ''}`}
            onClick={() => scrollToChapter(i)}
            title={ch.label}
            aria-label={`Go to ${ch.label}`}
          />
        ))}
      </nav>

      {/* Hero */}
      <header className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: 'url(/images/food-guide/hero-bg.jpg)' }}
        />

        {/* Large watercolor food illustrations at corners */}
        {[
          { dish: 'biryani', size: 220, top: '-2%', left: '-3%', delay: 0, rotate: -12 },
          { dish: 'dosa', size: 200, top: '-2%', right: '-3%', delay: 0.3, rotate: 10 },
          { dish: 'tandoori', size: 200, bottom: '-2%', left: '-2%', delay: 0.6, rotate: 8 },
          { dish: 'samosa', size: 190, bottom: '-2%', right: '-2%', delay: 0.9, rotate: -8 },
        ].map(({ dish, size, delay, rotate, ...pos }) => (
          <div
            key={dish}
            className="hero-dish-float"
            style={{
              width: size,
              height: size,
              ...pos,
              animationDelay: `${delay}s`,
              transform: `rotate(${rotate}deg)`,
            }}
          >
            <img
              src={`/images/food-guide/hero/${dish}.jpg`}
              alt=""
              loading="eager"
            />
          </div>
        ))}

        <h1>Searching for Food</h1>
        <p className="hero-meta">February 2026 &middot; 8 min read</p>
        <div className="hero-credits">
          <p style={{ marginBottom: '0.25rem' }}>
            An interactive story about what India searches for when it's hungry
          </p>
          <p style={{ color: '#80766b', fontSize: '0.85rem' }}>
            Built by <a href="https://soumyosinha.com" target="_blank" rel="noopener">Soumyo Sinha</a> &middot; Inspired by <a href="https://searchingforbirds.visualcinnamon.com/" target="_blank" rel="noopener">Searching for Birds</a> by Nadieh Bremer
          </p>
        </div>
      </header>

      {/* Intro prose */}
      <div className="content-col" style={{ marginBottom: '3rem' }}>
        <p>
          India is a country that thinks about food constantly. From the first morning chai to the
          last evening snack, food threads through every conversation, every festival, every family
          gathering. And increasingly, it threads through our search bars too.
        </p>
        <p>
          Google search data reveals which dishes capture our collective curiosity — and which ones
          we eat every day without a second thought. As you scroll through the following interactive
          graphics, you'll discover how roughly 30 iconic dishes reflect the culture, geography,
          and rhythms of a nation of 1.4 billion people.
        </p>
      </div>

      {/* Full-bleed watercolor thali illustration */}
      <div className="fullbleed-illustration">
        <img
          src="/images/food-guide/fullbleed-thali.jpg"
          alt="Watercolor illustration of an Indian thali"
          loading="eager"
        />
      </div>

      {/* Chapter 1: Everyone Loves Biryani */}
      <div ref={el => { chapterRefs.current[0] = el; }}>
        <ChapterTitle partNumber={1} title="Everyone Loves Biryani" id="ch1" />

        <div className="content-col" style={{ marginBottom: '2rem' }}>
          <p>
            It's not even close. Biryani is the most searched food in India — and has been for as
            long as Google Trends data exists. What's surprising is what comes next: roti, the
            humblest bread, is #2. If India's food identity had a single search ambassador, the
            data says it would be biryani. But the full picture tells a richer story.
          </p>
          <p>
            But beneath the biryani juggernaut lies a rich ecosystem of dishes that tell a more
            nuanced story. The bubbles below show the 20 most searched dishes in India, sized by
            their relative search interest over the past five years.
          </p>
        </div>

        <ScrollySection
          id="ch1-viz"
          steps={[
            {
              content: (
                <div>
                  <h3>The undisputed champion</h3>
                  <p>Biryani stands alone at the top. No other dish comes close to its search volume nationwide.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>The top five</h3>
                  <p>Roti, Dosa, Idli, and Momos round out the top five. The surprise? India's most basic everyday bread sits at #2 — people search to perfect what they eat daily. Dosa and idli represent the South; momos the Northeast and Delhi's street food scene.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>The full picture</h3>
                  <p>Twenty dishes that define India's search appetite. Jalebi at #6 is a surprise hit. Street food (Pani Puri, Pav Bhaji, Vada Pav) competes with comfort staples (Khichdi, Poha) and festival sweets (Gulab Jamun, Ladoo, Modak).</p>
                </div>
              ),
            },
          ]}
          visualization={(step) => <BubbleChart activeStep={step} />}
        />
      </div>

      {/* Watercolor: Spice market */}
      <div className="fullbleed-illustration">
        <img
          src="/images/food-guide/sections/spice-market.jpg"
          alt="Watercolor illustration of an Indian spice market"
          loading="lazy"
        />
      </div>

      {/* Chapter 2: The Spice Map */}
      <div ref={el => { chapterRefs.current[1] = el; }}>
        <ChapterTitle partNumber={2} title="The Spice Map" id="ch2" />

        <div className="content-col" style={{ marginBottom: '2rem' }}>
          <p>
            Here's the plot twist the data reveals: biryani isn't just #1 nationally — it
            dominates search in virtually every single state. From Kashmir to Kerala, Tamil Nadu
            to Tripura, biryani is the most searched dish. The regional food map isn't a patchwork
            of local champions — it's a biryani empire with fascinating runners-up.
          </p>
        </div>

        <ScrollySection
          id="ch2-viz"
          steps={[
            {
              content: (
                <div>
                  <h3>The biryani empire</h3>
                  <p>Each state is colored by its most-searched dish. Click any state to see the data. The map tells one overwhelming story: biryani rules everywhere. No other dish comes close at the state level.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>Total dominance</h3>
                  <p>Biryani claims the top spot in every state tracked — not just a belt, but a blanket. From Punjab (where butter chicken is the cultural icon) to Tamil Nadu (the homeland of dosa), people still search for biryani more than their own local specialties.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>The runners-up tell the real story</h3>
                  <p>Look at what's #2 and #3 in each state — that's where regional identity lives. Dosa as runner-up across the South. Chole Bhature in Delhi. Khichdi in Gujarat. Roti strong across the Hindi belt. Momos in Sikkim. The real diversity hides behind biryani's shadow.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>Why biryani wins search</h3>
                  <p>Biryani dominates search because it's complex to make at home — people need recipes. Nobody Googles how to make roti or dal. Search doesn't measure what people eat; it measures what they aspire to cook. Biryani is India's most aspirational dish.</p>
                </div>
              ),
            },
          ]}
          visualization={(step) => <GeoStateMap activeStep={step} />}
        />
      </div>

      {/* Photo strip: Street food */}
      <div className="photo-strip">
        <div className="photo-strip-item" style={{ backgroundImage: 'url(/images/food-guide/strip-samosa.jpg)' }} />
        <div className="photo-strip-item" style={{ backgroundImage: 'url(/images/food-guide/strip-idli.jpg)' }} />
        <div className="photo-strip-item" style={{ backgroundImage: 'url(/images/food-guide/strip-curry.jpg)' }} />
      </div>

      {/* Chapter 3: Sunday to Saturday */}
      <div ref={el => { chapterRefs.current[2] = el; }}>
        <ChapterDivider />
        <ChapterTitle partNumber={3} title="Sunday to Saturday" id="ch3" />

        <div className="content-col" style={{ marginBottom: '2rem' }}>
          <p>
            Indian food search follows a rhythmic weekly cycle that mirrors how the country
            actually eats. The workweek is fueled by quick staples; weekends are for indulgence.
          </p>
        </div>

        <ScrollySection
          id="ch3-viz"
          steps={[
            {
              content: (
                <div>
                  <h3>The weekly rhythm</h3>
                  <p>Each ring represents a different dish's search pattern across the seven days of the week. The distance from center shows relative search volume. Notice how the patterns differ — some dishes peak midweek, others on weekends.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>Sunday is biryani day</h3>
                  <p>Biryani searches spike dramatically on Sundays. It's the day Indian families have time to slow-cook, the day when biryani transforms from a craving into a project. Sunday lunch biryani is a national institution.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>Weekday staples</h3>
                  <p>Dal Rice peaks midweek on Wednesday — the point of maximum weekday fatigue. Samosa and Butter Chicken also peak on Thursdays, suggesting people plan their weekend indulgences a day early. The data reveals a nation that eats by the clock.</p>
                </div>
              ),
            },
          ]}
          visualization={(step) => <RadialWeekChart activeStep={step} />}
        />
      </div>

      {/* Watercolor: Dosa on the griddle */}
      <div className="fullbleed-illustration">
        <img
          src="/images/food-guide/sections/dosa-griddle.jpg"
          alt="Watercolor illustration of dosa being made on a griddle"
          loading="lazy"
        />
      </div>

      {/* Chapter 4: The Festival Effect */}
      <div ref={el => { chapterRefs.current[3] = el; }}>
        <ChapterTitle partNumber={4} title="The Festival Effect" id="ch4" />

        <div className="content-col" style={{ marginBottom: '2rem' }}>
          <p>
            India's festival calendar is written in search data. Nearly every major celebration
            has a signature dish, and the search spikes are dramatic — some dishes go from
            near-zero to peak popularity within a single week.
          </p>
        </div>

        <ScrollySection
          id="ch4-viz"
          steps={[
            {
              content: (
                <div>
                  <h3>Seasonal search patterns</h3>
                  <p>Each line tracks the monthly search volume for a festival-linked dish, averaged over five years. The peaks and valleys tell the story of India's culinary calendar.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>Modak and Ganesh Chaturthi</h3>
                  <p>Modak — Lord Ganesha's favorite sweet — goes from near-invisible to peak search in August/September. The spike is one of the sharpest in all food search data, concentrated almost entirely in Maharashtra.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>Diwali's sweet tooth</h3>
                  <p>Ladoo and Gulab Jamun searches build through September (Navratri) and peak in October/November (Diwali). The festival of lights is also the festival of sweets — and the search data proves it.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>Ramadan and biryani</h3>
                  <p>Haleem — a slow-cooked stew — spikes dramatically during Ramadan, particularly in Hyderabad. Biryani also sees a notable lift during the holy month, as iftar feasts drive search interest across the country.</p>
                </div>
              ),
            },
          ]}
          visualization={(step) => <SeasonalLineChart activeStep={step} />}
        />
      </div>

      {/* Watercolor: Festival sweets */}
      <div className="fullbleed-illustration">
        <img
          src="/images/food-guide/sections/festival-sweets.jpg"
          alt="Watercolor illustration of Indian festival sweets"
          loading="lazy"
        />
      </div>

      {/* Chapter 5: What We Search vs. What We Eat */}
      <div ref={el => { chapterRefs.current[4] = el; }}>
        <ChapterTitle partNumber={5} title="What We Search vs. What We Eat" id="ch5" />

        <div className="content-col" style={{ marginBottom: '2rem' }}>
          <p>
            There is a fascinating disconnect between what India searches for and what India
            actually eats. The most consumed foods in the country barely register on Google,
            while restaurant dishes and aspirational recipes dominate search.
          </p>
        </div>

        <ScrollySection
          id="ch5-viz"
          steps={[
            {
              content: (
                <div>
                  <h3>What we search for</h3>
                  <p>The left bars show Google search ranking. Biryani, Roti, and Dosa lead — a mix of aspiration and daily need. Roti at #2 is the great surprise: the most basic food is also the most searched after biryani.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>What we actually eat</h3>
                  <p>The right bars show estimated daily consumption ranking. Dal Rice, Roti, and Khichdi — the invisible backbone of Indian cuisine — top the list. Nobody Googles what they eat every single day.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>The gap</h3>
                  <p>The highlighted rows show the biggest disconnects. Masala Chai is consumed billions of times daily but barely searched. Butter Chicken is everyone's search fantasy but rarely cooked at home. Search reveals aspiration; consumption reveals habit.</p>
                </div>
              ),
            },
          ]}
          visualization={(step) => <DivergingBarChart activeStep={step} />}
        />
      </div>

      {/* Watercolor: Dal and rice */}
      <div className="fullbleed-illustration">
        <img
          src="/images/food-guide/sections/dal-rice-comfort.jpg"
          alt="Watercolor illustration of dal and rice"
          loading="lazy"
        />
      </div>

      {/* Chapter 6: Paying Attention */}
      <div ref={el => { chapterRefs.current[5] = el; }}>
        <ChapterTitle partNumber={6} title="Paying Attention" id="ch6" />

        <div className="content-col" style={{ marginBottom: '2rem' }}>
          <p>
            The pandemic changed how India searched for food. Locked indoors, people turned to
            their kitchens — and their search bars — with a new intensity. Some dishes surged
            as comfort food; others fell as street food became inaccessible.
          </p>
        </div>

        <ScrollySection
          id="ch6-viz"
          steps={[
            {
              content: (
                <div>
                  <h3>Before the pandemic</h3>
                  <p>The dashed lines show 2019 search patterns — the "normal" baseline. Each small chart tracks a different dish through the twelve months of the year.</p>
                </div>
              ),
            },
            {
              content: (
                <div>
                  <h3>The pandemic shift</h3>
                  <p>The solid lines show 2021. Masala Chai (+44%) and Dal Rice (+36%) saw the biggest surges — the comforts of home when home was all you had. Khichdi (-27%) and Samosa (-16%) actually fell. The pandemic didn't uniformly boost home cooking — it reshaped what people craved most.</p>
                </div>
              ),
            },
          ]}
          visualization={(step) => <SmallMultiples activeStep={step} />}
        />
      </div>

      {/* Watercolor: Indian feast spread */}
      <div className="fullbleed-illustration">
        <img
          src="/images/food-guide/sections/thali-spread.jpg"
          alt="Watercolor illustration of an Indian feast spread"
          loading="lazy"
        />
      </div>

      {/* Conclusion */}
      <div className="content-col" style={{ padding: '4rem 1.5rem' }}>
        <p>
          Food search data is a mirror — not of what India eats, but of what India <em>aspires</em> to eat,
          what it celebrates, what it misses when it's away from home. Behind every search query is a
          person standing in their kitchen, wondering how to make the biryani their grandmother made,
          or trying dosa for the first time, or looking up the perfect ladoo recipe before Diwali.
        </p>
        <p>
          The next time you search for a recipe, remember: you're adding your own data point to a
          story that 1.4 billion people are writing together, one search at a time.
        </p>
      </div>

      {/* Share section */}
      <div className="food-share-section">
        <p className="food-share-label">Share this story</p>
        <div className="food-share-buttons">
          <a
            className="food-share-btn"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Searching for Food — an interactive story about what India searches for when it\'s hungry')}&url=${encodeURIComponent('https://howindiaeats.soumyosinha.com')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a
            className="food-share-btn"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://howindiaeats.soumyosinha.com')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <button
            className="food-share-btn"
            onClick={() => {
              navigator.clipboard.writeText('https://howindiaeats.soumyosinha.com');
            }}
            aria-label="Copy link"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="food-footer">
        <div className="food-footer-methodology">
          <h3>Methodology</h3>
          <p>
            Search data pulled from Google Trends via pytrends (India, 5-year average, accessed
            February 2026). Each dish compared head-to-head with biryani as the anchor term.
            State-level data uses interest_by_region with the same methodology. Consumption
            rankings estimated from NSSO 68th round household expenditure surveys and ICMR-NIN
            dietary guidelines. Pandemic comparison uses 2019 vs 2021 data within a single
            2018–2022 query for consistent normalization.
          </p>
        </div>

        <div className="food-footer-credits">
          <div className="food-footer-credit-row">
            <span className="food-footer-credit-label">Design &amp; Development</span>
            <a href="https://soumyosinha.com">Soumyo Sinha</a>
          </div>
          <div className="food-footer-credit-row">
            <span className="food-footer-credit-label">Inspired by</span>
            <a href="https://searchingforbirds.visualcinnamon.com/" target="_blank" rel="noopener noreferrer">
              Searching for Birds
            </a>
            <span> by Nadieh Bremer</span>
          </div>
          <div className="food-footer-credit-row">
            <span className="food-footer-credit-label">Built with</span>
            <span>React, D3.js, TypeScript, Vite</span>
          </div>
          <div className="food-footer-credit-row">
            <span className="food-footer-credit-label">Illustrations</span>
            <span>Watercolor art generated with Gemini</span>
          </div>
        </div>

        <p className="food-footer-copyright">
          &copy; 2026 Soumyo Sinha
        </p>
      </footer>
    </div>
  );
}

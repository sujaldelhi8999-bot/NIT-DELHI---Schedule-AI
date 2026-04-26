/* ==================================================
   AI-ASSISTANT.JS — Claude-powered AI features for ScheduleAI
   
   Three capabilities:
   1. AI Conflict Explainer  — plain-English conflict analysis + fix suggestions
   2. AI Schedule Optimizer  — health score → actionable improvement plan
   3. AI Timetable Chat      — natural-language Q&A about the schedule
   ================================================== */

const AIAssistant = (() => {

  /* ─────────────────────────────────────────────────
   * CORE: Claude API caller
   * ───────────────────────────────────────────────── */
  async function callClaude(systemPrompt, userMessage, maxTokens = 800) {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      return data.content?.find(b => b.type === 'text')?.text || '';
    } catch (err) {
      throw new Error('Could not reach AI: ' + err.message);
    }
  }

  /* ─────────────────────────────────────────────────
   * CONTEXT BUILDER — serialise current schedule state
   * ───────────────────────────────────────────────── */
  function buildContext() {
    const settings  = Store.getSettings();
    const courses   = Store.courses.getAll();
    const sections  = Store.sections.getAll();
    const faculty   = Store.faculty.getAll();
    const rooms     = Store.rooms.getAll();
    const timetable = Store.getTimetable();
    const conflicts = Store.getConflicts();

    // Summarise timetable into readable text
    const ttSummary = timetable
      ? Object.entries(timetable).map(([day, entries]) => {
          if (!entries.length) return `${day}: (empty)`;
          const lines = entries.map(e => {
            const slot = Store.computeTimeSlots()[e.slotIdx];
            const secNames = e.sectionIds.map(id => sections.find(s => s.id === id)?.name || id).join('+');
            return `  • ${slot?.start || '?'} | ${e.courseName} (${e.type}) | ${secNames} | ${e.facultyName} | Room: ${e.roomName}`;
          });
          return `${day}:\n${lines.join('\n')}`;
        }).join('\n\n')
      : 'No timetable generated yet.';

    return {
      settings,
      courseSummary: courses.map(c => `${c.name} (${c.code}): ${c.theoryHours}h theory, ${c.labHours}h lab`).join('; '),
      sectionSummary: sections.map(s => `${s.name} (${s.studentCount} students)`).join('; '),
      facultySummary: faculty.map(f => `${f.name} → ${courses.find(c=>c.id===f.courseId)?.name||'?'}`).join('; '),
      roomSummary: rooms.map(r => `${r.name} (cap ${r.capacity}, ${r.type})`).join('; '),
      ttSummary,
      conflictSummary: conflicts.length
        ? conflicts.map(c => `[${c.type.toUpperCase()}] ${c.message}`).join('\n')
        : 'No conflicts.',
      conflictCount: conflicts.length,
    };
  }

  /* ─────────────────────────────────────────────────
   * FEATURE 1: CONFLICT EXPLAINER
   * ───────────────────────────────────────────────── */
  async function explainConflicts() {
    const ctx = buildContext();
    if (ctx.conflictCount === 0) {
      return '✅ No conflicts found in the current timetable — everything is placed correctly!';
    }

    const system = `You are a scheduling expert assistant for an academic timetable system called ScheduleAI.
Your job is to explain scheduling conflicts in plain, friendly English and suggest concrete fixes.
Be concise. Use bullet points. Avoid jargon. Speak directly to the admin.`;

    const user = `Here is the scheduling context:

COURSES: ${ctx.courseSummary}
SECTIONS: ${ctx.sectionSummary}
FACULTY: ${ctx.facultySummary}
ROOMS: ${ctx.roomSummary}
DAYS/TIMES: ${ctx.settings.daysOfWeek?.join(', ')} | ${ctx.settings.startTime}–${ctx.settings.endTime} | ${ctx.settings.periodDuration}min periods

CONFLICTS & WARNINGS:
${ctx.conflictSummary}

Please:
1. Explain WHY each conflict is happening in simple terms (1 sentence each)
2. Give 2–4 concrete, actionable suggestions to resolve them (add a room, split a combined class, adjust faculty, etc.)
Keep your total response under 300 words.`;

    return callClaude(system, user, 600);
  }

  /* ─────────────────────────────────────────────────
   * FEATURE 2: SCHEDULE OPTIMIZER
   * ───────────────────────────────────────────────── */
  async function suggestOptimizations() {
    const ctx = buildContext();
    const timetable = Store.getTimetable();
    const genStats  = JSON.parse(localStorage.getItem('tt_last_stats') || 'null');
    const health    = timetable ? HealthScore.compute(timetable, genStats) : null;

    const healthText = health
      ? `Overall: ${health.pct}/100 (Grade ${health.grade})\n` +
        health.categories.map(c => `  • ${c.label}: ${c.score}/${c.max} — ${c.detail}`).join('\n')
      : 'No health score available (generate a timetable first).';

    const system = `You are a scheduling optimization expert for an academic institution.
You will analyze a timetable health score breakdown and the current schedule, then produce a prioritized action plan.
Be specific, practical, and direct. Use numbered priorities. Total response under 350 words.`;

    const user = `TIMETABLE HEALTH SCORE:
${healthText}

CURRENT SETUP:
Courses: ${ctx.courseSummary}
Sections: ${ctx.sectionSummary}
Faculty: ${ctx.facultySummary}
Rooms: ${ctx.roomSummary}
Working hours: ${ctx.settings.startTime}–${ctx.settings.endTime}, ${ctx.settings.periodDuration}min periods
Days: ${ctx.settings.daysOfWeek?.join(', ')}

TIMETABLE SNAPSHOT:
${ctx.ttSummary.slice(0, 3000)}

Please provide:
1. The TOP 3 improvements to make (ordered by impact on score)
2. For each: what to change + why it helps
3. One "quick win" that could be done immediately
Be specific — mention actual course names, faculty, or rooms where relevant.`;

    return callClaude(system, user, 700);
  }

  /* ─────────────────────────────────────────────────
   * FEATURE 3: TIMETABLE CHAT (multi-turn)
   * ───────────────────────────────────────────────── */
  const chatHistory = [];

  function resetChat() { chatHistory.length = 0; }

  async function chat(userMessage) {
    const ctx = buildContext();

    const system = `You are ScheduleAI Assistant, a helpful scheduling expert embedded in an academic timetable app.
You have full knowledge of the current schedule and can answer questions about it naturally and concisely.
Answer based only on the data provided. If something isn't in the data, say so.
Keep answers brief (1–4 sentences) unless a longer list is genuinely needed.

CURRENT TIMETABLE DATA:
Courses: ${ctx.courseSummary}
Sections: ${ctx.sectionSummary}
Faculty: ${ctx.facultySummary}
Rooms: ${ctx.roomSummary}
Days: ${ctx.settings.daysOfWeek?.join(', ')} | ${ctx.settings.startTime}–${ctx.settings.endTime}

FULL SCHEDULE:
${ctx.ttSummary.slice(0, 4000)}

CONFLICTS: ${ctx.conflictSummary}`;

    // Build message array with history
    const messages = [
      ...chatHistory,
      { role: 'user', content: userMessage }
    ];

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system,
          messages,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      const reply = data.content?.find(b => b.type === 'text')?.text || '';

      // Append to history (keep last 10 turns to stay within context)
      chatHistory.push({ role: 'user', content: userMessage });
      chatHistory.push({ role: 'assistant', content: reply });
      if (chatHistory.length > 20) chatHistory.splice(0, 2);

      return reply;
    } catch (err) {
      throw new Error('Could not reach AI: ' + err.message);
    }
  }

  /* ─────────────────────────────────────────────────
   * UI: RENDER THE AI ASSISTANT PANEL
   * ───────────────────────────────────────────────── */
  function renderPanel() {
    return `
      <div class="ai-assistant-panel">

        <!-- Tab Bar -->
        <div class="ai-tabs">
          <button class="ai-tab active" data-tab="conflicts">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            Conflict Explainer
          </button>
          <button class="ai-tab" data-tab="optimizer">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Optimizer
          </button>
          <button class="ai-tab" data-tab="chat">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            Ask AI
          </button>
        </div>

        <!-- Conflict Explainer Tab -->
        <div class="ai-tab-content active" id="ai-tab-conflicts">
          <p class="ai-description">AI will read your conflict log and explain what went wrong — and how to fix it.</p>
          <button class="btn btn-primary ai-run-btn" id="btnExplainConflicts">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Explain My Conflicts
          </button>
          <div class="ai-output" id="conflictExplainerOutput"></div>
        </div>

        <!-- Optimizer Tab -->
        <div class="ai-tab-content" id="ai-tab-optimizer">
          <p class="ai-description">AI will analyse your health score and timetable, then give you a prioritised action plan to improve it.</p>
          <button class="btn btn-primary ai-run-btn" id="btnOptimize">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Generate Optimization Plan
          </button>
          <div class="ai-output" id="optimizerOutput"></div>
        </div>

        <!-- Chat Tab -->
        <div class="ai-tab-content" id="ai-tab-chat">
          <p class="ai-description">Ask anything about your schedule in plain English.</p>
          <div class="ai-chat-window" id="aiChatWindow">
            <div class="ai-chat-bubble assistant">
              👋 Hi! I can answer questions about your timetable. Try asking:<br>
              <em>"Which faculty has the most classes?"</em><br>
              <em>"Does Section A have any free periods on Friday?"</em><br>
              <em>"Which rooms are underutilized?"</em>
            </div>
          </div>
          <div class="ai-chat-input-row">
            <input
              type="text"
              id="aiChatInput"
              class="ai-chat-input"
              placeholder="Ask about your schedule…"
              autocomplete="off"
            />
            <button class="btn btn-primary" id="btnAiChat">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
          <button class="btn btn-outline" id="btnClearChat" style="margin-top:8px;font-size:.75rem;padding:4px 10px">Clear chat</button>
        </div>

      </div>
    `;
  }

  /* ─────────────────────────────────────────────────
   * UI: WIRE UP EVENTS (called after renderPanel() is in DOM)
   * ───────────────────────────────────────────────── */
  function attachEvents() {
    // Tab switching
    document.querySelectorAll('.ai-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.ai-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`ai-tab-${tab.dataset.tab}`)?.classList.add('active');
      });
    });

    // Conflict Explainer
    document.getElementById('btnExplainConflicts')?.addEventListener('click', async () => {
      const out = document.getElementById('conflictExplainerOutput');
      setLoading(out, 'Analysing conflicts…');
      const btn = document.getElementById('btnExplainConflicts');
      btn.disabled = true;
      try {
        const result = await explainConflicts();
        out.innerHTML = formatMarkdown(result);
      } catch (e) {
        out.innerHTML = `<span style="color:var(--danger)">Error: ${e.message}</span>`;
      } finally {
        btn.disabled = false;
      }
    });

    // Optimizer
    document.getElementById('btnOptimize')?.addEventListener('click', async () => {
      const out = document.getElementById('optimizerOutput');
      setLoading(out, 'Analysing your schedule…');
      const btn = document.getElementById('btnOptimize');
      btn.disabled = true;
      try {
        const result = await suggestOptimizations();
        out.innerHTML = formatMarkdown(result);
      } catch (e) {
        out.innerHTML = `<span style="color:var(--danger)">Error: ${e.message}</span>`;
      } finally {
        btn.disabled = false;
      }
    });

    // Chat — send on button click or Enter
    const sendChat = async () => {
      const input = document.getElementById('aiChatInput');
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';

      const window_ = document.getElementById('aiChatWindow');
      appendChatBubble(window_, msg, 'user');
      const loadingEl = appendChatBubble(window_, '…', 'assistant loading');
      const sendBtn = document.getElementById('btnAiChat');
      sendBtn.disabled = true;

      try {
        const reply = await chat(msg);
        loadingEl.innerHTML = formatMarkdown(reply);
        loadingEl.classList.remove('loading');
      } catch (e) {
        loadingEl.innerHTML = `<span style="color:var(--danger)">Error: ${e.message}</span>`;
        loadingEl.classList.remove('loading');
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    };

    document.getElementById('btnAiChat')?.addEventListener('click', sendChat);
    document.getElementById('aiChatInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
    });

    // Clear chat
    document.getElementById('btnClearChat')?.addEventListener('click', () => {
      resetChat();
      const window_ = document.getElementById('aiChatWindow');
      window_.innerHTML = `<div class="ai-chat-bubble assistant">Chat cleared. What would you like to know?</div>`;
    });
  }

  /* ─────────────────────────────────────────────────
   * UI HELPERS
   * ───────────────────────────────────────────────── */
  function setLoading(el, msg) {
    el.innerHTML = `
      <div class="ai-loading">
        <div class="ai-spinner"></div>
        <span>${msg}</span>
      </div>`;
  }

  function appendChatBubble(container, text, role) {
    const el = document.createElement('div');
    el.className = `ai-chat-bubble ${role}`;
    el.innerHTML = formatMarkdown(text);
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
  }

  // Minimal markdown → HTML (bold, bullets, numbered lists, line breaks)
  function formatMarkdown(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h4 style="margin:.5em 0 .2em;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted)">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 style="margin:.6em 0 .3em;font-size:.95rem">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 style="margin:.7em 0 .3em;font-size:1.05rem">$1</h2>')
      .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:1.1em;list-style:decimal">$1</li>')
      .replace(/^[-•] (.+)$/gm, '<li style="margin-left:1.1em;list-style:disc">$1</li>')
      .replace(/\n/g, '<br>');
  }

  /* ─────────────────────────────────────────────────
   * PUBLIC API
   * ───────────────────────────────────────────────── */
  return {
    renderPanel,
    attachEvents,
    explainConflicts,
    suggestOptimizations,
    chat,
    resetChat,
  };
})();

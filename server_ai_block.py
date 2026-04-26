# ═══════════════════════════════════════════════
# AI PROXY — forwards requests to OpenRouter
# ═══════════════════════════════════════════════
import urllib.request

@app.route("/api/ai/chat", methods=["POST"])
@token_required
def api_ai_chat(current_user):
    """Proxy AI calls through OpenRouter so the API key stays server-side."""
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        return jsonify({"error": "OPENROUTER_API_KEY not set on server"}), 500

    body = request.json or {}

    # Build OpenAI-compatible messages (OpenRouter uses OpenAI format)
    messages = []
    if "system" in body:
        messages.append({"role": "system", "content": str(body["system"])[:8000]})
    for m in body.get("messages", []):
        messages.append({"role": m["role"], "content": m["content"]})

    payload = {
        "model": "mistralai/mistral-7b-instruct:free",
        "max_tokens": min(int(body.get("max_tokens", 800)), 2000),
        "messages": messages,
    }

    try:
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "ScheduleAI",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        # Convert OpenAI response format → Anthropic format so frontend works unchanged
        text = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        return jsonify({"content": [{"type": "text", "text": text}]})

    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        return jsonify({"error": f"OpenRouter API error {e.code}: {err_body}"}), 502
    except Exception as ex:
        return jsonify({"error": str(ex)}), 502

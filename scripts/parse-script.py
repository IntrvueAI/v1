#!/usr/bin/env python3
"""
Convert a "Version 2/3" interview script (.md) into the engine's question-bank JSON.

The maths/logic/current-affairs scripts all share one template — six labelled parts per question —
so this parser maps them into BankQuestion JSON. Run:
    python3 scripts/parse-script.py maths
    python3 scripts/parse-script.py currentaffairs
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

SUBJECTS = {
    "maths": {
        "file": "interview-scripts/maths/Mathematical Thinking Script.md",
        "prefix": "MA",
        "out": "src/interview/bank/questions/maths",
        "discussion": False,
        "sections": {"A": "numerical-reasoning", "B": "estimation",
                     "C": "structured-problem-solving", "D": "pattern-proof-explanation"},
    },
    "currentaffairs": {
        "file": "interview-scripts/current-affairs/Current Affairs & Moral Script.md",
        "prefix": "CA",
        "out": "src/interview/bank/questions/currentaffairs",
        "discussion": True,
        "sections": {"A": "current-news", "B": "technology-ai", "C": "climate-environment",
                     "D": "moral-dilemmas", "E": "society-rights-fairness"},
    },
}

# Part labels → canonical key (first match wins; order matters for overlaps).
LABELS = [
    ("answer", ["Final answer"]),
    ("reasoning", ["Model reasoning path", "What a strong answer involves"]),
    ("rubric", ["Scoring rubric"]),
    ("mistakes", ["Common mistakes", "Common weak patterns"]),
    ("probes", ["Live probes / pushback", "Live probes"]),
    ("hints", ["Hints if stuck", "If the child is stuck"]),
]

def clean(t: str) -> str:
    t = t.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    t = t.replace("—", "-").replace("–", "-")
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t)   # bold
    t = re.sub(r"(?<!\w)\*(.+?)\*(?!\w)", r"\1", t)  # italic
    return t.strip()

def label_of(line: str):
    if not line.startswith("**"):
        return None
    for key, names in LABELS:
        for n in names:
            if line.startswith("**" + n):
                return key
    return None

def collapse(lines):
    return clean(" ".join(l.strip() for l in lines)).strip()

def parse_rubric(text):
    out = {}
    for band, key in (("Strong", "strong"), ("Developing", "developing"), ("Weak", "weak")):
        m = re.search(rf"{band}\*\*?\s*[-—–:]\s*(.*?)(?=(?:- )?\*\*?(?:Strong|Developing|Weak)\*\*|$)",
                      text, re.S)
        out[key] = clean(m.group(1)) if m else ""
    return out

def split_bullets(lines):
    """Group a bullet list (lines starting with '- ') into individual bullet strings."""
    bullets, cur = [], []
    for l in lines:
        s = l.strip()
        if s.startswith("- "):
            if cur:
                bullets.append(" ".join(cur))
            cur = [s[2:]]
        elif s and cur:
            cur.append(s)
    if cur:
        bullets.append(" ".join(cur))
    return [clean(b) for b in bullets if clean(b)]

def split_numbered(lines):
    items, cur = [], []
    for l in lines:
        s = l.strip()
        if re.match(r"^\d+\.\s", s):
            if cur:
                items.append(" ".join(cur))
            cur = [re.sub(r"^\d+\.\s", "", s)]
        elif s and cur:
            cur.append(s)
    if cur:
        items.append(" ".join(cur))
    return [clean(i) for i in items if clean(i)]

def to_mistakes(bullets):
    out = []
    for b in bullets:
        if " - " in b:
            mistake, reveals = b.split(" - ", 1)
        else:
            mistake, reveals = b, "what this reveals about their thinking"
        out.append({"mistake": mistake.strip(), "reveals": reveals.strip()})
    return out

def to_probes(bullets):
    out = []
    for b in bullets:
        m = re.search(r"\((.*?)\)\s*$", b)
        good = m.group(1).strip() if m else "engages thoughtfully and gives a reasoned response"
        probe = re.sub(r"\s*\(.*?\)\s*$", "", b).strip().strip('"')
        if probe:
            out.append({"probe": probe, "goodResponse": good})
    return out

def parse(subject):
    cfg = SUBJECTS[subject]
    text = (ROOT / cfg["file"]).read_text(encoding="utf-8")
    lines = text.split("\n")

    questions, section = [], None
    i = 0
    while i < len(lines):
        line = lines[i]
        sm = re.match(r"^## SECTION ([A-E]) ", line)
        if sm:
            section = sm.group(1)
        qm = re.match(r"^### ([A-E]\d+)\s*[-—]\s*(.*)", line)
        if qm:
            qid, title = qm.group(1), clean(qm.group(2))
            # collect block lines until next ### or ## or EOF
            j = i + 1
            block = []
            while j < len(lines) and not re.match(r"^#{2,3} ", lines[j]):
                block.append(lines[j]); j += 1
            questions.append(parse_block(cfg, section, qid, title, block))
            i = j; continue
        i += 1
    return cfg, questions

def parse_block(cfg, section, qid, title, block):
    # question = blockquote lines before the first labelled part
    qlines, parts, cur_key, idx = [], {}, None, 0
    for l in block:
        key = label_of(l)
        if key:
            cur_key = key
            # strip the label prefix from the first line
            rest = re.sub(r"^\*\*[^*]+\*\*:?\s*", "", l)
            parts[cur_key] = [rest] if rest.strip() else []
        elif cur_key:
            if l.strip() == "---":
                cur_key = None
            else:
                parts[cur_key].append(l)
        else:
            if l.strip().startswith(">"):
                qlines.append(l.strip().lstrip(">").strip())
    question = clean(" ".join(qlines)).strip().strip('"')

    topic = cfg["sections"][section]
    q = {
        "id": f"{cfg['prefix']}-{qid}",
        "subject": "currentaffairs" if cfg["prefix"] == "CA" else "maths",
        "topic": topic,
        "difficulty": "standard",
        "question": question,
        "answer": clean(" ".join(parts.get("answer", []))) or
                  ("Open discussion - there is no single right answer; score the quality of reasoning." if cfg["discussion"] else ""),
        "modelReasoningPath": collapse(parts.get("reasoning", [])),
        "rubric": parse_rubric(" ".join(parts.get("rubric", []))),
        "commonMistakes": to_mistakes(split_bullets(parts.get("mistakes", []))),
        "liveProbes": to_probes(split_bullets(parts.get("probes", []))),
        "hints": split_numbered(parts.get("hints", [])),
    }
    if not q["answer"]:
        q["answer"] = "(no single answer)"
    return q

def main():
    subject = sys.argv[1]
    cfg, questions = parse(subject)
    by_topic = {}
    for q in questions:
        by_topic.setdefault(q["topic"], []).append(q)
    outdir = ROOT / cfg["out"]
    if outdir.exists():
        import shutil; shutil.rmtree(outdir)
    for topic, items in by_topic.items():
        d = outdir / topic
        d.mkdir(parents=True, exist_ok=True)
        (d / "standard.json").write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n")
    print(f"{subject}: {len(questions)} questions across {len(by_topic)} topics -> {cfg['out']}")
    # print one sample for validation
    s = questions[0]
    print("\n=== SAMPLE:", s["id"], "===")
    print(json.dumps(s, indent=2, ensure_ascii=False)[:1600])

if __name__ == "__main__":
    main()

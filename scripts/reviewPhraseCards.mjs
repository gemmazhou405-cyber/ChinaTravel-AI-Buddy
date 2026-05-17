import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCENES = ['airport','train','hotel','payment','shopping','lostItems','restaurant','emergency'];
const DATA_DIR = path.join(__dirname, '../src/data/phraseCards');
const REPORT_DIR = path.join(__dirname, 'reports');
const REPORT_PATH = path.join(REPORT_DIR, 'phraseCardsReview.md');

const EN_RISK_WORDS = ['guarantee','official service','visa service','immigration advice','legal advice','diagnosis','prescription'];
const ZH_RISK_WORDS = ['保证','官方代办','签证代办','法律建议','诊断','处方'];
const MAX_CHINESE_LEN = 30;
const MAX_ENGLISH_LEN = 80;
const MAX_USAGE_LEN = 100;

function reviewCard(card, scene, index) {
  const issues = [];
  const expectedId = `${scene}_${String(index + 1).padStart(3, '0')}`;

  if (card.id !== expectedId) issues.push(`id应为${expectedId}，实际为${card.id}`);
  if (card.scene !== scene) issues.push(`scene应为${scene}，实际为${card.scene}`);
  if (card.audioText !== card.chinese) issues.push(`audioText与chinese不一致`);
  if (!card.tags || card.tags.length === 0) issues.push(`tags为空`);
  if (card.chinese && card.chinese.length > MAX_CHINESE_LEN) issues.push(`chinese过长(${card.chinese.length}字符，建议<${MAX_CHINESE_LEN})`);
  if (card.english && card.english.length > MAX_ENGLISH_LEN) issues.push(`english过长(${card.english.length}字符，建议<${MAX_ENGLISH_LEN})`);
  if (card.usageNote && card.usageNote.length > MAX_USAGE_LEN) issues.push(`usageNote过长(${card.usageNote.length}字符，建议<${MAX_USAGE_LEN})`);

  EN_RISK_WORDS.forEach(word => {
    const text = `${card.english} ${card.usageNote}`.toLowerCase();
    if (text.includes(word)) issues.push(`包含高风险词："${word}"`);
  });

  ZH_RISK_WORDS.forEach(word => {
    if (card.chinese && card.chinese.includes(word)) issues.push(`中文包含高风险词："${word}"`);
  });

  if ((scene === 'airport') && card.chinese) {
    const badPatterns = ['建议移民官','移民局应该','海关规定必须','你必须'];
    badPatterns.forEach(p => {
      if (card.chinese.includes(p)) issues.push(`airport场景不应包含："${p}"，只保留游客自述`);
    });
  }

  if ((scene === 'emergency') && card.chinese) {
    const badPatterns = ['诊断为','治疗方案','服用','药物'];
    badPatterns.forEach(p => {
      if (card.chinese.includes(p)) issues.push(`emergency场景不应包含："${p}"`);
    });
  }

  return issues;
}

function reviewFile(scene) {
  const filePath = path.join(DATA_DIR, `${scene}.json`);
  if (!fs.existsSync(filePath)) {
    return { scene, error: '文件不存在', total: 0, passed: 0, flagged: [] };
  }

  let cards;
  try {
    cards = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return { scene, error: `JSON解析失败: ${e.message}`, total: 0, passed: 0, flagged: [] };
  }

  if (!Array.isArray(cards)) {
    return { scene, error: '不是数组', total: 0, passed: 0, flagged: [] };
  }

  const flagged = [];
  cards.forEach((card, i) => {
    const issues = reviewCard(card, scene, i);
    if (issues.length > 0) {
      flagged.push({ id: card.id || `${scene}_${i+1}`, issues });
    }
  });

  return {
    scene,
    total: cards.length,
    passed: cards.length - flagged.length,
    flagged,
  };
}

function buildReport(results) {
  const lines = [];
  const now = new Date().toISOString();

  lines.push(`# Phrase Cards Review Report`);
  lines.push(`Generated: ${now}\n`);

  let totalCards = 0;
  let totalPassed = 0;
  let totalFlagged = 0;

  results.forEach(r => {
    totalCards += r.total || 0;
    totalPassed += r.passed || 0;
    totalFlagged += r.flagged?.length || 0;
  });

  lines.push(`## Summary`);
  lines.push(`- Total scenes: ${results.length}`);
  lines.push(`- Total cards: ${totalCards}`);
  lines.push(`- Passed: ${totalPassed}`);
  lines.push(`- Needs review: ${totalFlagged}\n`);

  results.forEach(r => {
    lines.push(`---\n`);
    lines.push(`## ${r.scene}`);

    if (r.error) {
      lines.push(`❌ Error: ${r.error}\n`);
      return;
    }

    lines.push(`- Total: ${r.total}`);
    lines.push(`- Passed: ${r.passed}`);
    lines.push(`- Needs review: ${r.flagged.length}\n`);

    if (r.flagged.length === 0) {
      lines.push(`✅ All cards passed review.\n`);
    } else {
      r.flagged.forEach(f => {
        lines.push(`### ${f.id}`);
        f.issues.forEach(issue => lines.push(`- ⚠️ ${issue}`));
        lines.push('');
      });
    }
  });

  return lines.join('\n');
}

async function main() {
  console.log('Running Phrase Cards Review...\n');

  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

  const results = SCENES.map(scene => {
    const result = reviewFile(scene);
    const status = result.error ? '❌' : result.flagged.length === 0 ? '✅' : '⚠️';
    console.log(`${status} ${scene}: ${result.total} cards, ${result.flagged?.length || 0} flagged`);
    return result;
  });

  const report = buildReport(results);
  fs.writeFileSync(REPORT_PATH, report, 'utf-8');

  console.log(`\nReport saved: scripts/reports/phraseCardsReview.md`);
}

main();

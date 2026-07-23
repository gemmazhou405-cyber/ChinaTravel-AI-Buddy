// Automated tests for worker.js FAQ and topic-matching logic.
// Run: node scripts/test-worker-faq.mjs

import { __test__ } from '../worker.js';

const {
  detectChineseLanguage,
  matchFaq,
  getFaqAnswer,
  FAQ_RULES,
  FAQ_ANSWERS,
  VERIFIED_GUIDES,
  matchesTopics,
  buildDeepSeekMessages,
} = __test__;

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
  }
}

function assertEq(label, actual, expected) {
  if (actual === expected) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${JSON.stringify(expected)}`);
    console.error(`        actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

function assertNotContains(label, text, forbidden) {
  if (!text.includes(forbidden)) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label} — should not contain: ${JSON.stringify(forbidden)}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// detectChineseLanguage
// ---------------------------------------------------------------------------
console.log('\n=== detectChineseLanguage ===');
assert('detects Chinese', detectChineseLanguage('支付宝认证多久'));
assert('detects Chinese in mixed text', detectChineseLanguage('my question 认证多久'));
assert('false for pure English', !detectChineseLanguage('how long does passport verification take'));
assert('false for empty string', !detectChineseLanguage(''));
assert('false for numbers and punctuation', !detectChineseLanguage('123 !?'));

// ---------------------------------------------------------------------------
// matchFaq — should match
// ---------------------------------------------------------------------------
console.log('\n=== matchFaq (should match) ===');

// passportVerification
assertEq('passport verification (EN)', matchFaq('How long does passport verification take?'), 'passportVerification');
assertEq('identity verification time (EN)', matchFaq('What is the identity verification time?'), 'passportVerification');
assertEq('verification time (EN)', matchFaq('verification time for alipay'), 'passportVerification');
assertEq('verification pending (EN)', matchFaq('My verification is pending'), 'passportVerification');
assertEq('实名认证多久 (ZH)', matchFaq('实名认证多久能完成？'), 'passportVerification');
assertEq('护照认证多久 (ZH)', matchFaq('护照认证多久'), 'passportVerification');
assertEq('支付宝认证时间 (ZH)', matchFaq('支付宝认证时间要多长'), 'passportVerification');
assertEq('身份认证一直审核中 (ZH)', matchFaq('身份认证一直审核中怎么办'), 'passportVerification');
assertEq('身份认证多久 (ZH)', matchFaq('身份认证多久能通过'), 'passportVerification');
assertEq('认证多久 (ZH)', matchFaq('认证多久'), 'passportVerification');
assertEq('case-insensitive', matchFaq('PASSPORT VERIFICATION status'), 'passportVerification');

// tourPass
assertEq('tour pass (EN)', matchFaq('Can I use Alipay Tour Pass?'), 'tourPass');
assertEq('alipay tour (EN)', matchFaq('Is alipay tour still available?'), 'tourPass');
assertEq('支付宝国际版 (ZH)', matchFaq('支付宝国际版怎么用？'), 'tourPass');

// overseasCardFees
assertEq('alipay fee (EN)', matchFaq('What is the alipay fee for overseas cards?'), 'overseasCardFees');
assertEq('alipay service fee (EN)', matchFaq('Is there an alipay service fee?'), 'overseasCardFees');
assertEq('overseas card fee (EN)', matchFaq('overseas card fee when using alipay'), 'overseasCardFees');
assertEq('foreign card fee (EN)', matchFaq('foreign card fee'), 'overseasCardFees');
assertEq('支付宝手续费 (ZH)', matchFaq('支付宝手续费是多少？'), 'overseasCardFees');
assertEq('支付宝收费 (ZH)', matchFaq('支付宝收费多少'), 'overseasCardFees');
assertEq('境外卡手续费 (ZH)', matchFaq('境外卡手续费怎么算'), 'overseasCardFees');

// supportedCards
assertEq('which cards (EN)', matchFaq('Which cards can I use with Alipay?'), 'supportedCards');
assertEq('what cards (EN)', matchFaq('what cards does alipay accept?'), 'supportedCards');
assertEq('supported cards (EN)', matchFaq('Are overseas cards supported?'), 'supportedCards');
assertEq('what credit card (EN)', matchFaq('what credit card works with alipay'), 'supportedCards');
assertEq('哪些卡 (ZH)', matchFaq('支付宝支持哪些卡？'), 'supportedCards');
assertEq('哪些银行卡 (ZH)', matchFaq('哪些银行卡可以绑'), 'supportedCards');
assertEq('支持什么卡 (ZH)', matchFaq('支持什么卡啊'), 'supportedCards');

// paymentFailure
assertEq('payment failed (EN)', matchFaq('My alipay payment failed'), 'paymentFailure');
assertEq('payment not working (EN)', matchFaq('Alipay payment not working'), 'paymentFailure');
assertEq('cannot pay (EN)', matchFaq('I cannot pay with alipay'), 'paymentFailure');
assertEq("can't pay (EN)", matchFaq("I can't pay"), 'paymentFailure');
assertEq('payment declined (EN)', matchFaq('payment declined by alipay'), 'paymentFailure');
assertEq('transaction failed (EN)', matchFaq('my transaction failed'), 'paymentFailure');
assertEq('付款失败 (ZH)', matchFaq('付款失败怎么办'), 'paymentFailure');
assertEq('支付失败 (ZH)', matchFaq('支付失败了'), 'paymentFailure');
assertEq('支付不了 (ZH)', matchFaq('支付不了钱'), 'paymentFailure');

// ---------------------------------------------------------------------------
// matchFaq — should NOT match
// ---------------------------------------------------------------------------
console.log('\n=== matchFaq (should NOT match) ===');
assertEq('general alipay question', matchFaq('How do I use Alipay in China?'), null);
assertEq('registration question', matchFaq('How do I register for Alipay?'), null);
assertEq('WeChat Pay question', matchFaq('How do I use WeChat Pay?'), null);
assertEq('metro question', matchFaq('How do I take the metro in Shanghai?'), null);
// train ticket questions are now covered by FAQ — confirm they DO match
assertEq('train ticket buying question → FAQ', matchFaq('How do I buy a train ticket?'), 'trainTicketGeneral');
assertEq('empty string', matchFaq(''), null);

// ---------------------------------------------------------------------------
// getFaqAnswer — language routing
// ---------------------------------------------------------------------------
console.log('\n=== getFaqAnswer (language routing) ===');
assertEq('EN passport → en', getFaqAnswer('passportVerification', 'How long does verification take?'), FAQ_ANSWERS.passportVerification.en);
assertEq('ZH passport → zh', getFaqAnswer('passportVerification', '护照认证多久'), FAQ_ANSWERS.passportVerification.zh);
assertEq('EN tourPass → en', getFaqAnswer('tourPass', 'Can I use Alipay Tour Pass?'), FAQ_ANSWERS.tourPass.en);
assertEq('ZH tourPass → zh', getFaqAnswer('tourPass', '支付宝国际版'), FAQ_ANSWERS.tourPass.zh);
assertEq('EN overseasCardFees → en', getFaqAnswer('overseasCardFees', 'What is the alipay fee?'), FAQ_ANSWERS.overseasCardFees.en);
assertEq('ZH overseasCardFees → zh', getFaqAnswer('overseasCardFees', '支付宝手续费'), FAQ_ANSWERS.overseasCardFees.zh);
assertEq('EN supportedCards → en', getFaqAnswer('supportedCards', 'Which cards work?'), FAQ_ANSWERS.supportedCards.en);
assertEq('ZH supportedCards → zh', getFaqAnswer('supportedCards', '哪些卡可以用'), FAQ_ANSWERS.supportedCards.zh);
assertEq('EN paymentFailure → en', getFaqAnswer('paymentFailure', 'payment failed'), FAQ_ANSWERS.paymentFailure.en);
assertEq('ZH paymentFailure → zh', getFaqAnswer('paymentFailure', '支付失败'), FAQ_ANSWERS.paymentFailure.zh);
assertEq('unknown key → null', getFaqAnswer('nonexistent', 'anything'), null);

// ---------------------------------------------------------------------------
// Passport verification answer content checks
// ---------------------------------------------------------------------------
console.log('\n=== passportVerification answer content ===');
const enPV = FAQ_ANSWERS.passportVerification.en;
const zhPV = FAQ_ANSWERS.passportVerification.zh;

assertNotContains('EN: no "minutes"', enPV, 'minutes');
assertNotContains('EN: no "hours"', enPV, 'hours');
assertNotContains('EN: no "business days"', enPV, 'business days');
assertNotContains('EN: no "manual review"', enPV, 'manual review');
assertNotContains('EN: no "5–15"', enPV, '5–15');
assertNotContains('EN: no "5-15"', enPV, '5-15');
assertNotContains('EN: no "Identity Center"', enPV, 'Identity Center');
assert('EN: mentions identity-verification page', enPV.includes('identity-verification page'));
assert('EN: mentions in-app Help', enPV.includes('in-app Help'));

assertNotContains('ZH: no "分钟"', zhPV, '分钟');
assertNotContains('ZH: no "工作日"', zhPV, '工作日');
assertNotContains('ZH: no "人工审核"', zhPV, '人工审核');
assert('ZH: mentions verification page', zhPV.includes('身份认证页面'));
assert('ZH: mentions customer service', zhPV.includes('客服'));

// ---------------------------------------------------------------------------
// Tour Pass answer content checks
// ---------------------------------------------------------------------------
console.log('\n=== tourPass answer content ===');
const enTP = FAQ_ANSWERS.tourPass.en;
const zhTP = FAQ_ANSWERS.tourPass.zh;

assertNotContains('EN: no "discontinued"', enTP, 'discontinued');
assert('EN: could not verify', enTP.toLowerCase().includes('could not verify'));
assert('EN: mentions standard alipay app', enTP.toLowerCase().includes('standard alipay app'));
assert('ZH: mentions inability to confirm', zhTP.includes('无法确认'));
assert('ZH: mentions standard Alipay app', zhTP.includes('标准支付宝 App'));

// ---------------------------------------------------------------------------
// Overseas card fees answer checks
// ---------------------------------------------------------------------------
console.log('\n=== overseasCardFees answer content ===');
const enFee = FAQ_ANSWERS.overseasCardFees.en;
const zhFee = FAQ_ANSWERS.overseasCardFees.zh;

assertNotContains('EN: no specific percentage', enFee, '%');
assertNotContains('EN: no "3%"', enFee, '3%');
assertNotContains('EN: no "200"', enFee, '200');
assert('EN: mentions payment confirmation screen', enFee.includes('payment confirmation screen'));
assert('EN: mentions cancel option', enFee.toLowerCase().includes('cancel'));
assert('ZH: mentions payment confirmation page', zhFee.includes('确认页面'));

// ---------------------------------------------------------------------------
// Supported cards answer checks
// ---------------------------------------------------------------------------
console.log('\n=== supportedCards answer content ===');
const enSC = FAQ_ANSWERS.supportedCards.en;
const zhSC = FAQ_ANSWERS.supportedCards.zh;

assertNotContains('EN: no Visa brand', enSC, 'Visa');
assertNotContains('EN: no Mastercard brand', enSC, 'Mastercard');
assertNotContains('EN: no Amex brand', enSC, 'Amex');
assert('EN: mentions bank cards section', enSC.toLowerCase().includes('bank cards'));
assert('EN: notes cards can change', enSC.toLowerCase().includes('can change'));
assert('ZH: mentions 银行卡', zhSC.includes('银行卡'));

// ---------------------------------------------------------------------------
// Payment failure answer checks
// ---------------------------------------------------------------------------
console.log('\n=== paymentFailure answer content ===');
const enPF = FAQ_ANSWERS.paymentFailure.en;
const zhPF = FAQ_ANSWERS.paymentFailure.zh;

assert('EN: check error message step', enPF.includes('error message'));
assert('EN: mentions keeping cash', enPF.toLowerCase().includes('cash'));
assert('EN: conditional language', enPF.toLowerCase().includes('may') || enPF.toLowerCase().includes('some'));
assert('ZH: mentions error information', zhPF.includes('错误信息'));
assert('ZH: mentions cash', zhPF.includes('现金'));

// ---------------------------------------------------------------------------
// No leaked internal labels in any answer
// ---------------------------------------------------------------------------
console.log('\n=== No leaked internal labels in FAQ answers ===');
const allAnswers = Object.values(FAQ_ANSWERS).flatMap((a) => [a.en, a.zh]);
const forbidden = ['verified reference', 'according to the instructions', 'system prompt', 'hidden rules', 'reference context', 'FACTUAL CONTEXT'];
for (const label of forbidden) {
  for (const answer of allAnswers) {
    assertNotContains(`No "${label}" in FAQ answers`, answer, label);
  }
}

// ---------------------------------------------------------------------------
// VERIFIED_GUIDES structure
// ---------------------------------------------------------------------------
console.log('\n=== VERIFIED_GUIDES structure ===');
assert('alipay guide exists', Boolean(VERIFIED_GUIDES.alipay));
assert('alipay guide has topic', typeof VERIFIED_GUIDES.alipay.topic === 'string');
assert('alipay guide sourceMetadata is null (no fabricated date)', VERIFIED_GUIDES.alipay.sourceMetadata === null);
assert('alipay guide has content', typeof VERIFIED_GUIDES.alipay.content === 'string' && VERIFIED_GUIDES.alipay.content.length > 100);
assertNotContains('guide: no "Last reviewed"', VERIFIED_GUIDES.alipay.content, 'Last reviewed');
assertNotContains('guide: no "Tour Pass"', VERIFIED_GUIDES.alipay.content, 'Tour Pass');
assertNotContains('guide: no fabricated verification time', VERIFIED_GUIDES.alipay.content, 'business days');

// ---------------------------------------------------------------------------
// FAQ_RULES structure
// ---------------------------------------------------------------------------
console.log('\n=== FAQ_RULES structure ===');
const expectedKeys = [
  'passportVerification', 'tourPass', 'overseasCardFees', 'supportedCards', 'paymentFailure',
  'trainTicketQR', 'trainTicketPaper', 'trainTicketGeneral',
];
assertEq('FAQ_RULES count', FAQ_RULES.length, expectedKeys.length);
for (const key of expectedKeys) {
  const rule = FAQ_RULES.find((r) => r.key === key);
  assert(`${key} rule exists`, Boolean(rule));
  assert(`${key} has patterns array`, Array.isArray(rule?.patterns) && rule.patterns.length > 0);
  assert(`${key} has answer`, Boolean(FAQ_ANSWERS[key]?.en) && Boolean(FAQ_ANSWERS[key]?.zh));
}

// ---------------------------------------------------------------------------
// Non-FAQ Alipay questions still produce guide injection
// ---------------------------------------------------------------------------
console.log('\n=== Non-FAQ Alipay questions use guide (buildDeepSeekMessages) ===');
const alipayMsg = 'How do I use Alipay in China?';
assertEq('general alipay not matched as FAQ', matchFaq(alipayMsg), null);

const msgs = buildDeepSeekMessages([], alipayMsg, { verifiedGuide: VERIFIED_GUIDES.alipay });
assert('system message injected', msgs[0].role === 'system');
assert('guide content injected', msgs[0].content.includes('Linking an overseas card'));
assert('user message is last', msgs[msgs.length - 1].role === 'user');
assertNotContains('guide label not leaked', msgs[0].content, 'VERIFIED_GUIDES');

// ---------------------------------------------------------------------------
// Time-sensitive note injection
// ---------------------------------------------------------------------------
console.log('\n=== Time-sensitive note injection ===');
const tsMsg = 'What is the current train schedule?';
const tsMsgs = buildDeepSeekMessages([], tsMsg, { isTimeSensitive: true });
assert('time-sensitive note injected', tsMsgs[0].content.includes('time-sensitive'));

// No double-injection when guide present
const bothMsgs = buildDeepSeekMessages([], alipayMsg, { verifiedGuide: VERIFIED_GUIDES.alipay, isTimeSensitive: true });
assert('guide wins over time-sensitive', bothMsgs[0].content.includes('Linking an overseas card'));
assertNotContains('no double note', bothMsgs[0].content, 'time-sensitive\n\nNOTE');

// ---------------------------------------------------------------------------
// Train ticket FAQ — matchFaq routing
// ---------------------------------------------------------------------------
console.log('\n=== Train ticket: matchFaq routing ===');

// QR boarding
assertEq('qr code to board (EN)', matchFaq('Can I use a QR code to board a train in China?'), 'trainTicketQR');
assertEq('use qr code to board (EN)', matchFaq('Can I use qr code to board?'), 'trainTicketQR');
assertEq('board with qr (EN)', matchFaq('Can I board with qr?'), 'trainTicketQR');
assertEq('二维码乘坐 (ZH)', matchFaq('外国人可以用二维码乘坐中国火车吗？'), 'trainTicketQR');
assertEq('二维码乘高铁 (ZH)', matchFaq('用二维码乘高铁可以吗'), 'trainTicketQR');
assertEq('扫码进站 (ZH)', matchFaq('可以扫码进站吗'), 'trainTicketQR');
assertEq('扫码乘车 (ZH)', matchFaq('可以扫码乘车吗'), 'trainTicketQR');
assertEq('火车二维码 (ZH)', matchFaq('火车二维码怎么用'), 'trainTicketQR');

// Paper ticket
assertEq('paper train ticket (EN)', matchFaq('Do I need to collect a paper train ticket in China?'), 'trainTicketPaper');
assertEq('paper ticket (EN)', matchFaq('Do I need a paper ticket for the train?'), 'trainTicketPaper');
assertEq('pick up a paper ticket (EN)', matchFaq('Should I pick up a paper ticket?'), 'trainTicketPaper');
assertEq('纸质票 (ZH)', matchFaq('中国火车票需要取纸质票吗？'), 'trainTicketPaper');
assertEq('纸质车票 (ZH)', matchFaq('需要纸质车票吗'), 'trainTicketPaper');

// General buying
assertEq('buy a train ticket (EN)', matchFaq('How do I buy a train ticket in China?'), 'trainTicketGeneral');
assertEq('train ticket in china (EN)', matchFaq('I need a train ticket in china'), 'trainTicketGeneral');
assertEq('12306 (EN)', matchFaq('how do I use 12306?'), 'trainTicketGeneral');
assertEq('外国人买火车票 (ZH)', matchFaq('外国人买火车票在哪里买？'), 'trainTicketGeneral');
assertEq('外国人怎么买 via 火车票 (ZH)', matchFaq('外国人怎么买中国火车票？'), 'trainTicketGeneral');
assertEq('怎么买火车票 (ZH)', matchFaq('怎么买火车票'), 'trainTicketGeneral');
assertEq('火车票 catch-all (ZH)', matchFaq('中国的火车票可以提前多久买'), 'trainTicketGeneral');

// Alipay FAQs still unaffected
assertEq('alipay question not train', matchFaq('How do I use Alipay in China?'), null);
assertEq('passport verification still works', matchFaq('How long does passport verification take?'), 'passportVerification');

// ---------------------------------------------------------------------------
// Train ticket FAQ — QR content checks
// ---------------------------------------------------------------------------
console.log('\n=== trainTicketQR answer content ===');
const enQR = FAQ_ANSWERS.trainTicketQR.en;
const zhQR = FAQ_ANSWERS.trainTicketQR.zh;

assertNotContains('EN QR: no "use the app QR code to board"', enQR, 'use the app QR code to board');
assertNotContains('EN QR: no "rely on" QR code without caveat', enQR.replace('should not rely on', ''), 'rely on');
assertNotContains('EN QR: no "10–15 minutes"', enQR, '10–15 minutes');
assertNotContains('EN QR: no "30 minutes before"', enQR, '30 minutes before');
assertNotContains('EN QR: no "pick up a paper ticket"', enQR, 'pick up a paper ticket');
assert('EN QR: warns not to rely on QR', enQR.includes('should not rely on an app QR code'));
assert('EN QR: mentions original passport', enQR.toLowerCase().includes('original passport'));
assert('EN QR: mentions staffed gate', enQR.toLowerCase().includes('staffed'));
assertNotContains('ZH QR: no "10到15分钟"', zhQR, '10到15分钟');
assertNotContains('ZH QR: no "提前30分钟"', zhQR, '提前30分钟');
assert('ZH QR: warns not to use QR as primary', zhQR.includes('不应将 App 二维码'));
assert('ZH QR: mentions passport', zhQR.includes('护照'));

// ---------------------------------------------------------------------------
// Train ticket FAQ — paper content checks
// ---------------------------------------------------------------------------
console.log('\n=== trainTicketPaper answer content ===');
const enPaper = FAQ_ANSWERS.trainTicketPaper.en;
const zhPaper = FAQ_ANSWERS.trainTicketPaper.zh;

assertNotContains('EN paper: no "use the app QR code to board"', enPaper, 'use the app QR code to board');
assertNotContains('EN paper: no "10–15 minutes"', enPaper, '10–15 minutes');
assertNotContains('EN paper: no "30 minutes before"', enPaper, '30 minutes before');
assert('EN paper: says normally not required', enPaper.toLowerCase().includes('not normally need to collect a paper'));
assert('EN paper: mentions passport as key document', enPaper.toLowerCase().includes('passport'));
assert('EN paper: mentions staffed counter for reimbursement', enPaper.toLowerCase().includes('staffed counter'));
assertNotContains('ZH paper: no "提前30分钟"', zhPaper, '提前30分钟');
assert('ZH paper: says not needed', zhPaper.includes('不需要领取纸质车票'));
assert('ZH paper: mentions passport', zhPaper.includes('护照'));

// ---------------------------------------------------------------------------
// Train ticket FAQ — general buying content checks
// ---------------------------------------------------------------------------
console.log('\n=== trainTicketGeneral answer content ===');
const enGen = FAQ_ANSWERS.trainTicketGeneral.en;
const zhGen = FAQ_ANSWERS.trainTicketGeneral.zh;

assertNotContains('EN gen: no "use the app QR code to board"', enGen, 'use the app QR code to board');
assertNotContains('EN gen: no "pick up a paper ticket"', enGen, 'pick up a paper ticket');
assertNotContains('EN gen: no "10–15 minutes"', enGen, '10–15 minutes');
assertNotContains('EN gen: no "30 minutes before"', enGen, '30 minutes before');
assertNotContains('EN gen: no hardcoded presale days', enGen, 'days in advance');
assert('EN gen: mentions 12306', enGen.includes('12306'));
assert('EN gen: mentions passport name', enGen.toLowerCase().includes('passport name'));
assert('EN gen: mentions original passport for station', enGen.toLowerCase().includes('original passport'));
assert('EN gen: says paper ticket not normally required', enGen.toLowerCase().includes('paper ticket is not normally required'));
assert('EN gen: notes overseas cards vary', enGen.toLowerCase().includes('not all overseas cards'));
assert('EN gen: points to electronic boards for platform info', enGen.toLowerCase().includes('electronic boards'));
assertNotContains('ZH gen: no "提前30分钟"', zhGen, '提前30分钟');
assertNotContains('ZH gen: no "10到15分钟"', zhGen, '10到15分钟');
assert('ZH gen: mentions 12306', zhGen.includes('12306'));
assert('ZH gen: mentions passport name entry', zhGen.includes('护照上的英文姓名'));
assert('ZH gen: says paper not required', zhGen.includes('无需领取纸质车票'));
assert('ZH gen: card support disclaimer', zhGen.includes('并非所有境外银行卡'));

// ---------------------------------------------------------------------------
// FAQ_RULES completeness
// ---------------------------------------------------------------------------
console.log('\n=== FAQ_RULES includes train keys ===');
const trainKeys = ['trainTicketQR', 'trainTicketPaper', 'trainTicketGeneral'];
for (const key of trainKeys) {
  const rule = FAQ_RULES.find((r) => r.key === key);
  assert(`${key} rule exists`, Boolean(rule));
  assert(`${key} has patterns`, Array.isArray(rule?.patterns) && rule.patterns.length > 0);
  assert(`${key} has EN answer`, Boolean(FAQ_ANSWERS[key]?.en));
  assert(`${key} has ZH answer`, Boolean(FAQ_ANSWERS[key]?.zh));
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

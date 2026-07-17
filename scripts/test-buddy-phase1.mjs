import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { __test__ } from '../workers/chinaease-proxy/worker.js';

const workerSource = readFileSync(new URL('../workers/chinaease-proxy/worker.js', import.meta.url), 'utf8');
const buddySource = readFileSync(new URL('../functions/api/buddy/chat.js', import.meta.url), 'utf8');
const chatModalSource = readFileSync(new URL('../src/components/ChatModal.tsx', import.meta.url), 'utf8');

assert.equal(
  __test__.extractReplyFromPayload({ reply: 'Immediate answer' }),
  'Immediate answer',
  'extracts immediate reply',
);

assert.equal(
  __test__.extractReplyFromPayload({
    data: {
      messages: [
        { role: 'assistant', type: 'reasoning', content: 'debug thought' },
        { role: 'assistant', type: 'answer', content: 'Final answer' },
      ],
    },
  }),
  'Final answer',
  'extracts assistant answer and ignores reasoning',
);

assert.deepEqual(
  __test__.chatIds({ data: { id: 'chat_1', conversation_id: 'conv_1', status: 'in_progress' } }),
  { chatId: 'chat_1', conversationId: 'conv_1' },
  'extracts chat and conversation ids',
);

assert.equal(
  __test__.chatStatus({ data: { status: 'completed' } }),
  'completed',
  'extracts chat status',
);

assert.equal(__test__.clampTimeoutMs(3000), 5000, 'clamps worker timeout to safe minimum');
assert.equal(__test__.clampTimeoutMs(12000), 12000, 'accepts safe worker timeout from Pages');
assert.equal(__test__.clampTimeoutMs(30000), 14000, 'clamps worker timeout to safe maximum');

assert.equal(
  __test__.extractReplyFromCozeEvents(__test__.parseCozeSse(`event: conversation.message.delta
data: {"role":"assistant","type":"answer","content":"Hi"}

event: conversation.message.delta
data: {"role":"assistant","type":"answer","content":" there"}

`)).reply,
  'Hi there',
  'extracts streamed assistant deltas',
);

assert.match(workerSource, /COZE_INTERNAL_SECRET/, 'worker references internal secret');
assert.match(workerSource, /X-ChinaEase-Internal-Token/, 'worker checks internal header');
assert.match(workerSource, /X-ChinaEase-Timeout-Ms/, 'worker accepts bounded timeout from Pages');
assert.match(workerSource, /COZE_GLOBAL_BUDGET_MS = 14000/, 'worker global budget stays below Pages budget');
assert.match(workerSource, /budgetMs = clampTimeoutMs/, 'worker clamps caller-provided timeout only after internal auth');
assert.match(workerSource, /globalDeadlineAt = Date\.now\(\) \+ budgetMs/, 'worker uses per-request absolute deadline');
assert.match(workerSource, /return json\(\{ error: 'upstream_timeout'/, 'worker returns structured JSON timeout');
assert.match(workerSource, /COZE_RETRIEVE_URL/, 'worker supports retrieve-chat polling');
assert.match(workerSource, /COZE_MESSAGE_LIST_URL/, 'worker supports message-list polling');
assert.match(buddySource, /TOTAL_REQUEST_BUDGET_MS = 21000/, 'Pages Function has a conservative end-to-end budget');
assert.doesNotMatch(buddySource, /UPSTREAM_TIMEOUT_MS = 35000/, 'Pages Function no longer waits 35s for upstream');
assert.match(buddySource, /X-ChinaEase-Timeout-Ms/, 'Pages Function passes remaining budget to Worker');
assert.match(buddySource, /assertTimeRemaining\(deadlineAt, 9000\)/, 'Pages Function fails fast if there is not enough time before Worker call');
assert.match(buddySource, /signal: AbortSignal\.timeout\(fetchTimeoutMs\)/, 'Pages Function aborts Worker calls before platform timeout');
assert.match(buddySource, /withTimeout\(rollbackUsage/, 'Pages Function bounds rollback work after upstream timeout');
assert.match(buddySource, /504, 'upstream_timeout'/, 'Pages Function returns JSON 504 for timeout');
assert.match(buddySource, /Buddy is temporarily unavailable\. Please try again\./, 'Pages timeout returns JSON-safe user message');
assert.match(buddySource, /updateWrite\(env, userPath, \{\s*buddyAiQuotaUsed: totalBefore \+ 1/s, 'successful reservation charges quota once');
assert.match(buddySource, /duplicate_completed/, 'duplicate completed requests remain idempotent');
assert.match(buddySource, /rollbackUsage/, 'timed-out requests attempt quota rollback');
assert.match(buddySource, /validBotId/, 'Pages Function validates bot id');
assert.match(buddySource, /missing_internal_secret/, 'Pages Function rejects missing production internal secret');
assert.match(buddySource, /reply: reply\.slice/, 'Pages Function stores completed reply for idempotency');
assert.match(chatModalSource, /buildContext/, 'ChatModal sends recent conversation context');
assert.match(chatModalSource, /retryRequestId/, 'ChatModal preserves request id for retry');

console.log('Buddy Phase 1 tests passed');

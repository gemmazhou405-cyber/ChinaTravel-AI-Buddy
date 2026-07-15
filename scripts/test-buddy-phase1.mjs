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
assert.match(workerSource, /COZE_RETRIEVE_URL/, 'worker supports retrieve-chat polling');
assert.match(workerSource, /COZE_MESSAGE_LIST_URL/, 'worker supports message-list polling');
assert.match(buddySource, /validBotId/, 'Pages Function validates bot id');
assert.match(buddySource, /missing_internal_secret/, 'Pages Function rejects missing production internal secret');
assert.match(buddySource, /reply: reply\.slice/, 'Pages Function stores completed reply for idempotency');
assert.match(chatModalSource, /buildContext/, 'ChatModal sends recent conversation context');
assert.match(chatModalSource, /retryRequestId/, 'ChatModal preserves request id for retry');

console.log('Buddy Phase 1 tests passed');

import test from 'node:test';
import assert from 'node:assert/strict';
import {selectSDJRecovery} from '../lib/sdj-recovery-client.js';

test('no browser recovery state falls back to the server recovery cookie', () => {
  assert.equal(selectSDJRecovery(), null);
  assert.equal(selectSDJRecovery({freshSecret: null, freshSession: null, storedSecret: '', storedSession: ''}), null);
});

test('BASIC no-redirect success wins over an abandoned PREMIUM session', () => {
  assert.deepEqual(selectSDJRecovery({storedSecret: 'pi_basic_secret_fixture', storedSession: 'cs_live_abandoned'}), {clientSecret: 'pi_basic_secret_fixture'});
});

test('fresh BASIC return wins over all stale browser state', () => {
  assert.deepEqual(selectSDJRecovery({freshSecret: 'pi_new_secret_fixture', storedSecret: 'pi_old_secret_fixture', storedSession: 'cs_live_old'}), {clientSecret: 'pi_new_secret_fixture'});
});

test('fresh PREMIUM return wins over all stale browser state', () => {
  assert.deepEqual(selectSDJRecovery({freshSession: 'cs_live_new', storedSecret: 'pi_old_secret_fixture', storedSession: 'cs_live_old'}), {sessionId: 'cs_live_new'});
});

test('fresh query recovery has deterministic precedence if both keys are present', () => {
  assert.deepEqual(selectSDJRecovery({freshSecret: 'pi_new_secret_fixture', freshSession: 'cs_live_new'}), {clientSecret: 'pi_new_secret_fixture'});
});

test('stored PREMIUM session can be retried after return query is removed', () => {
  assert.deepEqual(selectSDJRecovery({storedSession: 'cs_live_retry'}), {sessionId: 'cs_live_retry'});
});

test('stored BASIC secret can be retried after return query is removed', () => {
  assert.deepEqual(selectSDJRecovery({storedSecret: 'pi_retry_secret_fixture'}), {clientSecret: 'pi_retry_secret_fixture'});
});

test('an explicit but invalid fresh return is not replaced with an unrelated old receipt', () => {
  assert.deepEqual(selectSDJRecovery({freshSession: 'invalid', storedSecret: 'pi_old_secret_fixture'}), {sessionId: 'invalid'});
});

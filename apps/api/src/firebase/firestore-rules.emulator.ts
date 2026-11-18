import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ID = 'demo-kathaisolli-firestore-rules';
const RULES_PATH = resolve(__dirname, '../../../../firestore.rules');

describe('Firestore security rules', () => {
  let testEnvironment: RulesTestEnvironment;

  beforeAll(async () => {
    testEnvironment = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync(RULES_PATH, 'utf8'),
      },
    });
  }, 20_000);

  beforeEach(async () => {
    await testEnvironment.clearFirestore();
  });

  afterAll(async () => {
    if (testEnvironment) {
      await testEnvironment.cleanup();
    }
  });

  async function seedDocument(path: string, data: Record<string, unknown>) {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc(path).set(data);
    });
  }

  it('denies unauthenticated reads and writes', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore();

    await assertFails(firestore.doc('users/user-a').get());
    await assertFails(
      firestore.doc('users/user-a').set({ role: 'LISTENER' }),
    );
  });

  it('prevents one user from reading another user’s private data', async () => {
    await seedDocument('users/user-b', { role: 'LISTENER' });
    await seedDocument('favorites/favorite-b', {
      userId: 'user-b',
      seriesId: 'series-1',
    });
    await seedDocument('listeningHistory/history-b', {
      userId: 'user-b',
      seriesId: 'series-1',
    });
    const firestore = testEnvironment.authenticatedContext('user-a').firestore();

    await assertFails(firestore.doc('users/user-b').get());
    await assertFails(firestore.doc('favorites/favorite-b').get());
    await assertFails(firestore.doc('listeningHistory/history-b').get());
  });

  it('prevents clients from changing ownership fields', async () => {
    await seedDocument('favorites/favorite-a', {
      userId: 'user-a',
      seriesId: 'series-1',
    });
    const firestore = testEnvironment.authenticatedContext('user-a').firestore();

    await assertFails(
      firestore.doc('favorites/favorite-a').update({ userId: 'user-b' }),
    );
  });

  it('prevents users from changing or self-assigning roles', async () => {
    await seedDocument('users/user-a', { role: 'LISTENER' });
    const firestore = testEnvironment.authenticatedContext('user-a').firestore();

    for (const role of ['CREATOR', 'ADMIN', 'SUPER_ADMIN']) {
      await assertFails(firestore.doc('users/user-a').update({ role }));
      await assertFails(
        firestore.doc(`users/user-a-${role}`).set({ role }),
      );
    }
  });

  it('denies story creation by claiming creatorId', async () => {
    const firestore = testEnvironment.authenticatedContext('user-a').firestore();

    await assertFails(
      firestore.doc('stories/story-a').set({
        creatorId: 'user-a',
        status: 'DRAFT',
      }),
    );
  });

  it('denies publishing by clients without a trusted reviewer flow', async () => {
    await seedDocument('stories/story-a', {
      creatorId: 'creator-a',
      status: 'PENDING_REVIEW',
    });
    const creator = testEnvironment
      .authenticatedContext('creator-a', { role: 'CREATOR' })
      .firestore();

    await assertFails(
      creator.doc('stories/story-a').update({ status: 'PUBLISHED' }),
    );
  });

  it('denies client writes to subscriptions and payments, including admin claims', async () => {
    const client = testEnvironment
      .authenticatedContext('admin-a', {
        role: 'ADMIN',
        admin: true,
      })
      .firestore();

    await assertFails(
      client.doc('subscriptions/subscription-a').set({
        userId: 'admin-a',
        status: 'ACTIVE',
      }),
    );
    await assertFails(
      client.doc('payments/payment-a').set({
        userId: 'admin-a',
        amount: 100,
      }),
    );
  });

  it('denies client access to unmapped collections', async () => {
    const firestore = testEnvironment.authenticatedContext('user-a').firestore();

    await assertFails(firestore.doc('unmapped/document').get());
  });

  it('allows trusted backend operations while client rules stay closed', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await assertSucceeds(
        firestore.doc('subscriptions/subscription-a').set({
          userId: 'user-a',
          status: 'ACTIVE',
        }),
      );
      await assertSucceeds(
        firestore.doc('subscriptions/subscription-a').get(),
      );
    });

    const client = testEnvironment.authenticatedContext('user-a').firestore();
    await assertFails(client.doc('subscriptions/subscription-a').get());
  });
});

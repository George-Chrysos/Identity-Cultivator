import { CultivatorDatabase } from '@/api/cultivatorDatabase';

async function run() {
  // Create a temporary identity
  const identity = await CultivatorDatabase.createIdentity({ userID: 'test-user', identityType: 'CULTIVATOR' });
  const progress = await CultivatorDatabase.getProgressForIdentity(identity.identityID);
  console.log('Initial', { level: identity.level, daysCompleted: identity.daysCompleted, required: identity.requiredDaysPerLevel });

  // Simulate completing required days in quick succession
  for (let i = 0; i < identity.requiredDaysPerLevel + 2; i++) {
    const res = await CultivatorDatabase.updateProgress({ userID: 'test-user', identityID: identity.identityID, action: 'COMPLETE' });
    console.log('Step', i+1, '->', res.message, 'Level', res.identity?.level, 'daysCompleted', res.progress?.daysCompleted);
  }
}

run().catch(console.error);

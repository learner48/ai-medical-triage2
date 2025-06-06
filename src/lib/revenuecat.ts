import { RevenueCatClient } from 'revenuecat-client';

const client = new RevenueCatClient({
  apiKey: import.meta.env.VITE_REVENUECAT_API_KEY,
  projectId: import.meta.env.VITE_REVENUECAT_PROJECT_ID
});

export async function createSubscription(organizationId: string, planId: string) {
  try {
    const subscription = await client.createSubscription({
      customerId: organizationId,
      planId: planId,
      startDate: new Date().toISOString()
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function updateSubscription(subscriptionId: string, planId: string) {
  try {
    const subscription = await client.updateSubscription(subscriptionId, {
      planId: planId
    });

    return subscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    await client.cancelSubscription(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await client.getSubscription(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}
interface NewsletterSubscriber {
  email: string;
}

interface NewsletterResponse {
  success?: boolean;
  message?: string;
  error?: string;
  details?: string;
}

export const subscribeToNewsletter = async (subscriber: NewsletterSubscriber): Promise<void> => {
  try {
    const response = await fetch('http://localhost:4242/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: subscriber.email,
      }),
    });

    const data: NewsletterResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // Success
    console.log('Successfully subscribed to newsletter:', data.message);
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to subscribe: ${error.message}`);
    }
    throw new Error('Failed to subscribe to newsletter. Please try again.');
  }
}; 
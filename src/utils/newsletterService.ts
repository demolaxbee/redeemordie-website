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
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL!;
    const url = `${API_BASE_URL}/api/newsletter/subscribe`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: subscriber.email,
      }),
    });

    // Check if we got HTML instead of JSON (error page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error('Server returned an invalid response. Please check if the backend server is running.');
    }

    const data: NewsletterResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to subscribe: ${error.message}`);
    }
    throw new Error('Failed to subscribe to newsletter. Please try again.');
  }
}; 
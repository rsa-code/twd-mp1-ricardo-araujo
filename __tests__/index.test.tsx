import { render } from '@testing-library/react';

// Simple component for testing
const TestComponent = () => <div>Hello World</div>;

describe('Jest Setup', () => {
  it('renders a simple component', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('verifies testing environment is working', () => {
    expect(true).toBe(true);
  });
});

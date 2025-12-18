import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import Header from '../components/Header';

// Mock the hooks
jest.mock('../hooks/useCart');
jest.mock('../contexts/AuthContext', () => ({
  AuthContext: {
    Consumer: ({ children }) => children({ user: null, logout: jest.fn() }),
    Provider: ({ children }) => children,
  },
}));

describe('Header', () => {
  beforeEach(() => {
    useCart.mockReturnValue({ cart: [{ quantity: 2 }, { quantity: 1 }] });
  });

  test('renders Header with links and cart badge', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: null, logout: jest.fn() }}>
          <Header />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('Swadhan Eats')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Cart badge
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });
});

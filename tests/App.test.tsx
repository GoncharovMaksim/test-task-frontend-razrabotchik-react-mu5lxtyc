import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders mandatory GREEN-API credentials setup modal when unconfigured', () => {
    render(<App />);

    expect(screen.getByText('Подключение к GREEN-API')).toBeInTheDocument();
    expect(screen.getByText('Введите данные инстанса для работы с MAX')).toBeInTheDocument();
    expect(screen.getByLabelText('idInstance')).toBeInTheDocument();
    expect(screen.getByLabelText('apiTokenInstance')).toBeInTheDocument();
  });
});

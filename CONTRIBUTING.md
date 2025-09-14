# 🤝 Contributing to Stock Portfolio Tracker

Thank you for your interest in contributing to the Stock Portfolio Tracker! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+**: [Download here](https://nodejs.org/)
- **pnpm**: Install with `npm install -g pnpm`
- **Git**: [Download here](https://git-scm.com/)
- **Code Editor**: VS Code recommended with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/stock-table-app.git
   cd stock-table-app
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/stock-table-app.git
   ```

## 🛠️ Development Setup

### Installation

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment variables**:

   ```bash
   cp env.template .env.local
   # Edit .env.local with your API keys
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

4. **Open application**:
   Visit [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm type-check

# Run tests (when available)
pnpm test
```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome the following types of contributions:

1. **🐛 Bug Fixes**: Fix issues and improve reliability
2. **✨ New Features**: Add new functionality
3. **📚 Documentation**: Improve or add documentation
4. **🎨 UI/UX Improvements**: Enhance user interface and experience
5. **⚡ Performance**: Optimize application performance
6. **🧪 Tests**: Add or improve test coverage
7. **🔧 Refactoring**: Improve code quality and maintainability

### Before You Start

1. **Check existing issues** to see if your idea is already being worked on
2. **Create an issue** to discuss major changes before implementation
3. **Keep changes focused** - one feature or fix per pull request
4. **Follow the coding standards** outlined below

### Workflow

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes** following the coding standards

3. **Test your changes** thoroughly

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat: add real-time price alerts"
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## 💻 Code Standards

### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and returns
function fetchStockPrice(ticker: string): Promise<StockData> {
  // Implementation
}

// Use interfaces for object types
interface Stock {
  ticker: string;
  price: number;
  lastUpdated: Date;
}

// Use enums for constants
enum ExchangeType {
  NSE = "NSE",
  BSE = "BSE",
  NASDAQ = "NASDAQ",
  NYSE = "NYSE",
}

// Use proper error handling
try {
  const data = await fetchStockPrice(ticker);
  return data;
} catch (error) {
  console.error("Failed to fetch stock price:", error);
  throw new Error("Stock price unavailable");
}
```

### React Component Guidelines

```typescript
// Use functional components with TypeScript
interface StockCardProps {
  stock: Stock;
  onRefresh: (ticker: string) => void;
}

export function StockCard({ stock, onRefresh }: StockCardProps) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    onRefresh(stock.ticker);
  }, [stock.ticker, onRefresh]);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{stock.ticker}</h3>
        <Button onClick={handleRefresh} disabled={loading}>
          {loading ? <Spinner /> : <RefreshIcon />}
        </Button>
      </div>
      <p className="text-2xl font-bold">${stock.price}</p>
    </Card>
  );
}
```

### API Route Guidelines

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Validate input
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");

    if (!ticker || !isValidTicker(ticker)) {
      return NextResponse.json(
        { error: "Invalid ticker format" },
        { status: 400 }
      );
    }

    // Process request
    const data = await fetchStockData(ticker);

    // Return response with proper caching
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function isValidTicker(ticker: string): boolean {
  // Implement validation logic
  return /^[A-Z]{1,5}$|^[A-Z]+:[A-Z]+$/.test(ticker);
}
```

### Styling Guidelines

```typescript
// Use Tailwind CSS classes consistently
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Stock Price</h2>
  <span className="text-2xl font-bold text-green-600">${price}</span>
</div>;

// Use shadcn/ui components when available
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Create reusable utility functions
const getCurrencySymbol = (exchange: string): string => {
  switch (exchange) {
    case "NSE":
    case "BSE":
      return "₹";
    case "NASDAQ":
    case "NYSE":
      return "$";
    default:
      return "$";
  }
};
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format
<type>[optional scope]: <description>

# Types
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks

# Examples
feat(api): add support for BSE stocks
fix(ui): resolve mobile responsive issues
docs: update API documentation
style: format code with prettier
refactor(components): extract reusable stock card
test: add unit tests for stock price API
chore: update dependencies
```

### File and Folder Naming

```
components/
├── ui/                     # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   └── table.tsx
├── stock-table.tsx         # Feature components (kebab-case)
├── portfolio-summary.tsx
└── price-chart.tsx

app/
├── api/
│   ├── stock/
│   │   └── [ticker]/
│   │       └── route.ts    # API routes
│   └── kite/
├── globals.css
├── layout.tsx
└── page.tsx

lib/
├── utils.ts               # Utility functions
├── api-client.ts          # API client logic
└── validators.ts          # Input validation

types/
├── stock.ts              # Type definitions
├── api.ts
└── index.ts
```

## 🧪 Testing

### Testing Guidelines

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from "@testing-library/react";
import { StockCard } from "../stock-card";

describe("StockCard", () => {
  const mockStock = {
    ticker: "AAPL",
    price: 150.25,
    lastUpdated: new Date(),
  };

  it("displays stock information correctly", () => {
    render(<StockCard stock={mockStock} onRefresh={jest.fn()} />);

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("$150.25")).toBeInTheDocument();
  });

  it("calls onRefresh when refresh button is clicked", () => {
    const mockOnRefresh = jest.fn();
    render(<StockCard stock={mockStock} onRefresh={mockOnRefresh} />);

    fireEvent.click(screen.getByRole("button", { name: /refresh/i }));
    expect(mockOnRefresh).toHaveBeenCalledWith("AAPL");
  });
});

// API testing
describe("/api/stock/[ticker]", () => {
  it("returns stock data for valid ticker", async () => {
    const response = await fetch("/api/stock/AAPL");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("ticker", "AAPL");
    expect(data).toHaveProperty("price");
    expect(typeof data.price).toBe("number");
  });

  it("returns error for invalid ticker", async () => {
    const response = await fetch("/api/stock/INVALID");
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test stock-card.test.tsx
```

## 📬 Pull Request Process

### Before Submitting

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Rebase your feature branch**:

   ```bash
   git checkout feature/your-feature-name
   git rebase main
   ```

3. **Run quality checks**:
   ```bash
   pnpm lint
   pnpm type-check
   pnpm build
   pnpm test
   ```

### Pull Request Template

When creating a pull request, include:

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated checks** must pass (linting, type checking, build)
2. **Manual review** by maintainers
3. **Testing** of functionality
4. **Documentation** review if applicable
5. **Approval** and merge

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, include:

```markdown
## Bug Description

A clear and concise description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Screenshots

If applicable, add screenshots.

## Environment

- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 22]
- Device: [e.g. iPhone X, Desktop]

## Additional Context

Any other context about the problem.
```

### Feature Requests

```markdown
## Feature Description

A clear and concise description of the feature.

## Problem Statement

What problem does this feature solve?

## Proposed Solution

How would you like this feature to work?

## Alternatives Considered

Any alternative solutions or features considered.

## Additional Context

Any other context, screenshots, or examples.
```

## 🌟 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Be constructive** in feedback
- **Be patient** with new contributors
- **Be collaborative** and helpful
- **Focus on the code**, not the person

### Communication

- **GitHub Issues**: For bugs, features, and discussions
- **Pull Requests**: For code contributions
- **Documentation**: Keep it up to date

### Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- GitHub contributors graph

## 🎯 Areas for Contribution

### High Priority

- [ ] **Unit and Integration Tests**: Increase test coverage
- [ ] **Performance Optimization**: Improve loading times and responsiveness
- [ ] **Accessibility**: Ensure WCAG compliance
- [ ] **Mobile Experience**: Enhance mobile responsiveness
- [ ] **Error Handling**: Improve user-friendly error messages

### Medium Priority

- [ ] **Additional Broker APIs**: Upstox, Angel One, 5paisa
- [ ] **Portfolio Analytics**: Charts, performance metrics
- [ ] **Price Alerts**: Notification system
- [ ] **Data Export**: CSV/Excel export functionality
- [ ] **Historical Data**: Price history and trends

### Low Priority

- [ ] **Dark Mode**: Theme switching
- [ ] **Internationalization**: Multi-language support
- [ ] **PWA Features**: Offline support, push notifications
- [ ] **Advanced Charts**: Technical indicators, candlestick charts

## 📚 Learning Resources

### Technologies Used

- **Next.js 14**: [Documentation](https://nextjs.org/docs)
- **React 18**: [Documentation](https://react.dev/)
- **TypeScript**: [Documentation](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [Documentation](https://tailwindcss.com/docs)
- **shadcn/ui**: [Documentation](https://ui.shadcn.com/)

### Best Practices

- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Next.js Best Practices](https://nextjs.org/docs/pages/building-your-application/deploying/production-checklist)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)

## 🙏 Thank You

Thank you for contributing to the Stock Portfolio Tracker! Your contributions help make this project better for everyone. Every contribution, no matter how small, is valued and appreciated.

Happy coding! 🚀

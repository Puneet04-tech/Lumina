# Contributing to Lumina

Thank you for interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/Lumina.git`
3. Create feature branch: `git checkout -b feat/your-feature`
4. Make changes
5. Commit: `git commit -m "feat: your feature"`
6. Push: `git push origin feat/your-feature`
7. Open Pull Request

## Code Style

### Backend (Node.js)

```javascript
// Use ES6 modules
import express from 'express';

// Async/await
export const handleRequest = async (req, res) => {
  try {
    // Do something
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Error handling
const validateInput = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};
```

### Frontend (React)

```javascript
// Use functional components with hooks
export function MyComponent() {
  const [state, setState] = useState('');
  
  // Use descriptive names
  const handleClick = () => {
    setState('new value');
  };
  
  // Components in separate files
  return (
    <div className="p-4 bg-white rounded-lg">
      <button onClick={handleClick} className="btn-primary">
        Click me
      </button>
    </div>
  );
}
```

## Git Commit Messages

```
feat: Add user authentication
fix: Resolve chart rendering bug
docs: Update README
style: Format code
refactor: Simplify data processing
test: Add unit tests for auth
chore: Update dependencies
```

## Testing

Before submitting PR:

1. Test locally: `npm run dev`
2. Check console for errors
3. Test main user flows
4. Verify error handling

## What to Contribute

### Easy (Good for beginners)

- [ ] Improve documentation
- [ ] Add new color schemes
- [ ] Write test cases
- [ ] Fix typos
- [ ] Add user feedback improvements

### Medium

- [ ] Add new chart types
- [ ] Implement new filters
- [ ] Add export formats
- [ ] Improve performance

### Hard

- [ ] Real-time collaboration
- [ ] Data source connectors
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] ML model integration

## Code Review Process

1. Your PR will be reviewed within 24-48 hours
2. Address feedback and push updates
3. Get approval from maintainer
4. Merge to main branch

## Questions?

Open an issue with `[QUESTION]` prefix or email the maintainers.

## License

By contributing, you agree code is licensed under MIT.

---

Happy contributing! 🎉

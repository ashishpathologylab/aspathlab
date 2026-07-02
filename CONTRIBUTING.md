# Contributing to PathLab

We welcome contributions to the PathLab project! This document provides guidelines for contributing to both the backend (Spring Boot) and frontend (React) components of the application.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Project-Specific Guidelines](#project-specific-guidelines)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

Before contributing, please:

1. Read the [README.md](README.md) to understand the project structure and setup
2. Check the [issue tracker](https://github.com/mohammadumar-dev/pathlab/issues) for existing issues or feature requests
3. Join our discussions to understand ongoing work and priorities
4. Familiarize yourself with the codebase architecture

## 💻 Development Setup

### Prerequisites

Ensure you have the following installed:
- **Backend**: Java 21+, Maven 3.9.9+, PostgreSQL 12+
- **Frontend**: Node.js 18+, npm 9+
- **Common**: Git, Docker (optional)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pathlab.git
   cd pathlab
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/mohammadumar-dev/pathlab.git
   ```

4. **Set up the backend:**
   ```bash
   cd app/pathlab-backend
   # Configure application.properties with your local database
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

5. **Set up the frontend:**
   ```bash
   cd app/pathlab-frontend
   npm install
   npm run dev
   ```

6. **Verify everything works:**
   - Backend should be running on `http://localhost:8080`
   - Frontend should be running on `http://localhost:5173`
   - Test a few API endpoints to ensure connectivity

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Java/Node version)
- Relevant logs or error messages

### Suggesting Features

For feature requests:
- Check if the feature has already been requested
- Clearly describe the feature and its use case
- Explain why this feature would be useful to most users
- Provide examples or mockups if possible

### Contributing Code

1. **Find or create an issue** for the work you want to do
2. **Comment on the issue** to let others know you're working on it
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or for bug fixes:
   ```bash
   git checkout -b fix/bug-description
   ```

4. **Make your changes** following our code standards

5. **Test your changes thoroughly**

6. **Commit your changes** with clear, descriptive messages

7. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request** with a clear description

## 📏 Code Standards

### Backend (Java/Spring Boot)

**General Principles:**
- Follow Java naming conventions:
  - Classes: `PascalCase` (e.g., `PatientService`)
  - Methods/variables: `camelCase` (e.g., `getPatientById`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`)
  - Packages: lowercase (e.g., `com.pathlab.service`)

**Code Quality:**
- Use Lombok annotations to reduce boilerplate code (`@Data`, `@Builder`, etc.)
- Add validation annotations to all DTOs (`@NotNull`, `@Valid`, `@Email`, etc.)
- Include proper error handling with custom exceptions
- Document public APIs with Javadoc comments
- Keep methods focused and under 50 lines when possible
- Use Spring's dependency injection, avoid field injection
- Follow SOLID principles

**File Organization:**
- Place new entities in `entity/` package
- Create DTOs for all API requests/responses in `dto/` package
- Keep business logic in service layer
- Controllers should only handle HTTP concerns
- Use repositories for data access only

**Example:**
```java
@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;
    
    /**
     * Retrieves a patient by ID.
     * @param id the patient ID
     * @return the patient entity
     * @throws PatientNotFoundException if patient not found
     */
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
            .orElseThrow(() -> new PatientNotFoundException(id));
    }
}
```

### Frontend (React/TypeScript)

**General Principles:**
- Use TypeScript for all new components and files
- Follow React Hooks conventions
- Use functional components (no class components)
- Implement proper TypeScript types (avoid `any`)

**Naming Conventions:**
- Components: `PascalCase` (e.g., `PatientDashboard.tsx`)
- Functions/variables: `camelCase` (e.g., `handleSubmit`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- Custom hooks: prefix with `use` (e.g., `useAuth`)
- Types/Interfaces: `PascalCase` with descriptive names

**Code Quality:**
- Write self-documenting, readable code
- Use Tailwind CSS utility classes for styling (avoid inline styles)
- Create reusable components where possible
- Keep components focused and single-responsibility
- Extract complex logic into custom hooks
- Use proper TypeScript types for props and state
- Document complex logic with comments
- Avoid deeply nested components (max 3 levels)

**File Organization:**
- Place route components in `pages/`
- Reusable UI components go in `components/`
- API calls belong in `api/` directory
- Custom hooks in `hooks/`
- Global state in `contexts/`
- Utilities in `lib/`

**Example:**
```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type PatientFormData = z.infer<typeof patientSchema>;

export function PatientForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: PatientFormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
```

### Styling Guidelines (Frontend)

- **Use Tailwind CSS utility classes** for all styling
- Avoid custom CSS unless absolutely necessary
- Follow mobile-first responsive design principles
- Use Tailwind's spacing scale consistently
- Leverage Tailwind's color palette
- Use semantic color names from your theme

**Example:**
```tsx
// Good
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  Submit
</button>

// Avoid
<button style={{ padding: '8px 16px', backgroundColor: '#3b82f6' }}>
  Submit
</button>
```

## 📝 Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without functionality changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `ci`: CI/CD configuration changes

**Scopes** (optional):
- `backend`: Backend-specific changes
- `frontend`: Frontend-specific changes
- `api`: API-related changes
- `auth`: Authentication/authorization changes
- `db`: Database changes
- `ui`: UI component changes

**Examples:**
```bash
feat(backend): add endpoint for bulk test result upload

fix(frontend): resolve patient dashboard loading issue

docs: update API documentation for booking endpoints

refactor(backend): simplify payment service logic

style(frontend): format code with ESLint standards

test(backend): add unit tests for sample service
```

### Commit Best Practices

- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the subject line to 72 characters
- Reference issues and pull requests when relevant
- Make atomic commits (one logical change per commit)
- Don't commit commented-out code or debug statements

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure your code follows our standards:**
   ```bash
   # Backend
   cd app/pathlab-backend
   ./mvnw clean verify
   
   # Frontend
   cd app/pathlab-frontend
   npm run lint
   npm run build
   ```

2. **Run all tests:**
   ```bash
   # Backend
   ./mvnw test
   
   # Frontend
   npm run test (if configured)
   ```

3. **Update documentation** if you've changed APIs or added features

4. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Pull Request Template

When creating a PR, include:

**Title:** Clear, descriptive title using conventional commit format

**Description:**
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Closes #123
Related to #456

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Dependent changes merged
```

### Review Process

1. Maintainers will review your PR within 3-5 business days
2. Address any requested changes promptly
3. Keep the PR focused and avoid scope creep
4. Be responsive to feedback and questions
5. Once approved, a maintainer will merge your PR

### PR Guidelines

- Keep PRs small and focused (ideally under 400 lines)
- One feature/fix per PR
- Include tests for new functionality
- Update relevant documentation
- Ensure CI/CD checks pass
- Resolve merge conflicts before requesting review
- Respond to reviews within a week

## 🧪 Testing Requirements

### Backend Testing

**Required for all PRs:**
- Unit tests for new service methods
- Integration tests for new controllers
- Repository tests for complex queries
- Minimum 70% code coverage for new code

**Testing Guidelines:**
```java
@SpringBootTest
@AutoConfigureMockMvc
class PatientControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldCreatePatient() throws Exception {
        // Given
        PatientDto patientDto = new PatientDto("John Doe", "john@example.com");
        
        // When & Then
        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patientDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("John Doe"));
    }
}
```

### Frontend Testing

**Recommended for PRs:**
- Test user interactions for critical flows
- Test form validation logic
- Test API integration points
- Test custom hooks

**Testing Approach:**
- Consider adding Vitest or Jest for unit tests
- Use React Testing Library for component tests
- Test accessibility with axe-core
- Manual testing in multiple browsers

## 📦 Project-Specific Guidelines

### Backend-Specific

**Database Migrations:**
- All schema changes require Flyway migrations
- Name migrations: `V{version}__{description}.sql`
- Test migrations on clean database
- Include rollback scripts in comments

**API Design:**
- Follow RESTful conventions
- Use proper HTTP status codes
- Version APIs if making breaking changes
- Document with Swagger/OpenAPI annotations
- Include pagination for list endpoints
- Implement proper error responses

**Security:**
- Never commit credentials or secrets
- Use environment variables for configuration
- Validate all user inputs
- Use parameterized queries (JPA handles this)
- Implement proper authorization checks

### Frontend-Specific

**Component Guidelines:**
- Create reusable components in `components/`
- Page-specific components can stay in `pages/`
- Use Radix UI for accessible primitives
- Implement loading and error states
- Handle edge cases gracefully

**State Management:**
- Use React Context for global state
- Keep state as local as possible
- Use custom hooks to encapsulate logic
- Avoid prop drilling with Context

**Performance:**
- Lazy load routes and heavy components
- Optimize images and assets
- Minimize bundle size
- Use React.memo() for expensive renders
- Implement proper key props for lists

**Accessibility:**
- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain sufficient color contrast

## 🌟 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Provide constructive feedback
- Focus on the code, not the person
- Assume good intentions
- Respect differing viewpoints

### Communication

- Use clear, professional language
- Be patient with questions
- Share knowledge generously
- Ask questions when unsure
- Celebrate contributions

### Recognition

Contributors will be:
- Listed in project acknowledgments
- Mentioned in release notes for significant contributions
- Given credit in documentation they improve

## ❓ Questions?

If you have questions about contributing:
- Check existing issues and discussions
- Review project documentation
- Ask in issue comments
- Reach out to maintainers

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)

---

**Thank you for contributing to PathLab! 🎉**

Your efforts help improve healthcare technology for laboratories and patients worldwide.

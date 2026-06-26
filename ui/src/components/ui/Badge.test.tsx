import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Badge>Active</Badge>)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders as a span element', () => {
      render(<Badge>Active</Badge>)
      const el = screen.getByText('Active')
      expect(el.tagName).toBe('SPAN')
    })
  })

  describe('Variants', () => {
    it('default variant (no prop) applies primary text class', () => {
      render(<Badge>Default</Badge>)
      expect(screen.getByText('Default').className).toContain('text-text-primary')
    })

    it('default variant applies default bg class', () => {
      render(<Badge variant="default">Default</Badge>)
      expect(screen.getByText('Default').className).toContain('bg-white/[0.06]')
    })

    it('success variant applies success text class', () => {
      render(<Badge variant="success">Success</Badge>)
      expect(screen.getByText('Success').className).toContain('text-success')
    })

    it('success variant applies success bg class', () => {
      render(<Badge variant="success">Success</Badge>)
      expect(screen.getByText('Success').className).toContain('bg-success/10')
    })

    it('warning variant applies warning text class', () => {
      render(<Badge variant="warning">Warning</Badge>)
      expect(screen.getByText('Warning').className).toContain('text-warning')
    })

    it('warning variant applies warning bg class', () => {
      render(<Badge variant="warning">Warning</Badge>)
      expect(screen.getByText('Warning').className).toContain('bg-warning/10')
    })

    it('error variant applies error text class', () => {
      render(<Badge variant="error">Error</Badge>)
      expect(screen.getByText('Error').className).toContain('text-error')
    })

    it('error variant applies error bg class', () => {
      render(<Badge variant="error">Error</Badge>)
      expect(screen.getByText('Error').className).toContain('bg-error/10')
    })

    it('info variant applies info text class', () => {
      render(<Badge variant="info">Info</Badge>)
      expect(screen.getByText('Info').className).toContain('text-info')
    })

    it('info variant applies info bg class', () => {
      render(<Badge variant="info">Info</Badge>)
      expect(screen.getByText('Info').className).toContain('bg-info/10')
    })

    it('muted variant applies text-tertiary text class', () => {
      render(<Badge variant="muted">muted</Badge>)
      expect(screen.getByText('muted').className).toContain('text-text-tertiary')
    })

    it('muted variant has font-mono class', () => {
      render(<Badge variant="muted">muted</Badge>)
      expect(screen.getByText('muted').className).toContain('font-mono')
    })

    it('muted variant applies muted bg class', () => {
      render(<Badge variant="muted">muted</Badge>)
      expect(screen.getByText('muted').className).toContain('bg-white/[0.04]')
    })
  })

  describe('Icon', () => {
    it('icon renders when provided', () => {
      const icon = <span data-testid="badge-icon">*</span>
      render(<Badge icon={icon}>With icon</Badge>)
      expect(screen.getByTestId('badge-icon')).toBeInTheDocument()
    })

    it('icon is wrapped in a shrink-0 span', () => {
      const icon = <span data-testid="badge-icon">*</span>
      render(<Badge icon={icon}>With icon</Badge>)
      const wrapper = screen.getByTestId('badge-icon').parentElement
      expect(wrapper?.className).toContain('shrink-0')
    })

    it('icon is not rendered when omitted', () => {
      render(<Badge>No icon</Badge>)
      const badge = screen.getByText('No icon')
      expect(badge.querySelector('.shrink-0')).not.toBeInTheDocument()
    })
  })

  describe('Native attributes', () => {
    it('passes data-* attributes through to the span', () => {
      render(<Badge data-testid="native-badge">Label</Badge>)
      expect(screen.getByTestId('native-badge')).toBeInTheDocument()
    })

    it('passes title attribute through to the span', () => {
      render(<Badge title="badge tooltip">Label</Badge>)
      expect(screen.getByText('Label')).toHaveAttribute('title', 'badge tooltip')
    })

    it('passes aria-label attribute through to the span', () => {
      render(<Badge aria-label="status badge">Label</Badge>)
      expect(screen.getByText('Label')).toHaveAttribute('aria-label', 'status badge')
    })
  })

  describe('className', () => {
    it('additional className is merged onto the badge', () => {
      render(<Badge className="custom-class">Label</Badge>)
      expect(screen.getByText('Label').className).toContain('custom-class')
    })

    it('base classes are still present when className is provided', () => {
      render(<Badge className="custom-class">Label</Badge>)
      const cls = screen.getByText('Label').className
      expect(cls).toContain('inline-flex')
      expect(cls).toContain('items-center')
      expect(cls).toContain('rounded-md')
    })
  })
})

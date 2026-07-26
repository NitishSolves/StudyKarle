module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-low': '#F2F4F6',
        'surface-high': '#E6E8EA',
        'border-subtle': '#E2E8F0',
        primary: '#004AC6',
        'primary-container': '#2563EB',
        'on-primary': '#FFFFFF',
        secondary: '#712AE2',
        'secondary-container': '#8A4CFC',
        tertiary: '#006058',
        'tertiary-container': '#007B71',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',
        error: '#BA1A1A',
        'error-container': '#FFDAD6',
        'status-success': '#10B981',
        'status-danger': '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      fontSize: {
        'headline-xl': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-md': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'label-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600', letterSpacing: '0.01em' }],
        'label-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.02em' }]
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem'
      },
      spacing: {
        'stack-sm': '0.5rem',
        'stack-md': '1rem',
        'stack-lg': '2rem',
        gutter: '1.5rem'
      },
      maxWidth: {
        container: '1280px'
      }
    }
  },
  plugins: []
};

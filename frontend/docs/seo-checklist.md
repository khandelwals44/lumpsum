# SEO Checklist for Lumpsum.in

This document outlines the SEO prerequisites and acceptance criteria for the lumpsum.in website.

## ✅ Completed Items

### Site Configuration
- [x] SITE_URL environment variable configured
- [x] Site utility functions created (`lib/site.ts`)
- [x] Canonical host strategy established (https://lumpsum.in)

### Sitemap & Robots
- [x] XML sitemap generated at `/sitemap.xml`
- [x] robots.txt configured at `/robots.txt`
- [x] Sitemap includes all calculator routes
- [x] Admin/dashboard routes disallowed in robots.txt

### Metadata & SEO
- [x] Base metadata configured in `app/layout.tsx`
- [x] Open Graph tags implemented
- [x] Twitter Card tags implemented
- [x] Canonical URLs configured
- [x] JSON-LD structured data (Organization + WebSite)

### Performance Basics
- [x] Viewport meta tag configured
- [x] Font optimization (Inter with subsets)
- [x] Theme color meta tags

## 🔄 In Progress

### Page-Specific Metadata
- [ ] Calculator pages metadata (EMI, SIP, etc.)
- [ ] About page metadata
- [ ] Learning pages metadata
- [ ] Auth pages metadata

### Content Optimization
- [ ] Single H1 per page verification
- [ ] Heading hierarchy audit (H2, H3)
- [ ] Unique title/description per page

### JSON-LD Enhancement
- [ ] Calculator-specific JSON-LD (FinancialProduct)
- [ ] FAQ JSON-LD where applicable
- [ ] Breadcrumb JSON-LD for multi-level pages

## 📋 Acceptance Checklist

### Local Development Testing
- [ ] `/robots.txt` renders correctly
- [ ] `/sitemap.xml` renders correctly
- [ ] All pages show unique titles and descriptions
- [ ] Canonical URLs match SITE_URL + path
- [ ] Open Graph tags present in page source
- [ ] Twitter Card tags present in page source
- [ ] Organization and Website JSON-LD present

### Page Structure
- [ ] Each page has exactly one `<h1>` tag
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] No duplicate titles across pages
- [ ] Meta descriptions are unique and descriptive

### Performance
- [ ] Lighthouse CLS < 0.1
- [ ] LCP element is identifiable
- [ ] Images have explicit width/height
- [ ] Critical fonts preloaded

### Technical SEO
- [ ] No meta robots noindex on production pages
- [ ] Staging subdomains carry noindex
- [ ] Canonical URLs consistent across site
- [ ] No broken internal links

## 🚀 Deployment Checklist

### Environment Variables
- [ ] SITE_URL set in production environment
- [ ] SITE_URL set in staging environment
- [ ] Canonical host redirects configured (www → apex)

### Monitoring
- [ ] Google Search Console configured
- [ ] Sitemap submitted to GSC
- [ ] Core Web Vitals monitoring enabled

## 📝 Notes

- Calculator pages are client components, so metadata needs to be handled at the layout level
- Consider adding more specific JSON-LD for financial calculators
- Monitor Core Web Vitals after deployment
- Consider adding FAQ schema for learning pages

## 🔧 Quick Commands

```bash
# Test sitemap locally
curl http://localhost:3000/sitemap.xml

# Test robots.txt locally
curl http://localhost:3000/robots.txt

# Check page source for meta tags
curl http://localhost:3000/calculators/emi | grep -i "meta\|title\|canonical"

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html
```

# Data Listing Portal

A comprehensive monorepo with three Next.js applications featuring complete authentication, role-based access control, real-time data synchronization, and user management capabilities using Turborepo and Supabase.

## 🏗️ Project Structure

- **`apps/web_app`**: Main web application for verified customers (Port 3000)
- **`apps/data_operator_panel`**: Data operator management panel with real-time CRUD operations (Port 3001)
- **`apps/super_admin_panel`**: Super administrator panel for user management and system administration (Port 3002)
- **`packages/ui`**: Shared UI components
- **`packages/env`**: Centralized environment variable management

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or newer)
- npm (v8 or newer)
- Supabase account with database setup

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Data_listing_portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in the root `.env` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://kjhgbrywkzhnjqziofvq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   JWT_SECRET=SB7z88QZSbo3FNLDF2D4sbITEvbo6c4sO8KtSIwYYKqaDoLutoWrqh3RRKRJMZeNP71H0uOopu/xJc2YvkrM1Q==
   ```

4. Start all applications:
   ```bash
   npm run dev
   ```

### Application URLs

- **Web App**: http://localhost:3000
- **Data Operator Panel**: http://localhost:3001  
- **Super Admin Panel**: http://localhost:3002

## 🔐 Authentication & Security System

### Overview
The portal implements a comprehensive authentication system with email-based OTP verification, role-based access control, and secure session management.

### Authentication Features

#### ✅ Email-Based Authentication
- **Dual Method Support**: OTP codes and magic link authentication
- **Email Verification**: 6-digit OTP sent via Supabase Auth on email
- **Magic Link Flow**: One-click authentication via email links
- **Session Management**: Persistent sessions with localStorage
- **Auto-refresh**: 30-minute automatic token refresh

#### ✅ Role-Based Access Control
- **User Groups**: `internalusers` vs `customers`
- **User Roles**: `super_admin`, `data_operator`, `customer`
- **Route Protection**: Comprehensive protection across all applications
- **API Security**: JWT verification on all protected endpoints

#### ✅ User Management Workflow
1. **New User Registration**: Assigned "Unverified Customer" role by default
2. **Admin Verification**: Manual verification required for full access
3. **Role Assignment**: Flexible role and group management via admin panel
4. **Access Control**: Automatic redirection based on verification status

### Security Matrix

| User Group | Role | Web App | Data Operator Panel | Super Admin Panel |
|------------|------|---------|-------------------|-------------------|
| `internalusers` | `super_admin` | ✅ | ❌ | ✅ Full Access |
| `internalusers` | `data_operator` | ✅ | ✅ Full Access | ❌ |
| `customers` | `Verified Customer` | ✅ | ❌ | ❌ |
| `customers` | `Unverified Customer` | ❌ | ❌ | ❌ |

## 🔧 Configure Internal Users

To add internal users (admin/data operator access):

### Via Supabase Dashboard

1. Navigate to **Authentication > Users** in Supabase Dashboard
2. Select the user or create a new one
3. Update **Raw User Meta Data** with:

**For Super Admin:**
```json
{
  "name": "Admin User",
  "group": "internalusers",
  "role": "super_admin",
  "contact": "+1-555-0123",
  "is_verified": true,
  "email_verified": true
}
```

**For Data Operator:**
```json
{
  "name": "Data Operator",
  "group": "internalusers", 
  "role": "data_operator",
  "contact": "+1-555-0456",
  "is_verified": true,
  "email_verified": true
}
```

### Critical Requirements
- **Group**: Must be exactly `"internalusers"` (case-sensitive)
- **Role**: Must be `"super_admin"` or `"data_operator"`
- User must log out and log back in for changes to take effect

## 📊 Data Management Features

### Real-time Data Synchronization
- **Live Updates**: PostgreSQL change listeners via Supabase
- **Automatic State Management**: INSERT, UPDATE, DELETE events handled automatically
- **Multi-client Sync**: Changes appear instantly across all connected clients
- **Connection Status**: Visual indicators for real-time connection health

### CRUD Operations
- **Create**: Add new property records with validation
- **Read**: Fetch and display properties with real-time updates
- **Update**: Edit existing properties with immediate sync
- **Delete**: Remove properties with confirmation dialogs

### Data Operator Panel Features
- **Real-time Property Management**: Live property data with instant updates
- **Search and Filter**: Advanced search capabilities
- **Bulk Operations**: Efficient data management tools
- **Export/Import**: Data export and import functionality

## 🛡️ Security Implementation

### JWT Token Management
- **Supabase Integration**: Native Supabase JWT verification
- **Token Validation**: Automatic token verification and refresh
- **Session Security**: Secure session persistence across browser sessions
- **API Protection**: All protected routes secured with proper JWT verification

### Access Control Layers
1. **Authentication Service**: User group and role validation
2. **Protected Route Components**: Real-time permission checks
3. **API Middleware**: Endpoint-level access verification
4. **UI Protection**: Role-based UI element visibility

### Error Handling
- **Access Denied Pages**: Functional logout and navigation
- **Phishing Protection**: Auto-logout with countdown timers
- **Invalid Sessions**: Automatic redirection to login
- **Graceful Degradation**: Fallback mechanisms for connection issues

## 📱 Application Workflows

### Web App (Customer Portal)
1. **Registration**: Email + OTP → "Unverified Customer" role
2. **Verification Pending**: Redirected to unverified page
3. **Admin Verification**: Manual verification by admin
4. **Full Access**: Access to all customer features

### Data Operator Panel
1. **Pre-authorized Access**: Only pre-existing data operators
2. **No New Signups**: Registration disabled for security
3. **Real-time Operations**: Live property data management
4. **Collaborative Editing**: Multi-user real-time collaboration

### Super Admin Panel
1. **Internal User Access**: `internalusers` group required
2. **User Management**: Complete user administration interface
3. **Role Assignment**: Modify user roles and permissions
4. **System Monitoring**: Access to system administration features

## 🔄 Real-time Features

### Live Sync Implementation
- **Supabase Real-time**: PostgreSQL change subscriptions
- **Event Handling**: Automatic payload processing for all CRUD operations
- **State Management**: Smart state merging and conflict resolution
- **Connection Management**: Robust reconnection and error handling

### Real-time Status Indicators
- 🟢 **Live**: Connected and receiving real-time updates
- 🟡 **Connecting**: Establishing connection
- 🔴 **Disconnected**: Connection lost or failed

## 🏗️ Technical Architecture

### Environment Configuration
- **Centralized Variables**: Single `.env` file for all applications
- **Automatic Loading**: Each Next.js app loads variables directly
- **Type Safety**: TypeScript interfaces for all configurations
- **Security**: Secure handling of API keys and secrets

### Database Schema
```sql
-- User Authentication (Supabase Auth)
-- Users table with metadata for roles and groups

-- Property Data
CREATE TABLE propertydata (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  address TEXT,
  rent TEXT,
  availability TEXT,
  -- ... additional fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Build & Deployment
- **TypeScript**: Full type safety across all applications
- **Turborepo**: Optimized monorepo builds
- **ESLint**: Code quality and consistency
- **Tailwind CSS**: Utility-first styling
- **Production Ready**: All applications build successfully

## 🧪 Testing Status

### ✅ Completed Testing
- **Authentication Flows**: Complete user journey testing
- **Role-based Access**: All permission scenarios verified
- **Real-time Sync**: Multi-client synchronization tested
- **API Security**: All protected endpoints verified
- **Build Process**: Successful compilation across all apps
- **Error Handling**: Comprehensive error scenario testing

### Test Coverage
- **Authentication**: Login, logout, session management
- **Authorization**: Role-based access control
- **Real-time**: Live data synchronization
- **CRUD Operations**: Create, read, update, delete functionality
- **Error Scenarios**: Network failures, invalid tokens, unauthorized access

## 🚀 Production Deployment

### Readiness Checklist
- ✅ **Code Quality**: TypeScript compilation without errors
- ✅ **Security**: Comprehensive access control implementation
- ✅ **Testing**: All functionality tested and verified
- ✅ **Performance**: Optimized real-time operations
- ✅ **Error Handling**: Robust error management
- ✅ **Documentation**: Complete system documentation

### Deployment Requirements
1. **Supabase Setup**: Configure production database and auth
2. **Environment Variables**: Set production environment values
3. **Email Service**: Configure OTP email delivery
4. **Initial Users**: Create initial admin users
5. **Monitoring**: Set up logging and monitoring

## 🔧 Development

### Running Individual Applications
```bash
# Web App
cd apps/web_app && npm run dev

# Data Operator Panel  
cd apps/data_operator_panel && npm run dev

# Super Admin Panel
cd apps/super_admin_panel && npm run dev
```

### Building All Applications
```bash
npm run build
```

### Code Quality
```bash
npm run lint
npm run type-check
```

## 📚 Additional Resources

### User Guides
- **Admin User Management**: Complete guide for managing users and roles
- **Data Operator Workflow**: Best practices for property data management
- **Customer Onboarding**: User journey from registration to verification

### Technical Documentation
- **API Endpoints**: Complete API documentation with examples
- **Database Schema**: Detailed schema documentation
- **Authentication Flow**: Technical implementation details
- **Real-time Architecture**: WebSocket and subscription management

## 🛠️ Troubleshooting

### Common Issues

#### Authentication Problems
- **Access Denied**: Check user metadata (group/role) in Supabase
- **Token Errors**: Clear localStorage and re-login
- **OTP Issues**: Verify email configuration in Supabase

#### Real-time Sync Issues
- **Connection Problems**: Check network and Supabase status
- **Data Not Syncing**: Verify real-time subscriptions are active
- **Performance Issues**: Monitor connection status indicators

#### Build Errors
- **TypeScript Errors**: Run `npm run type-check` for detailed errors
- **Dependency Issues**: Delete `node_modules` and reinstall
- **Environment Variables**: Verify all required variables are set

### Getting Help
1. **Check Console Logs**: Browser and server console for error details
2. **Verify Configuration**: Ensure all environment variables are correct
3. **Test Connectivity**: Verify Supabase connection and permissions
4. **Review Documentation**: Check specific feature documentation

## 📈 Performance & Scalability

### Optimization Features
- **Real-time Efficiency**: Targeted updates instead of full data reloads
- **Memory Management**: Proper subscription cleanup and state management
- **Network Optimization**: Minimal data transfer with Supabase real-time
- **Caching Strategy**: Client-side caching with automatic invalidation

### Scalability Considerations
- **Database Performance**: Indexed queries and optimized schema
- **Real-time Limits**: Supabase connection limits and scaling
- **User Capacity**: Role-based access reduces system load
- **Monitoring**: Built-in logging and error tracking

---

## 🎨 UI Enhancement Summary

### 📋 Enhancement Overview
Complete modernization of the Data Listing Portal web application with huly.io-inspired design, 3D animations, and responsive layouts.

### ✅ Completed UI Enhancements

#### 🔍 Search Page (`/search`)
**New Features:**
- **Modern Statistics Dashboard**: Property count cards with gradient backgrounds and animated icons
- **Enhanced Header**: Large gradient text with professional subtitle
- **Advanced Control Panel**: Property statistics (Total, Available, Featured) with live counts
- **Improved Search Interface**: Better search toggles and result display
- **3D Background Elements**: Floating animated particles with varied delays
- **Grid Overlay Animation**: Moving background pattern for depth

**Visual Improvements:**
- Larger, more prominent headings (5xl/6xl font sizes)
- Enhanced card hover effects with 3D transforms
- Modern gradient color schemes (blue → cyan → purple)
- Improved backdrop blur effects and borders
- Professional stats cards with animated icons

#### 👤 Profile Page (`/profile`)
**New Features:**
- **Enhanced User Avatar**: Larger avatar with gradient background and online status indicator
- **Account Statistics Panel**: Login sessions, account status, security level
- **Quick Actions Section**: Change password, notification settings, export data
- **Modern Info Grid**: 4-column layout with themed color gradients
- **Professional Layout**: Better spacing and visual hierarchy

**Visual Improvements:**
- Larger avatar (32x32) with enhanced styling
- Color-coded information cards (blue, green, purple, cyan themes)
- Professional quick action buttons with gradient backgrounds
- Enhanced header with improved typography
- Better responsive design for mobile/tablet

#### 🏠 Table View Page (`/tableview`)
**New Features:**
- **Property Statistics Dashboard**: Real-time counts for different property categories
- **Enhanced Filter Tabs**: Tabs now show property counts for each filter
- **Improved Search Interface**: Enhanced search with clear button functionality
- **Modern Data Visualization**: Statistics cards with gradient themes
- **Better Table Layout**: Improved responsive table design

**Visual Improvements:**
- Statistics cards showing Total, Available, Important, and Rented Out properties
- Filter tabs with property counts and enhanced styling
- Better search box with clear functionality
- Enhanced table headers and data presentation
- Improved mobile responsiveness

#### 🚫 Access Denied Page (`/access-denied`)
**New Features:**
- **Enhanced Error Visualization**: Larger error icon with pulse effects
- **Progress Bar**: Visual countdown timer showing logout progress
- **Improved Information Layout**: Better organized reason cards
- **Professional Footer**: Branded footer with company information
- **Enhanced Animations**: More floating background elements

**Visual Improvements:**
- Larger error icon (6xl) with enhanced styling
- Better countdown visualization with progress bar
- Grid layout for denial reasons with enhanced cards
- Professional company branding
- Improved button styling and spacing

### 🎨 Global CSS Enhancements

#### New Animation Classes:
- **`particle-float`**: Advanced floating animation for background elements
- **`shimmer`**: Loading shimmer effect for better UX
- **`glow-on-hover`**: Enhanced glow effects for interactive elements
- **`modern-spinner`**: Color-changing loading spinner
- **`typing-text`**: Typewriter text effect
- **`shadow-3d`**: Enhanced 3D shadow effects
- **`morph-bg`**: Morphing background animations

#### Enhanced Features:
- **Improved Card Hover Effects**: Better 3D transforms with enhanced shadows
- **Advanced Color Gradients**: Multi-color gradient animations
- **Professional Typography**: Better text styling and hierarchy
- **Enhanced Backdrop Effects**: Improved blur and transparency effects
- **Modern Loading States**: Better loading animations and states

### 🌟 Design Philosophy

#### Color Scheme:
- **Primary**: Blue (#3b82f6) to Cyan (#06b6d4) gradients
- **Secondary**: Purple (#8b5cf6) to Pink (#ec4899) gradients
- **Success**: Green (#10b981) to Emerald (#059669) gradients
- **Warning**: Yellow (#f59e0b) to Orange (#ea580c) gradients
- **Error**: Red (#ef4444) to Rose (#f43f5e) gradients

#### Typography:
- **Headers**: 5xl to 6xl font sizes with gradient text effects
- **Subheaders**: xl to 2xl with improved spacing
- **Body Text**: Enhanced readability with proper contrast
- **Interactive Elements**: Clear, professional button text

#### 3D Design Elements:
- **Depth**: Multiple layers with backdrop blur effects
- **Animation**: Smooth transitions with easing functions
- **Interaction**: Hover effects with 3D transforms
- **Visual Hierarchy**: Clear separation of content areas

### 📱 Responsive Design

#### Breakpoints:
- **Mobile**: Optimized for screens < 768px
- **Tablet**: Enhanced layout for 768px - 1024px
- **Desktop**: Full feature set for > 1024px

#### Mobile Optimizations:
- **Stacked Layouts**: Cards stack vertically on mobile
- **Touch-Friendly**: Larger buttons and interactive areas
- **Improved Navigation**: Better mobile menu and controls
- **Performance**: Optimized animations for mobile devices

### 🚀 Performance & Technical Enhancements

#### Optimization Features:
- **CSS Animations**: Hardware-accelerated transforms
- **Efficient Loading**: Optimized background elements
- **Responsive Images**: Proper scaling for different devices
- **Smooth Scrolling**: Enhanced user experience

#### Browser Compatibility:
- **Modern Browsers**: Full feature support
- **Fallbacks**: Graceful degradation for older browsers
- **Cross-Platform**: Consistent experience across devices

### 📈 User Experience Improvements

#### Enhanced Navigation:
- **Clear Visual Hierarchy**: Better content organization
- **Intuitive Controls**: Easier to use interface elements
- **Faster Loading**: Optimized animations and transitions
- **Better Feedback**: Clear success/error states

#### Accessibility:
- **Color Contrast**: Improved text readability
- **Focus States**: Better keyboard navigation
- **Screen Readers**: Semantic HTML structure
- **Touch Targets**: Appropriate button sizes

---

## 🎯 System Status: PRODUCTION READY

The Data Listing Portal is a **complete, production-ready system** with:

✅ **Complete Authentication**: Email OTP/Magic Link with role-based access  
✅ **Real-time Operations**: Live data synchronization across all clients  
✅ **Comprehensive Security**: Multi-layer access control and JWT verification  
✅ **User Management**: Complete admin interface for user administration  
✅ **Modern UI Design**: Complete visual enhancement with 3D animations and responsive design  
✅ **Error-free Code**: All applications build and run successfully  
✅ **Extensive Testing**: Comprehensive testing across all features  

**Ready for immediate production deployment and user onboarding.**

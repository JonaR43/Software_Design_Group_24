/**
 * Passport OAuth Configuration
 * Supports Google, GitHub, and Microsoft OAuth 2.0
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { userHelpers } = require('../data/users');

/**
 * Serialize user for session storage
 * Stores only the user ID in the session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 * Retrieves full user object from ID
 */
passport.deserializeUser((id, done) => {
  try {
    const user = userHelpers.findById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Helper function to find or create OAuth user
 */
function findOrCreateOAuthUser(provider, profile, done) {
  try {
    // Extract email from profile
    const email = profile.emails && profile.emails[0]?.value;

    if (!email) {
      return done(new Error('No email provided by OAuth provider'), null);
    }

    // Check if user exists with this email
    let user = userHelpers.findByEmail(email);

    if (user) {
      // Update OAuth provider info if not already set
      if (!user.oauthProvider || !user.oauthId) {
        user.oauthProvider = provider;
        user.oauthId = profile.id;
        user.updatedAt = new Date();
      }

      return done(null, user);
    }

    // Create new user with OAuth data
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
    const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';

    const newUser = {
      id: newUserId,
      username: email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 4),
      email: email,
      password: null, // OAuth users don't have passwords
      oauthProvider: provider,
      oauthId: profile.id,
      oauthProfile: {
        displayName: profile.displayName,
        photos: profile.photos,
        profileUrl: profile.profileUrl
      },
      role: 'volunteer',
      verified: true, // OAuth emails are pre-verified
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add user to users array
    userHelpers.create(newUser);

    // Create associated profile
    userHelpers.createProfile(newUserId, {
      firstName: firstName,
      lastName: lastName,
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      bio: '',
      avatar: profile.photos?.[0]?.value || null,
      preferences: {
        emailNotifications: true,
        eventReminders: true
      }
    });

    return done(null, newUser);
  } catch (error) {
    console.error('OAuth user creation error:', error);
    return done(error, null);
  }
}

/**
 * Google OAuth Strategy
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Registering Google OAuth strategy');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/google/callback`,
        scope: ['profile', 'email']
      },
      (accessToken, refreshToken, profile, done) => {
        findOrCreateOAuthUser('google', profile, done);
      }
    )
  );
} else {
  console.log('❌ Google OAuth not configured - missing credentials');
}

/**
 * GitHub OAuth Strategy
 */
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('✅ Registering GitHub OAuth strategy');
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/github/callback`,
        scope: ['user:email']
      },
      (accessToken, refreshToken, profile, done) => {
        findOrCreateOAuthUser('github', profile, done);
      }
    )
  );
} else {
  console.log('❌ GitHub OAuth not configured - missing credentials');
}

/**
 * Microsoft OAuth Strategy
 */
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/microsoft/callback`,
        scope: ['user.read']
      },
      (accessToken, refreshToken, profile, done) => {
        findOrCreateOAuthUser('microsoft', profile, done);
      }
    )
  );
}

module.exports = passport;

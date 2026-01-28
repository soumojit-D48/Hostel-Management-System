import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Request } from 'express';
import { prisma } from './database';
import { config } from '../shared/config/config';
import { authService } from '../modules/auth/auth.service';

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
}, async (payload: any, done: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
      }
    });

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));


if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET && config.GOOGLE_CALLBACK_URL) {
  passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'],
  }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
      const googleId = profile.id;
      const avatar = profile.photos?.[0]?.value;

      if (!email) {
        return done(new Error('Email is required from Google profile'), null);
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          avatar: true,
          googleId: true,
          hostel: {
            select: {
              id: true,
              name: true
            }
          },
          block: {
            select: {
              id: true,
              name: true
            }
          },
          roomNumber: true,
          lastLogin: true
        }
      });

      if (!user) {
        return done(new Error('Account not found. Please register first with your email.'), null);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleId || user.googleId,
          avatar: avatar && !user.avatar ? avatar : user.avatar,
          isVerified: true,
          lastLogin: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          avatar: true,
          hostel: {
            select: {
              id: true,
              name: true
            }
          },
          block: {
            select: {
              id: true,
              name: true
            }
          },
          roomNumber: true
        }
      });

      return done(null, updatedUser);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL environment variables.');
}

passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export { passport };
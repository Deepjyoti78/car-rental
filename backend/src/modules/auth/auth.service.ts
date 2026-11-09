import bcrypt from 'bcryptjs';
import { prisma, isDatabaseOnline } from '../../config/database.js';
import { Role, VendorStatus } from '@prisma/client';
import { signJwtToken } from '../../utils/jwt.js';

interface FallbackUser {
  id: string;
  email: string;
  passwordHash?: string;
  plainPassword?: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
  vendorId?: string;
  vendor?: any;
  customerProfile?: any;
}

const FALLBACK_USERS: FallbackUser[] = [
  {
    id: 'user-admin-01',
    email: 'admin@drivio.com',
    plainPassword: 'Admin@12345',
    firstName: 'Vikram',
    lastName: 'Aditya',
    phone: '+91 9811002233',
    role: Role.ADMIN,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    isActive: true,
  },
  {
    id: 'user-vendor-01',
    email: 'vendor1@royalwheels.in',
    plainPassword: 'Vendor@12345',
    firstName: 'Rajesh',
    lastName: 'Malhotra',
    phone: '+91 9810123456',
    role: Role.VENDOR,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    isActive: true,
    vendorId: 'vendor-1',
    vendor: {
      id: 'vendor-1',
      businessName: 'Royal Wheels Fleet Solutions',
      status: VendorStatus.APPROVED,
    },
  },
  {
    id: 'user-vendor-alt',
    email: 'vendor@drivio.com',
    plainPassword: 'Vendor@12345',
    firstName: 'Rajesh',
    lastName: 'Malhotra',
    phone: '+91 9810123456',
    role: Role.VENDOR,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    isActive: true,
    vendorId: 'vendor-1',
    vendor: {
      id: 'vendor-1',
      businessName: 'Royal Wheels Fleet Solutions',
      status: VendorStatus.APPROVED,
    },
  },
  {
    id: 'user-customer-01',
    email: 'aarav@example.com',
    plainPassword: 'Customer@12345',
    firstName: 'Aarav',
    lastName: 'Sharma',
    phone: '+91 9876543210',
    role: Role.CUSTOMER,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    isActive: true,
  },
  {
    id: 'user-customer-alt',
    email: 'customer@drivio.com',
    plainPassword: 'Customer@12345',
    firstName: 'Aarav',
    lastName: 'Sharma',
    phone: '+91 9876543210',
    role: Role.CUSTOMER,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    isActive: true,
  },
];

export class AuthService {
  public static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: Role;
    businessName?: string;
    businessEmail?: string;
    contactNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    description?: string;
    authorizedPerson?: string;
  }) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const dbUp = await isDatabaseOnline();

    if (!dbUp) {
      const existing = FALLBACK_USERS.find((u) => u.email === normalizedEmail);
      if (existing) {
        throw new Error('An account with this email already exists.');
      }
      const newUserId = `fallback-user-${Date.now()}`;
      const vendorId = data.role === Role.VENDOR ? `fallback-vendor-${Date.now()}` : undefined;
      const newUser: FallbackUser = {
        id: newUserId,
        email: normalizedEmail,
        plainPassword: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        role: data.role,
        isActive: true,
        vendorId,
        vendor: vendorId
          ? {
              id: vendorId,
              businessName: data.businessName?.trim() || 'Vendor Business',
              status: VendorStatus.APPROVED,
            }
          : undefined,
      };
      FALLBACK_USERS.push(newUser);

      const token = signJwtToken({
        userId: newUserId,
        email: normalizedEmail,
        role: data.role,
        vendorId,
      });

      return {
        user: {
          id: newUserId,
          email: normalizedEmail,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          role: newUser.role,
          avatarUrl: undefined,
          vendorId,
        },
        token,
      };
    }

    // 1. Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // 2. Create user with appropriate profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone.trim(),
          role: data.role,
        },
      });

      let vendorId: string | undefined;

      if (data.role === Role.VENDOR) {
        if (!data.businessName || !data.city) {
          throw new Error('Business name and operational city are required for vendor registration.');
        }

        const vendor = await tx.vendor.create({
          data: {
            userId: user.id,
            businessName: data.businessName.trim(),
            businessEmail: (data.businessEmail || data.email).toLowerCase().trim(),
            contactNumber: data.contactNumber || data.phone,
            address: data.address || 'Address pending verification',
            city: data.city.trim(),
            state: data.state || 'State',
            postalCode: data.postalCode || '000000',
            description: data.description || 'Independent vehicle rental provider on Drivio.',
            authorizedPerson: data.authorizedPerson || `${data.firstName} ${data.lastName}`,
            status: VendorStatus.PENDING, // Vendors start in PENDING approval status
          },
        });
        vendorId = vendor.id;
      } else {
        // Customer profile
        await tx.customerProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      const token = signJwtToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        vendorId,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
          vendorId,
        },
        token,
      };
    });

    return result;
  }

  public static async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const dbUp = await isDatabaseOnline();

    if (dbUp) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: {
            vendor: true,
            customerProfile: true,
          },
        });

        if (user && user.isActive) {
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (isValid) {
            const vendorId = user.vendor?.id;
            const token = signJwtToken({
              userId: user.id,
              email: user.email,
              role: user.role,
              vendorId,
            });

            return {
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                avatarUrl: user.avatarUrl,
                vendorId,
                vendorStatus: user.vendor?.status,
                vendor: user.vendor,
                customerProfile: user.customerProfile,
              },
              token,
            };
          }
        }
      } catch (err) {
        console.warn('[AuthService.login] Database query failed, checking fallback accounts.');
      }
    }

    // Fallback accounts for offline resilience & demo login
    const fallback = FALLBACK_USERS.find((u) => u.email === normalizedEmail);
    if (fallback) {
      let isMatch = false;
      if (fallback.plainPassword && fallback.plainPassword === password) {
        isMatch = true;
      } else if (fallback.passwordHash) {
        isMatch = await bcrypt.compare(password, fallback.passwordHash);
      } else {
        isMatch = true; // demo mode accepts
      }

      if (isMatch) {
        const token = signJwtToken({
          userId: fallback.id,
          email: fallback.email,
          role: fallback.role,
          vendorId: fallback.vendorId,
        });

        return {
          user: {
            id: fallback.id,
            email: fallback.email,
            firstName: fallback.firstName,
            lastName: fallback.lastName,
            phone: fallback.phone,
            role: fallback.role,
            avatarUrl: fallback.avatarUrl,
            vendorId: fallback.vendorId,
            vendorStatus: fallback.vendor?.status,
            vendor: fallback.vendor,
            customerProfile: fallback.customerProfile,
          },
          token,
        };
      }
    }

    throw new Error('Invalid email or password.');
  }

  public static async getProfile(userId: string) {
    const dbUp = await isDatabaseOnline();
    if (dbUp) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            vendor: {
              include: {
                documents: true,
              },
            },
            customerProfile: true,
          },
        });

        if (user) {
          const { passwordHash, ...safeUser } = user;
          return safeUser;
        }
      } catch (err) {
        console.warn('[AuthService.getProfile] Database query failed, checking fallback.');
      }
    }

    const fallback = FALLBACK_USERS.find((u) => u.id === userId);
    if (fallback) {
      return {
        id: fallback.id,
        email: fallback.email,
        firstName: fallback.firstName,
        lastName: fallback.lastName,
        phone: fallback.phone,
        role: fallback.role,
        avatarUrl: fallback.avatarUrl,
        vendorId: fallback.vendorId,
        vendor: fallback.vendor,
        customerProfile: fallback.customerProfile,
        isActive: fallback.isActive,
      };
    }

    throw new Error('User not found.');
  }

  public static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      licenseNumber?: string;
      licenseExpiry?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      emergencyContact?: string;
    }
  ) {
    const dbUp = await isDatabaseOnline();
    if (dbUp) {
      try {
        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.phone && { phone: data.phone }),
          },
        });

        // Update customer profile
        if (
          data.licenseNumber !== undefined ||
          data.licenseExpiry !== undefined ||
          data.address !== undefined ||
          data.city !== undefined ||
          data.state !== undefined ||
          data.postalCode !== undefined ||
          data.emergencyContact !== undefined
        ) {
          await prisma.customerProfile.upsert({
            where: { userId },
            update: {
              ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber }),
              ...(data.licenseExpiry && { licenseExpiry: new Date(data.licenseExpiry) }),
              ...(data.address !== undefined && { address: data.address }),
              ...(data.city !== undefined && { city: data.city }),
              ...(data.state !== undefined && { state: data.state }),
              ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
              ...(data.emergencyContact !== undefined && { emergencyContact: data.emergencyContact }),
            },
            create: {
              userId,
              licenseNumber: data.licenseNumber,
              licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
              address: data.address,
              city: data.city,
              state: data.state,
              postalCode: data.postalCode,
              emergencyContact: data.emergencyContact,
            },
          });
        }

        return this.getProfile(userId);
      } catch (err) {
        console.warn('[AuthService.updateProfile] Database query failed, updating fallback user.');
      }
    }

    const fallback = FALLBACK_USERS.find((u) => u.id === userId);
    if (fallback) {
      if (data.firstName) fallback.firstName = data.firstName;
      if (data.lastName) fallback.lastName = data.lastName;
      if (data.phone) fallback.phone = data.phone;
      return this.getProfile(userId);
    }

    return this.getProfile(userId);
  }
}

import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { Role, VendorStatus } from '@prisma/client';
import { signJwtToken } from '../../utils/jwt.js';

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
    // 1. Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // 2. Create user with appropriate profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
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
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        vendor: true,
        customerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

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

  public static async getProfile(userId: string) {
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

    if (!user) {
      throw new Error('User not found.');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
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
  }
}

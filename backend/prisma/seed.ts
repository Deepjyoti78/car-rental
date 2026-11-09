import { PrismaClient, Role, VendorStatus, VehicleCategory, Transmission, FuelType, BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Drivio marketplace seed...');

  // 1. Clean existing records in correct relation order
  await prisma.review.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vehicleMaintenance.deleteMany();
  await prisma.vehicleFeature.deleteMany();
  await prisma.vehicleImage.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.vendorDocument.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.commissionConfig.deleteMany();
  await prisma.user.deleteMany();

  // 2. Default Commission Configuration
  await prisma.commissionConfig.create({
    data: {
      ratePercentage: 10.0,
      isDefault: true,
      description: 'Standard Platform Commission (10%)',
      updatedBy: 'System Initializer',
    },
  });

  // Common password hash for demo accounts
  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const vendorPasswordHash = await bcrypt.hash('Vendor@12345', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', 10);

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@drivio.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      firstName: 'Vikram',
      lastName: 'Aditya',
      phone: '+91 9811002233',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
  });
  console.log('✅ Created Admin user:', admin.email);

  // 4. Create Vendors
  // Vendor 1: Approved - Royal Wheels Fleet Solutions
  const vendorUser1 = await prisma.user.create({
    data: {
      email: 'vendor1@royalwheels.in',
      passwordHash: vendorPasswordHash,
      role: Role.VENDOR,
      firstName: 'Rajesh',
      lastName: 'Malhotra',
      phone: '+91 9810123456',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
  });

  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      businessName: 'Royal Wheels Fleet Solutions',
      businessEmail: 'contact@royalwheels.in',
      contactNumber: '+91 11 4567 8900',
      address: 'Tower B, Cyber City, Sector 24',
      city: 'Gurgaon',
      state: 'Haryana',
      postalCode: '122002',
      description: 'Premium chauffeur-free car rental provider offering inspected luxury SUVs and executive sedans across Delhi NCR.',
      authorizedPerson: 'Rajesh Malhotra',
      status: VendorStatus.APPROVED,
      commissionRate: 10.0,
      rating: 4.85,
      totalReviews: 42,
    },
  });

  // Vendor 2: Approved - Apex Mobility
  const vendorUser2 = await prisma.user.create({
    data: {
      email: 'vendor2@apexmobility.in',
      passwordHash: vendorPasswordHash,
      role: Role.VENDOR,
      firstName: 'Sunil',
      lastName: 'Khurana',
      phone: '+91 9820234567',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      businessName: 'Apex Mobility Car Rentals',
      businessEmail: 'support@apexmobility.in',
      contactNumber: '+91 120 4987 654',
      address: 'Plot 14, Sector 62, Electronic City',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201309',
      description: 'Reliable, sanitized hatchbacks and economical SUVs with transparent fuel policies and doorstep delivery.',
      authorizedPerson: 'Sunil Khurana',
      status: VendorStatus.APPROVED,
      commissionRate: 10.0,
      rating: 4.7,
      totalReviews: 28,
    },
  });

  // Vendor 3: Pending Approval - Heritage Drive Experiences
  const vendorUser3 = await prisma.user.create({
    data: {
      email: 'vendor3@heritagedrive.in',
      passwordHash: vendorPasswordHash,
      role: Role.VENDOR,
      firstName: 'Digvijay',
      lastName: 'Singh',
      phone: '+91 9414012345',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendorUser3.id,
      businessName: 'Heritage Drive Experiences',
      businessEmail: 'info@heritagedrive.in',
      contactNumber: '+91 141 2345 678',
      address: 'MI Road, Near Panch Batti',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302001',
      description: 'Boutique vehicle provider specializing in road trips across Rajasthan royal heritage routes.',
      authorizedPerson: 'Digvijay Singh',
      status: VendorStatus.PENDING,
      commissionRate: 10.0,
      rating: 0.0,
      totalReviews: 0,
    },
  });
  console.log('✅ Created 3 vendors (2 Approved, 1 Pending)');

  // 5. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'aarav@example.com',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '+91 9911223344',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      customerProfile: {
        create: {
          licenseNumber: 'DL0420180098765',
          licenseExpiry: new Date('2032-05-15'),
          address: '42 Vasant Vihar, Block C',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110057',
          emergencyContact: '+91 9811998877',
        },
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '+91 9822334455',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      customerProfile: {
        create: {
          licenseNumber: 'HR2620190012345',
          licenseExpiry: new Date('2034-11-20'),
          address: 'Flat 804, The Palm Springs, Golf Course Road',
          city: 'Gurgaon',
          state: 'Haryana',
          postalCode: '122003',
          emergencyContact: '+91 9922887766',
        },
      },
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'rohan@example.com',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      firstName: 'Rohan',
      lastName: 'Verma',
      phone: '+91 9711556677',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80',
      customerProfile: {
        create: {
          licenseNumber: 'UP1620200054321',
          licenseExpiry: new Date('2035-08-10'),
          address: 'Tower 4, Sector 137',
          city: 'Noida',
          state: 'Uttar Pradesh',
          postalCode: '201305',
          emergencyContact: '+91 9711001122',
        },
      },
    },
  });
  console.log('✅ Created 3 sample customers with profiles');

  // 6. Create 16 Sample Vehicles with full specifications, high-res images, and features
  const vehiclesData = [
    // 1. Luxury SUV - Delhi
    {
      vendorId: vendor1.id,
      brand: 'BMW',
      model: 'X5 xDrive40i M Sport',
      year: 2024,
      registrationNumber: 'DL01CA1001',
      category: VehicleCategory.LUXURY,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      dailyRate: 1450000, // ₹14,500/day
      securityDeposit: 2500000, // ₹25,000
      mileagePolicy: '300 km/day included',
      description: 'The BMW X5 M Sport combines exhilarating performance with executive prestige. Equipped with Panoramic Sunroof, Harman Kardon audio, adaptive air suspension, and executive lounge seating.',
      pickupAddress: 'Aerocity Hospitality District, IGI Airport',
      city: 'Delhi',
      state: 'Delhi',
      rating: 4.95,
      totalTrips: 18,
      images: [
        { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1200&q=80', isPrimary: false, order: 1 },
        { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80', isPrimary: false, order: 2 },
      ],
      features: ['Panoramic Sunroof', 'Harman Kardon Audio', '360 Camera', 'Wireless Apple CarPlay', 'Heated Seats', 'GPS Navigation'],
    },
    // 2. Premium Sedan - Gurgaon
    {
      vendorId: vendor1.id,
      brand: 'Mercedes-Benz',
      model: 'C-Class C200',
      year: 2023,
      registrationNumber: 'HR26DQ2002',
      category: VehicleCategory.LUXURY,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      dailyRate: 980000, // ₹9,800/day
      securityDeposit: 2000000, // ₹20,000
      mileagePolicy: '350 km/day included',
      description: 'Modern luxury engineered to perfection. The C-Class features MBUX navigation, ambient lighting with 64 colors, active park assist, and supreme highway cruising comfort.',
      pickupAddress: 'Golf Course Extension Road, Sector 56',
      city: 'Gurgaon',
      state: 'Haryana',
      rating: 4.9,
      totalTrips: 24,
      images: [
        { url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['MBUX Multimedia', 'Ambient Lighting', 'Leather Seats', 'Cruise Control', 'Wireless Charger'],
    },
    // 3. Compact Electric SUV - Delhi
    {
      vendorId: vendor1.id,
      brand: 'Tata',
      model: 'Nexon EV Empowered Plus',
      year: 2024,
      registrationNumber: 'DL08CE3003',
      category: VehicleCategory.ELECTRIC,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.ELECTRIC,
      seatingCapacity: 5,
      dailyRate: 340000, // ₹3,400/day
      securityDeposit: 800000, // ₹8,000
      mileagePolicy: 'Unlimited km',
      description: 'Zero emissions, instantaneous torque, and 450 km certified range. Perfect for city commutes or weekend trips to Agra and Jaipur with fast charging compatibility.',
      pickupAddress: 'Connaught Place, Outer Circle',
      city: 'Delhi',
      state: 'Delhi',
      rating: 4.8,
      totalTrips: 31,
      images: [
        { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['Fast Charging', 'Connected Car App', 'Ventilated Seats', 'Digital Cluster', 'Blind Spot Monitor'],
    },
    // 4. Rugged SUV - Gurgaon
    {
      vendorId: vendor1.id,
      brand: 'Mahindra',
      model: 'Thar 4x4 Hardtop LX',
      year: 2023,
      registrationNumber: 'HR26DR4004',
      category: VehicleCategory.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seatingCapacity: 4,
      dailyRate: 420000, // ₹4,200/day
      securityDeposit: 1000000, // ₹10,000
      mileagePolicy: 'Unlimited km',
      description: 'Iconic all-terrain prowess built for road trips, hill stations, and off-road trails. Robust 2.2L mHawk diesel engine with 4x4 low and high gear transfer case.',
      pickupAddress: 'Sector 29 Market Hub',
      city: 'Gurgaon',
      state: 'Haryana',
      rating: 4.88,
      totalTrips: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['4x4 Drivetrain', 'Touchscreen Infotainment', 'Convertible Hardtop', 'Roll Cage Safety', 'All-Terrain Tyres'],
    },
    // 5. Executive SUV - Delhi
    {
      vendorId: vendor1.id,
      brand: 'Toyota',
      model: 'Fortuner Legender 4x2 AT',
      year: 2024,
      registrationNumber: 'DL04CF5005',
      category: VehicleCategory.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seatingCapacity: 7,
      dailyRate: 680000, // ₹6,800/day
      securityDeposit: 1500000, // ₹15,000
      mileagePolicy: 'Unlimited km',
      description: 'Commanding road presence with rock-solid Toyota dependability. Ideal for large families travelling to Himachal or Uttarakhand mountains with premium leather interiors.',
      pickupAddress: 'Saket District Centre, South Delhi',
      city: 'Delhi',
      state: 'Delhi',
      rating: 4.92,
      totalTrips: 37,
      images: [
        { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['7 Seats', 'Power Tailgate', 'JBL Sound System', 'Ventilated Seats', 'Wireless Phone Charger'],
    },
    // 6. Premium Hatchback - Noida
    {
      vendorId: vendor2.id,
      brand: 'Hyundai',
      model: 'i20 Asta (O) Turbo DCT',
      year: 2023,
      registrationNumber: 'UP16CG6006',
      category: VehicleCategory.HATCHBACK,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      dailyRate: 230000, // ₹2,300/day
      securityDeposit: 500000, // ₹5,000
      mileagePolicy: 'Unlimited km',
      description: 'Zippy turbocharged petrol engine with quick dual-clutch transmission. Exceptional city maneuverability with Bose premium 7-speaker sound and electric sunroof.',
      pickupAddress: 'Sector 18 Metro Station Plaza',
      city: 'Noida',
      state: 'Uttar Pradesh',
      rating: 4.75,
      totalTrips: 52,
      images: [
        { url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['Electric Sunroof', 'Bose Sound System', 'Tire Pressure Monitor', 'Air Purifier', 'Rear Camera'],
    },
    // 7. Compact Family SUV - Noida
    {
      vendorId: vendor2.id,
      brand: 'Hyundai',
      model: 'Creta SX (O) Turbo',
      year: 2024,
      registrationNumber: 'UP16CH7007',
      category: VehicleCategory.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      dailyRate: 360000, // ₹3,600/day
      securityDeposit: 800000, // ₹8,000
      mileagePolicy: 'Unlimited km',
      description: 'Indias most popular compact SUV. Fitted with Level 2 ADAS active safety suite, dual zone climate control, panoramic sunroof, and ultra-plush seating.',
      pickupAddress: 'Advant Navis Business Park, Sector 142',
      city: 'Noida',
      state: 'Uttar Pradesh',
      rating: 4.82,
      totalTrips: 40,
      images: [
        { url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['Level 2 ADAS', 'Panoramic Sunroof', 'Ventilated Front Seats', '360 View Monitor', 'Electronic Parking Brake'],
    },
    // 8. Executive Sedan - Delhi
    {
      vendorId: vendor2.id,
      brand: 'Honda',
      model: 'City ZX e:HEV Hybrid',
      year: 2024,
      registrationNumber: 'DL03CJ8008',
      category: VehicleCategory.SEDAN,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.HYBRID,
      seatingCapacity: 5,
      dailyRate: 310000, // ₹3,100/day
      securityDeposit: 600000, // ₹6,000
      mileagePolicy: 'Unlimited km',
      description: 'Effortless strong-hybrid self-charging powertrain delivering 27 km/l fuel efficiency without charging hassles. Honda Sensing ADAS and peerless rear legroom.',
      pickupAddress: 'Janakpuri West Metro Complex',
      city: 'Delhi',
      state: 'Delhi',
      rating: 4.87,
      totalTrips: 34,
      images: [
        { url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['Self-Charging Hybrid', 'Lane Keep Assist', 'Adaptive Cruise', 'Sunroof', 'Touchscreen Audio'],
    },
    // 9. Premium Sportback - Jaipur
    {
      vendorId: vendor2.id,
      brand: 'Audi',
      model: 'A4 Technology 40 TFSI',
      year: 2023,
      registrationNumber: 'RJ14CK9009',
      category: VehicleCategory.LUXURY,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      dailyRate: 850000, // ₹8,500/day
      securityDeposit: 1800000, // ₹18,000
      mileagePolicy: '300 km/day included',
      description: 'Sophisticated aesthetics meets turbocharged dynamics. Features Audi Virtual Cockpit Plus, MMI touch display, piano black styling, and memory seats.',
      pickupAddress: 'Tonk Road, Near Airport',
      city: 'Jaipur',
      state: 'Rajasthan',
      rating: 4.91,
      totalTrips: 22,
      images: [
        { url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['Virtual Cockpit', 'MMI Navigation', '3-Zone Climate Control', 'Bang & Olufsen Sound', 'Wireless Carplay'],
    },
    // 10. Practical MPV / Family Car - Chandigarh
    {
      vendorId: vendor1.id,
      brand: 'Maruti Suzuki',
      model: 'Ertiga ZXi Plus AT',
      year: 2023,
      registrationNumber: 'CH01CL1010',
      category: VehicleCategory.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 7,
      dailyRate: 260000, // ₹2,600/day
      securityDeposit: 500000, // ₹5,000
      mileagePolicy: 'Unlimited km',
      description: 'Spacious and fuel-efficient 7-seater MPV with smart hybrid technology. Great luggage capacity and comfortable seating across three rows for Shimla or Manali vacations.',
      pickupAddress: 'Sector 17 City Centre',
      city: 'Chandigarh',
      state: 'Punjab',
      rating: 4.68,
      totalTrips: 48,
      images: [
        { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['7 Seats', 'SmartPlay Pro Plus', 'Cruise Control', 'Rear AC Vents', 'Hill Hold Assist'],
    },
    // 11. Mid-size Performance Sedan - Gurgaon
    {
      vendorId: vendor1.id,
      brand: 'Skoda',
      model: 'Slavia 1.5 TSI Monte Carlo',
      year: 2024,
      registrationNumber: 'HR26CM1111',
      category: VehicleCategory.SEDAN,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      dailyRate: 290000, // ₹2,900/day
      securityDeposit: 600000, // ₹6,000
      mileagePolicy: 'Unlimited km',
      description: '150 horsepower active cylinder technology delivers thrilling acceleration along with 5-star Global NCAP adult and child occupant crash protection.',
      pickupAddress: 'DLF Phase 2, Near Sikanderpur Metro',
      city: 'Gurgaon',
      state: 'Haryana',
      rating: 4.84,
      totalTrips: 29,
      images: [
        { url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['5-Star Safety Rating', 'Ventilated Front Seats', '10-inch Touchscreen', 'Cylinder Deactivation', 'Electric Sunroof'],
    },
    // 12. Premium Electric Sedan - Delhi
    {
      vendorId: vendor1.id,
      brand: 'BYD',
      model: 'Seal Premium Long Range',
      year: 2024,
      registrationNumber: 'DL01CN1212',
      category: VehicleCategory.ELECTRIC,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.ELECTRIC,
      seatingCapacity: 5,
      dailyRate: 750000, // ₹7,500/day
      securityDeposit: 1500000, // ₹15,000
      mileagePolicy: '400 km/day included',
      description: 'Futuristic electric sport saloon with 650 km range, 0-100 in 5.9 seconds, rotating 15.6-inch touchscreen, and revolutionary Blade battery architecture.',
      pickupAddress: 'Barakhamba Road, Connaught Place',
      city: 'Delhi',
      state: 'Delhi',
      rating: 4.97,
      totalTrips: 15,
      images: [
        { url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['650 km Range', 'Blade Battery', 'Rotating Screen', 'Dynaudio Sound', 'Panoramic Glass Roof', 'Head-Up Display'],
    },
    // 13. Economical City Hatchback - Delhi
    {
      vendorId: vendor2.id,
      brand: 'Maruti Suzuki',
      model: 'Swift ZXi AMT',
      year: 2024,
      registrationNumber: 'DL06CP1313',
      category: VehicleCategory.HATCHBACK,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      dailyRate: 180000, // ₹1,800/day
      securityDeposit: 400000, // ₹4,000
      mileagePolicy: 'Unlimited km',
      description: 'The all-new generation Swift with brand new Z-series 3-cylinder engine. Peppy, agile, and returning an astonishing 25.75 kmpl in city traffic.',
      pickupAddress: 'Lajpat Nagar Central Market',
      city: 'Delhi',
      state: 'Delhi',
      rating: 4.65,
      totalTrips: 60,
      images: [
        { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['6 Airbags Standard', 'Wireless Android Auto', 'Rear Parking Camera', 'LED Projector Lamps', 'Keyless Push Start'],
    },
    // 14. Rugged Offroader - Jaipur
    {
      vendorId: vendor2.id,
      brand: 'Mahindra',
      model: 'Scorpio-N Z8L 4WD',
      year: 2023,
      registrationNumber: 'RJ14CQ1414',
      category: VehicleCategory.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seatingCapacity: 7,
      dailyRate: 460000, // ₹4,600/day
      securityDeposit: 1000000, // ₹10,000
      mileagePolicy: 'Unlimited km',
      description: 'The Big Daddy of SUVs. 4XPLOR terrain modes for sand, mud, and gravel with Sony 12-speaker 3D immersive sound system for royal desert expeditions.',
      pickupAddress: 'Vaishali Nagar, Main Amrapali Circle',
      city: 'Jaipur',
      state: 'Rajasthan',
      rating: 4.86,
      totalTrips: 38,
      images: [
        { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['4XPLOR Intelligent Terrain', 'Sony 3D Sound', 'Captain Seats', 'Wireless Charging', 'Dual Front & Rear Cameras'],
    },
    // 15. Compact Premium SUV - Chandigarh
    {
      vendorId: vendor1.id,
      brand: 'Kia',
      model: 'Seltos X-Line 1.5 Turbo DCT',
      year: 2024,
      registrationNumber: 'CH01CR1515',
      category: VehicleCategory.SUV,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      seatingCapacity: 5,
      dailyRate: 350000, // ₹3,500/day
      securityDeposit: 750000, // ₹7,500
      mileagePolicy: 'Unlimited km',
      description: 'Exclusive Matte Graphite finish with sage green leatherette interiors. Dual 10.25-inch curved cockpit screens, ventilated seats, and Bose audio.',
      pickupAddress: 'Elante Mall Commercial Zone',
      city: 'Chandigarh',
      state: 'Punjab',
      rating: 4.89,
      totalTrips: 27,
      images: [
        { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['Dual Panoramic Displays', 'Bose 8-Speaker Audio', 'Matte Finish Exterior', 'Level 2 ADAS', 'Paddle Shifters'],
    },
    // 16. Luxury Convertible / Grand Tourer - Delhi
    {
      vendorId: vendor1.id,
      brand: 'Mercedes-Benz',
      model: 'E-Class E350d Exclusive',
      year: 2024,
      registrationNumber: 'DL01CS1616',
      category: VehicleCategory.LUXURY,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      seatingCapacity: 5,
      dailyRate: 1200000, // ₹12,000/day
      securityDeposit: 2500000, // ₹25,000
      mileagePolicy: '300 km/day included',
      description: 'The undisputed master of executive comfort. Long wheelbase limousine with 37-degree reclining rear seats, soft-close doors, and Burmester surround sound.',
      pickupAddress: 'The Chanakya, Chanakyapuri Diplomatic Enclave',
      city: 'Delhi',
      state: 'Delhi',
      rating: 4.98,
      totalTrips: 20,
      images: [
        { url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80', isPrimary: true, order: 0 },
        { url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=80', isPrimary: false, order: 1 },
      ],
      features: ['Reclining Rear Seats', 'Burmester Surround Sound', 'Soft Close Doors', 'Air Suspension', 'Chauffeur Package'],
    },
  ];

  const createdVehicles = [];
  for (const v of vehiclesData) {
    const { images, features, ...vData } = v;
    const vehicle = await prisma.vehicle.create({
      data: {
        ...vData,
        images: {
          create: images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            order: img.order,
          })),
        },
        features: {
          create: features.map((feat) => ({
            name: feat,
          })),
        },
      },
      include: { images: true, features: true },
    });
    createdVehicles.push(vehicle);
  }
  console.log(`✅ Seeded ${createdVehicles.length} vehicles with images and features`);

  // 7. Create Sample Bookings in diverse lifecycle states
  // Booking 1: CONFIRMED (Future booking for Aarav)
  const bmw = createdVehicles[0]; // BMW X5
  const startDate1 = new Date();
  startDate1.setDate(startDate1.getDate() + 5);
  startDate1.setHours(10, 0, 0, 0);
  const endDate1 = new Date(startDate1);
  endDate1.setDate(endDate1.getDate() + 3);
  endDate1.setHours(18, 0, 0, 0);

  const days1 = 3;
  const baseRate1 = bmw.dailyRate;
  const baseAmount1 = baseRate1 * days1;
  const taxes1 = Math.round(baseAmount1 * 0.18);
  const deposit1 = bmw.securityDeposit;
  const platformFee1 = 50000; // Rs 500
  const totalAmount1 = baseAmount1 + taxes1 + deposit1 + platformFee1;
  const vendorEarnings1 = baseAmount1 - Math.round(baseAmount1 * 0.10);

  const booking1 = await prisma.booking.create({
    data: {
      bookingCode: 'DRV-2026-1001',
      customerId: customer1.id,
      vendorId: bmw.vendorId,
      vehicleId: bmw.id,
      pickupLocation: 'Aerocity Hospitality District, IGI Airport, Delhi',
      returnLocation: 'Aerocity Hospitality District, IGI Airport, Delhi',
      startDate: startDate1,
      endDate: endDate1,
      rentalDays: days1,
      baseRate: baseRate1,
      baseAmount: baseAmount1,
      taxesAmount: taxes1,
      securityDeposit: deposit1,
      platformFee: platformFee1,
      totalAmount: totalAmount1,
      vendorEarnings: vendorEarnings1,
      status: BookingStatus.CONFIRMED,
      statusHistory: {
        create: [
          { fromStatus: BookingStatus.PENDING_PAYMENT, toStatus: BookingStatus.CONFIRMED, changedById: customer1.id, notes: 'Payment confirmed via Razorpay test order' },
        ],
      },
      payments: {
        create: {
          razorpayOrderId: 'order_test_DRV1001',
          razorpayPaymentId: 'pay_test_DRV1001_success',
          razorpaySignature: 'simulated_valid_signature_1001',
          amount: totalAmount1,
          currency: 'INR',
          status: PaymentStatus.SUCCESS,
          idempotencyKey: 'idem_DRV1001_pay',
          verifiedAt: new Date(),
        },
      },
    },
  });

  // Booking 2: ACTIVE (Ongoing rental right now for Priya)
  const creta = createdVehicles[6]; // Hyundai Creta
  const startDate2 = new Date();
  startDate2.setDate(startDate2.getDate() - 1);
  startDate2.setHours(9, 0, 0, 0);
  const endDate2 = new Date();
  endDate2.setDate(endDate2.getDate() + 2);
  endDate2.setHours(20, 0, 0, 0);

  const days2 = 3;
  const baseRate2 = creta.dailyRate;
  const baseAmount2 = baseRate2 * days2;
  const taxes2 = Math.round(baseAmount2 * 0.18);
  const deposit2 = creta.securityDeposit;
  const platformFee2 = 50000;
  const totalAmount2 = baseAmount2 + taxes2 + deposit2 + platformFee2;
  const vendorEarnings2 = baseAmount2 - Math.round(baseAmount2 * 0.10);

  await prisma.booking.create({
    data: {
      bookingCode: 'DRV-2026-1002',
      customerId: customer2.id,
      vendorId: creta.vendorId,
      vehicleId: creta.id,
      pickupLocation: 'Advant Navis Business Park, Sector 142, Noida',
      returnLocation: 'Advant Navis Business Park, Sector 142, Noida',
      startDate: startDate2,
      endDate: endDate2,
      rentalDays: days2,
      baseRate: baseRate2,
      baseAmount: baseAmount2,
      taxesAmount: taxes2,
      securityDeposit: deposit2,
      platformFee: platformFee2,
      totalAmount: totalAmount2,
      vendorEarnings: vendorEarnings2,
      status: BookingStatus.ACTIVE,
      startOdometer: 14280,
      statusHistory: {
        create: [
          { fromStatus: BookingStatus.PENDING_PAYMENT, toStatus: BookingStatus.CONFIRMED, changedById: customer2.id, notes: 'Payment completed' },
          { fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.ACTIVE, changedById: vendorUser2.id, notes: 'Vehicle handed over to customer with clean inspection' },
        ],
      },
      payments: {
        create: {
          razorpayOrderId: 'order_test_DRV1002',
          razorpayPaymentId: 'pay_test_DRV1002_success',
          razorpaySignature: 'simulated_valid_signature_1002',
          amount: totalAmount2,
          currency: 'INR',
          status: PaymentStatus.SUCCESS,
          idempotencyKey: 'idem_DRV1002_pay',
          verifiedAt: new Date(),
        },
      },
    },
  });

  // Booking 3: COMPLETED with verified Customer Review (Past rental for Rohan)
  const thar = createdVehicles[3]; // Thar 4x4
  const startDate3 = new Date();
  startDate3.setDate(startDate3.getDate() - 10);
  const endDate3 = new Date();
  endDate3.setDate(endDate3.getDate() - 7);

  const days3 = 3;
  const baseRate3 = thar.dailyRate;
  const baseAmount3 = baseRate3 * days3;
  const taxes3 = Math.round(baseAmount3 * 0.18);
  const deposit3 = thar.securityDeposit;
  const platformFee3 = 50000;
  const totalAmount3 = baseAmount3 + taxes3 + deposit3 + platformFee3;
  const vendorEarnings3 = baseAmount3 - Math.round(baseAmount3 * 0.10);

  const booking3 = await prisma.booking.create({
    data: {
      bookingCode: 'DRV-2026-1003',
      customerId: customer3.id,
      vendorId: thar.vendorId,
      vehicleId: thar.id,
      pickupLocation: 'Sector 29 Market Hub, Gurgaon',
      returnLocation: 'Sector 29 Market Hub, Gurgaon',
      startDate: startDate3,
      endDate: endDate3,
      rentalDays: days3,
      baseRate: baseRate3,
      baseAmount: baseAmount3,
      taxesAmount: taxes3,
      securityDeposit: deposit3,
      platformFee: platformFee3,
      totalAmount: totalAmount3,
      vendorEarnings: vendorEarnings3,
      status: BookingStatus.COMPLETED,
      startOdometer: 22100,
      returnOdometer: 22850,
      statusHistory: {
        create: [
          { fromStatus: BookingStatus.PENDING_PAYMENT, toStatus: BookingStatus.CONFIRMED, changedById: customer3.id, notes: 'Payment completed' },
          { fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.ACTIVE, changedById: vendorUser1.id, notes: 'Handed over' },
          { fromStatus: BookingStatus.ACTIVE, toStatus: BookingStatus.COMPLETED, changedById: vendorUser1.id, notes: 'Returned in pristine condition, security deposit released' },
        ],
      },
      payments: {
        create: {
          razorpayOrderId: 'order_test_DRV1003',
          razorpayPaymentId: 'pay_test_DRV1003_success',
          razorpaySignature: 'simulated_valid_signature_1003',
          amount: totalAmount3,
          currency: 'INR',
          status: PaymentStatus.SUCCESS,
          idempotencyKey: 'idem_DRV1003_pay',
          verifiedAt: startDate3,
        },
      },
      review: {
        create: {
          vehicleId: thar.id,
          vendorId: thar.vendorId,
          customerId: customer3.id,
          rating: 5,
          comment: 'Fantastic experience renting the Thar for a weekend trip to Kasauli! The car was spotlessly clean, tires in great condition, and pickup was seamless.',
        },
      },
    },
  });

  // Booking 4: CANCELLED & REFUNDED for Customer 1
  const cityCar = createdVehicles[7]; // Honda City
  const startDate4 = new Date();
  startDate4.setDate(startDate4.getDate() - 4);
  const endDate4 = new Date();
  endDate4.setDate(endDate4.getDate() - 2);

  const days4 = 2;
  const baseRate4 = cityCar.dailyRate;
  const baseAmount4 = baseRate4 * days4;
  const taxes4 = Math.round(baseAmount4 * 0.18);
  const deposit4 = cityCar.securityDeposit;
  const platformFee4 = 50000;
  const totalAmount4 = baseAmount4 + taxes4 + deposit4 + platformFee4;
  const vendorEarnings4 = baseAmount4 - Math.round(baseAmount4 * 0.10);

  const booking4 = await prisma.booking.create({
    data: {
      bookingCode: 'DRV-2026-1004',
      customerId: customer1.id,
      vendorId: cityCar.vendorId,
      vehicleId: cityCar.id,
      pickupLocation: 'Janakpuri West Metro Complex, Delhi',
      returnLocation: 'Janakpuri West Metro Complex, Delhi',
      startDate: startDate4,
      endDate: endDate4,
      rentalDays: days4,
      baseRate: baseRate4,
      baseAmount: baseAmount4,
      taxesAmount: taxes4,
      securityDeposit: deposit4,
      platformFee: platformFee4,
      totalAmount: totalAmount4,
      vendorEarnings: vendorEarnings4,
      status: BookingStatus.REFUNDED,
      cancellationReason: 'Trip plans changed due to urgent office travel',
      cancelledAt: new Date(startDate4.getTime() - 2 * 86400000),
      statusHistory: {
        create: [
          { fromStatus: BookingStatus.PENDING_PAYMENT, toStatus: BookingStatus.CONFIRMED, changedById: customer1.id, notes: 'Paid' },
          { fromStatus: BookingStatus.CONFIRMED, toStatus: BookingStatus.CANCELLED, changedById: customer1.id, notes: 'Cancelled by customer 48h prior' },
          { fromStatus: BookingStatus.CANCELLED, toStatus: BookingStatus.REFUNDED, changedById: admin.id, notes: '100% refund processed via Razorpay' },
        ],
      },
      payments: {
        create: {
          razorpayOrderId: 'order_test_DRV1004',
          razorpayPaymentId: 'pay_test_DRV1004_success',
          razorpaySignature: 'simulated_valid_signature_1004',
          amount: totalAmount4,
          currency: 'INR',
          status: PaymentStatus.REFUNDED,
          idempotencyKey: 'idem_DRV1004_pay',
          verifiedAt: startDate4,
        },
      },
    },
  });

  // Attach refund record
  const payment4 = await prisma.payment.findFirst({ where: { bookingId: booking4.id } });
  if (payment4) {
    await prisma.refund.create({
      data: {
        bookingId: booking4.id,
        paymentId: payment4.id,
        razorpayRefundId: 'rfnd_test_DRV1004_processed',
        amount: totalAmount4,
        reason: 'Customer cancelled > 24h before trip start (full refund policy)',
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });
  }

  // 8. Add Wishlist and Notifications
  await prisma.wishlist.create({
    data: {
      userId: customer1.id,
      vehicleId: createdVehicles[1].id, // Mercedes C-Class
    },
  });
  await prisma.wishlist.create({
    data: {
      userId: customer1.id,
      vehicleId: createdVehicles[11].id, // BYD Seal
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        title: 'Booking Confirmed!',
        message: 'Your booking DRV-2026-1001 for BMW X5 M Sport has been confirmed. View pickup instructions in your dashboard.',
        type: 'BOOKING',
      },
      {
        userId: vendorUser1.id,
        title: 'New Confirmed Booking',
        message: 'Aarav Sharma has reserved your BMW X5 for 3 days starting next week.',
        type: 'BOOKING',
      },
      {
        userId: vendorUser2.id,
        title: 'Active Trip In Progress',
        message: 'Hyundai Creta (UP16CH7007) is currently out with customer Priya Patel.',
        type: 'BOOKING',
      },
    ],
  });

  // 9. Add Support Ticket for Demo
  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TKT-2026-001',
      userId: customer2.id,
      subject: 'Inquiry regarding fast-tag toll recharges',
      message: 'Hello Drivio support, does the rental vehicle include pre-installed FASTag for Delhi-Mumbai expressway tolls, or should we pay in cash?',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      response: 'Hi Priya, all Drivio rental vehicles are equipped with active commercial FASTag. Any toll deductions will be transparently reconciled against your security deposit or billed on return at exact government rates with zero surcharge.',
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

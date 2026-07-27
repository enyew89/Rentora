// ─── Rentora mock data ────────────────────────────────────────────────────────
// Replace these with real API calls (useEffect + fetch) once your backend is ready.

export const mockProperties = [
  {
    _id: "p1",
    name: "Apartment 23",
    address: "Bole, Addis Ababa",
    description: "Modern apartment building near CMC Road.",
    type: "Apartment Building",
    totalUnits: 12,
    occupiedUnits: 10,
    vacantUnits: 2,
  },
  {
    _id: "p2",
    name: "Sunrise Apartments",
    address: "Kazanchis, Addis Ababa",
    description: "Well-maintained complex close to Ring Road.",
    type: "Apartment Building",
    totalUnits: 8,
    occupiedUnits: 7,
    vacantUnits: 1,
  },
  {
    _id: "p3",
    name: "Green Villa",
    address: "Megenagna, Addis Ababa",
    description: "Quiet residential compound with parking.",
    type: "Villa",
    totalUnits: 4,
    occupiedUnits: 2,
    vacantUnits: 2,
  },
];

export const mockUnits = {
  p1: [
    { _id: "u101", unitNumber: "101", floor: 1, bedrooms: 2, bathrooms: 1, rentAmount: 5000, status: "Occupied", renter: { name: "Abebe Bekele", email: "abebe@email.com", leaseStart: "2026-01-01" } },
    { _id: "u102", unitNumber: "102", floor: 1, bedrooms: 1, bathrooms: 1, rentAmount: 3500, status: "Vacant",   renter: null },
    { _id: "u103", unitNumber: "103", floor: 2, bedrooms: 3, bathrooms: 2, rentAmount: 7000, status: "Occupied", renter: { name: "Hiwot Girma",  email: "hiwot@email.com",  leaseStart: "2025-09-01" } },
    { _id: "u104", unitNumber: "104", floor: 2, bedrooms: 2, bathrooms: 1, rentAmount: 5000, status: "Occupied", renter: { name: "Yonas Tadesse",email: "yonas@email.com",  leaseStart: "2026-03-01" } },
  ],
  p2: [
    { _id: "u201", unitNumber: "201", floor: 1, bedrooms: 2, bathrooms: 1, rentAmount: 4500, status: "Occupied", renter: { name: "Sara Alemu",   email: "sara@email.com",   leaseStart: "2026-02-01" } },
    { _id: "u202", unitNumber: "202", floor: 1, bedrooms: 1, bathrooms: 1, rentAmount: 3000, status: "Vacant",   renter: null },
    { _id: "u203", unitNumber: "203", floor: 2, bedrooms: 2, bathrooms: 2, rentAmount: 5500, status: "Occupied", renter: { name: "Dawit Haile",  email: "dawit@email.com",  leaseStart: "2025-11-01" } },
  ],
  p3: [
    { _id: "u301", unitNumber: "301", floor: 1, bedrooms: 3, bathrooms: 2, rentAmount: 8000, status: "Vacant",   renter: null },
    { _id: "u302", unitNumber: "302", floor: 1, bedrooms: 2, bathrooms: 1, rentAmount: 5500, status: "Occupied", renter: { name: "Liya Teklu",   email: "liya@email.com",   leaseStart: "2026-04-01" } },
  ],
};

export const mockPayments = [
  { _id: "pay1", renter: "Abebe Bekele",  unit: "Unit 101 · Apartment 23",     amount: 5000, date: "Jul 23, 2026", status: "Paid" },
  { _id: "pay2", renter: "Hiwot Girma",   unit: "Unit 103 · Apartment 23",     amount: 7000, date: "Jul 22, 2026", status: "Paid" },
  { _id: "pay3", renter: "Sara Alemu",    unit: "Unit 201 · Sunrise Apartments",amount: 4500, date: "Jul 20, 2026", status: "Pending" },
  { _id: "pay4", renter: "Yonas Tadesse", unit: "Unit 104 · Apartment 23",     amount: 5000, date: "Jul 18, 2026", status: "Paid" },
  { _id: "pay5", renter: "Dawit Haile",   unit: "Unit 203 · Sunrise Apartments",amount: 5500, date: "Jul 15, 2026", status: "Paid" },
];

export const mockMaintenance = [
  { _id: "m1", title: "Pipe leak",        unit: "Unit 101 · Apartment 23",      date: "Jul 21", status: "Open" },
  { _id: "m2", title: "Electrical issue", unit: "Unit 203 · Sunrise Apartments", date: "Jul 19", status: "In progress" },
  { _id: "m3", title: "Door lock repair", unit: "Unit 302 · Green Villa",        date: "Jul 15", status: "Done" },
];